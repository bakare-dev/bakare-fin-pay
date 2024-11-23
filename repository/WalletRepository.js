const Repository = require("./Repository");
const WalletEntity = require("../entities/Wallet");

let instance;

class WalletRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(WalletEntity);

		instance = this;
	}

	getWalletByUserId = async (userId) => {
		return await WalletEntity.findAll({ where: { userId } });
	};

	getWalletByCurrencyId = async (currencyId, userId) => {
		return await WalletEntity.findOne({ where: { currencyId, userId } });
	};

	getWalletByUserIdAndCurency = async (userId, currencyId) => {
		return await WalletEntity.findOne({ where: { userId, currencyId } });
	};

	getWalletByName = async (name, currencyId) => {
		return await WalletEntity.findOne({
			where: { wallet: name, currencyId: currencyId },
		});
	};
}

module.exports = WalletRepository;
