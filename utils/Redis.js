const Redis = require("redis");
const { infrastructure } = require("../config/main.settings");
const Logger = require("./Logger");

let instance;
class RedisHelper {
	#client;
	#logger;

	constructor() {
		if (instance) return instance;

		this.#client = Redis.createClient({
			// password: infrastructure.redis.password,
			socket: {
				host: infrastructure.redis.url,
				port: infrastructure.redis.port,
			},
		});

		this.#logger = new Logger().getLogger();

		instance = this;
	}

	connect = async () => {
		await this.#client
			.connect()
			.then(() =>
				this.#logger.info("bakare-fin-pay-server connected to redis")
			);
	};

	getClient = () => this.#client;
}

module.exports = RedisHelper;
