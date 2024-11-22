const Logger = require("../utils/Logger");
const UserRepository = require("../repository/UserRepository");
const UserProfileRepository = require("../repository/UserProfileRepository");
const WalletRepository = require("../repository/WalletRepository");

let instance;

class WalletService {
	#logger;
	#userrepository;
	#userprofilerepository;
	#walletrepository;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();

		this.#userrepository = new UserRepository();

		this.#userprofilerepository = new UserProfileRepository();

		this.#walletrepository = new WalletRepository();

		instance = this;
	}

	createwallet = async (userId, callback) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};
}

module.exports = WalletService;
