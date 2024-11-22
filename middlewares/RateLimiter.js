const { security } = require("../config/main.settings");
const Authenticator = require("../utils/Authentication");

let instance;

class RateLimiter {
	#ipRequestCount;
	#rateLimitWindowMs;
	#maxRequestsPerWindow;

	constructor() {
		if (instance) return instance;

		this.#rateLimitWindowMs = 30000;

		this.#maxRequestsPerWindow = 10;

		this.#ipRequestCount = new Map();

		instance = this;
	}

	checkRateLimit = (req, res, next) => {
		const ip = req.ip;
		const currentTime = Date.now();
		const ipRequests = this.#ipRequestCount.get(ip) || [];
		this.#ipRequestCount.set(ip, ipRequests);

		this.#ipRequestCount.set(
			ip,
			ipRequests.filter(
				(timestamp) => currentTime - timestamp < this.#rateLimitWindowMs
			)
		);

		if (ipRequests.length > this.#maxRequestsPerWindow) {
			return res.status(429).json({ error: "Try Again Later" });
		}

		ipRequests.push(currentTime);

		next();
	};
}

module.exports = RateLimiter;
