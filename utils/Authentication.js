const jwt = require("jsonwebtoken");
const { security } = require("../config/main.settings");
const CacheService = require("../services/CacheService");

let instance;

class Authenticate {
	#key;
	#cacheService;

	constructor() {
		if (instance) return instance;

		this.#key = security.jwtSecret;
		this.#cacheService = new CacheService();

		instance = this;
	}

	generateToken = async (userId, type) => {
		const now = new Date();

		const accessTokenExpiresIn = new Date(now.getTime() + 3600 * 1000);
		const accessToken = jwt.sign({ userId, type }, this.#key, {
			expiresIn: "1h",
		});

		await this.#cacheService.set(
			`access-token-${userId}`,
			accessToken,
			3600
		);

		return {
			accessToken: {
				token: accessToken,
				expiresIn: accessTokenExpiresIn.toISOString(),
			},
		};
	};

	validateToken = async (authHeader) => {
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedException("Unauthorized");
		}

		const token = authHeader.split(" ")[1];

		try {
			const decoded = jwt.verify(token, this.#key);

			const cachedToken = await this.#cacheService.get(
				`access-token-${decoded.userId}`
			);

			if (!cachedToken || cachedToken != token) {
				return {
					isAuth: false,
				};
			}
			return {
				isAuth: true,
				userId: decoded.userId,
				type: decoded.type,
			};
		} catch (error) {
			return {
				isAuth: false,
			};
		}
	};

	logout = async (userId) => {
		await this.#cacheService.del(`access-token-${userId}`);
	};

	generateOtp = async (userId) => {
		const cachedOtp = await this.#cacheService.get(`otp-${userId}`);

		if (cachedOtp) {
			this.#cacheService.del(`otp-${userId}`);
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();

		await this.#cacheService.set(`otp-${userId}`, otp, 600);
		return otp;
	};

	validateOtp = async (otp, userId) => {
		const cachedOtp = await this.#cacheService.get(`otp-${userId}`);

		if (cachedOtp && cachedOtp == otp) {
			await this.#cacheService.del(`otp-${userId}`);
			return true;
		}
		return false;
	};
}

module.exports = Authenticate;
