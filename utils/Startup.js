const Logger = require("./Logger");
const ProfileSourceRepository = require("../repository/ProfileSourceRepository");
const { server } = require("../config/main.settings");

let instance;
class Startup {
	#logger;
	#profileSourceRepository;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();
		this.#profileSourceRepository = new ProfileSourceRepository();

		instance = this;
	}

	startMigration = async () => {
		try {
			this.#logger.info("Requirement Checks Started");

			await this.#profileSourceCheck();

			this.#logger.info("Requirement checks Completed");
		} catch (err) {
			this.#logger.error(err);
			process.exit(1);
		}
	};

	#profileSourceCheck = async () => {
		try {
			const profileSources = [
				{ source: "localhost", url: "localhost" },
				{ source: "google", url: "google.com" },
				{ source: "facebook", url: "facebook.com" },
			];

			const sources =
				await this.#profileSourceRepository.getRecordCount();

			if (sources > 0) {
				this.#logger.info("profile sources existed");
				return;
			}

			const response = await this.#profileSourceRepository.insertBulk(
				profileSources
			);

			this.#logger.info("profile sources added successfully");
		} catch (err) {
			this.#logger.error(err);
			return;
		}
	};
}

module.exports = Startup;
