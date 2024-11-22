const Repository = require("./Repository");
const TransactionEntity = require("../entities/Transaction");

let instance;

class TransactionRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(TransactionEntity);

		instance = this;
	}
}

module.exports = TransactionRepository;
