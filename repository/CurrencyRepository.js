const Repository = require("./Repository");
const CurrencyEntity = require("../entities/Currency");

let instance;

class CurrencyRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(CurrencyEntity);

		instance = this;
	}

	getCurrencybyCountry = async (country) => {
		return await CurrencyEntity.findOne({
			where: {
				country,
			},
		});
	};

	getCurrencies = async () => {
		return await CurrencyEntity.findAll();
	};
}

module.exports = CurrencyRepository;
