const Repository = require("./Repository");
const BvnEntity = require("../entities/Bvn");

let instance;

class BvnRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(BvnEntity);

		instance = this;
	}
}

module.exports = BvnRepository;
