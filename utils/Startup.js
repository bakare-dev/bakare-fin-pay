const Logger = require("./Logger");
const ProfileSourceRepository = require("../repository/ProfileSourceRepository");
const { server } = require("../config/main.settings");
const CurrencyRepository = require("../repository/CurrencyRepository");

let instance;
class Startup {
	#logger;
	#profileSourceRepository;
	#currencyRepository;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();
		this.#profileSourceRepository = new ProfileSourceRepository();
		this.#currencyRepository = new CurrencyRepository();

		instance = this;
	}

	startMigration = async () => {
		try {
			this.#logger.info("Requirement Checks Started");

			await this.#profileSourceCheck();

			await this.#addCurrency();

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

	#addCurrency = async () => {
		try {
			const currencies = [
				{
					name: "Naira",
					country: "NGN",
					symbol: "₦",
				},
				{
					name: "US Dollar",
					country: "USD",
					symbol: "$",
				},
			];

			for (const currency of currencies) {
				const doesCurrencyExists =
					await this.#currencyRepository.getCurrencybyCountry(
						currency.country
					);

				if (doesCurrencyExists) {
					this.#logger.info(`${currency.symbol} existed`);
					continue;
				}

				await this.#currencyRepository.create(currency);

				this.#logger.info(`${currency.symbol} added`);
			}
		} catch (err) {
			this.#logger.error(err);
			return;
		}
	};
}

module.exports = Startup;
