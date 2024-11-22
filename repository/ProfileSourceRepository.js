const Repository = require("./Repository");
const ProfileSourceEntity = require("../entities/ProfileSource");

let instance;

class ProfileSourceRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(ProfileSourceEntity);

		instance = this;
	}
}

module.exports = ProfileSourceRepository;
