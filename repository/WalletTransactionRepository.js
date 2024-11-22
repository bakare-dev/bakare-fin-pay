const Repository = require("./Repository");
const WalletTransactionEntity = require("../entities/WalletTransaction");

let instance;

class WalletTransactionRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(WalletTransactionEntity);

		instance = this;
	}
}

module.exports = WalletTransactionRepository;
