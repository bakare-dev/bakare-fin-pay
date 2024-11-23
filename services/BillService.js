const Logger = require("../utils/Logger");
const UserRepository = require("../repository/UserRepository");
const UserProfileRepository = require("../repository/UserProfileRepository");

let instance;

class BillService {
	#logger;
	#userrepository;
	#userprofilerepository;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();

		this.#userrepository = new UserRepository();

		this.#userprofilerepository = new UserProfileRepository();

		instance = this;
	}

	getDataPlans = async (userId, callback) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	buyData = async (userId, callback) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	buyAirtime = async (userId, callback) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	initiateBillPayment = async (userId, callback) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	completeBillPayment = async (userId, callback) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};
}

module.exports = BillService;
