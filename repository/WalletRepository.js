const Repository = require("./Repository");
const WalletEntity = require("../entities/Wallet");

let instance;

class WalletRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(WalletEntity);

		instance = this;
	}
}

module.exports = WalletRepository;
