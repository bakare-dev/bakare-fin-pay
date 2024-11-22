const { security } = require("../config/main.settings");
const Authenticator = require("../utils/Authentication");

let instance;

class RouteProtector {
	#unprotectedRoutes;
	#authenticator;

	constructor() {
		if (instance) return instance;

		this.#unprotectedRoutes = security.unprotectedRoutes;
		this.#authenticator = new Authenticator();

		instance = this;
	}

	use = async (req, res, next) => {
		const isUnprotected = this.#unprotectedRoutes.some((route) =>
			req.originalUrl.startsWith(route)
		);

		if (isUnprotected) {
			return next();
		}

		const authHeader = req.headers["authorization"];
		try {
			const decoded = await this.#authenticator.validateToken(authHeader);

			if (!decoded.isAuth) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			req.isAuth = decoded.isAuth;

			req.userId = decoded.userId;

			req.type = decoded.type;

			next();
		} catch (error) {
			return res.status(401).json({ message: "Unauthorized" });
		}
	};
}

module.exports = RouteProtector;
