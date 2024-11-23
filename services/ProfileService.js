const Logger = require("../utils/Logger");
const UserRepository = require("../repository/UserRepository");
const UserProfileRepository = require("../repository/UserProfileRepository");
const BeneficiaryRepository = require("../repository/BeneficiaryRepository");
const WalletService = require("./WalletService");

let instance;

class ProfileService {
	#logger;
	#userrepository;
	#userprofilerepository;
	#beneficiaryrepository;
	#walletservice;
	#monoService;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();

		this.#userrepository = new UserRepository();

		this.#userprofilerepository = new UserProfileRepository();

		this.#beneficiaryrepository = new BeneficiaryRepository();

		this.#walletservice = new WalletService();


		instance = this;
	}

	createprofile = async (payload, userId, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);

			if (!user) {
				return callback({
					status: 404,
					error: "User not found",
				});
			}

			payload.userId = user.id;

			const phoneNoInUse =
				await this.#userprofilerepository.findByPhoneNumber(
					payload.phoneNumber
				);

			if (phoneNoInUse) {
				return callback({
					status: 409,
					error: "Phone number already in use",
				});
			}

			const userprofile = await this.#userprofilerepository.findByUserId(
				user.id
			);

			if (userprofile) {
				return callback({
					status: 409,
					error: "Profile already created",
				});
			}

			const profile = await this.#userprofilerepository.create(payload);

			if (!profile.id) {
				return callback({
					status: 400,
					error: "Profile Creation Failed, Try again later",
				});
			}

			await this.#walletservice.createWallet(user.id, (resp) => {});

			callback({
				status: 201,
				message: "Profile Created Successfully",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	updateprofile = async (payload, userId, callback) => {
		try {
			const profile = await this.#userprofilerepository.findByUserId(
				userId
			);

			if (!profile) {
				return callback({
					status: 404,
					error: "User not found",
				});
			}

			const updatedprofile = await this.#userprofilerepository.update(
				profile.id,
				payload
			);

			if (updatedprofile[0] != 1) {
				return callback({
					status: 400,
					error: "Profile Update Failed, Try again later",
				});
			}

			callback({
				status: 200,
				message: "Profile Updated Successfully",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	getprofile = async (userId, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);

			if (!user) {
				return callback({
					status: 404,
					error: "User not found",
				});
			}

			const profile = await this.#userprofilerepository.findByUserId(
				userId
			);

			callback({
				status: 200,
				data: {
					firstName: profile.firstName,
					lastName: profile.lastName,
					phoneNumber: profile.phoneNumber,
					emailAddress: user.emailAddress,
					type: user.type,
					pictureUrl: profile.pictureUrl,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	addBeneficiary = async (userId, payload, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);

			if (!user) {
				return callback({
					status: 404,
					error: "User not found",
				});
			}

			payload.userId = user.id;

			const beneficiary = await this.#beneficiaryrepository.create(
				payload
			);

			if (!beneficiary.id) {
				if (beneficiary.error == "Resource already exists") {
					return callback({
						status: 409,
						error: "Beneficiary with this account number existed",
					});
				} else {
					return callback({
						status: 400,
						error: "Beneficiary creation failed",
					});
				}
			}

			callback({
				status: 201,
				message: "Beneficiary added",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	searchBeneficiary = async (userId, searchvalue, callback) => {
		try {
			const beneficiaries =
				await this.#beneficiaryrepository.searchBeneficiaries({
					userId,
					searchvalue,
					page: 0,
					size: 50,
				});

			callback({
				status: 200,
				data: {
					beneficiaries,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	deleteBeneficiary = async (userId, beneficiaryId, callback) => {
		try {
			const beneficiary =
				await this.#beneficiaryrepository.getBeneficiary({
					userId,
					beneficiaryId,
				});

			if (!beneficiary) {
				return callback({
					status: 404,
					error: "Beneficiary not Found",
				});
			}

			const deletedbeneficiary = await this.#beneficiaryrepository.delete(
				beneficiary.id
			);

			if (deletedbeneficiary != 1) {
				return callback({
					status: 400,
					error: "Beneficiary Deletion Failedd",
				});
			}

			callback({
				status: 200,
				message: "Beneficiary Deleted",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	getBeneficiaries = async (userId, callback) => {
		try {
			const beneficiaries =
				await this.#beneficiaryrepository.getBeneficiaries({
					userId,
					page: 0,
					size: 50,
				});

			callback({
				status: 200,
				data: {
					beneficiaries,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

}

module.exports = ProfileService;
