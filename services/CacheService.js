const Logger = require("../utils/Logger");
const RedisHelper = require("../utils/Redis");

let instance;

class CacheService {
	#client;
	#logger;

	constructor() {
		if (instance) return instance;

		this.#client = new RedisHelper().getClient();

		this.#logger = new Logger().getLogger();

		instance = this;
	}

	set = async (key, payload, ex) => {
		try {
			await this.#client.setEx(key, ex, JSON.stringify(payload));
		} catch (error) {
			this.#logger.error("Error setting cache:", error);
			throw error;
		}
	};

	get = async (key) => {
		try {
			const data = await this.#client.get(key);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			this.#logger.error("Error getting from cache:", error);
			throw error;
		}
	};

	del = async (key) => {
		try {
			await this.#client.del(key);
		} catch (error) {
			this.#logger.error("Error deleting from cache:", error);
			throw error;
		}
	};
}

module.exports = CacheService;
