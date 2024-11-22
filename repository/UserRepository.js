const Repository = require("./Repository");
const UserEntity = require("../entities/User");

let instance;

class UserRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(UserEntity);

		instance = this;
	}

	findbyemail = async (email) => {
		return await UserEntity.findOne({
			where: {
				emailAddress: email,
			},
		});
	};
}

module.exports = UserRepository;
