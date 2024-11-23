const Repository = require("./Repository");
const UserProfileEntity = require("../entities/UserProfile");

let instance;

class UserProfileRepository extends Repository {
	constructor() {
		if (instance) return instance;

		super(UserProfileEntity);

		instance = this;
	}

	findByUserId = async (userId) => {
		return await UserProfileEntity.findOne({
			where: {
				userId,
			},
		});
	};

	findByPhoneNumber = async (phoneNumber) => {
		return await UserProfileEntity.findOne({
			where: {
				phoneNumber,
			},
		});
	};
}

module.exports = UserProfileRepository;
