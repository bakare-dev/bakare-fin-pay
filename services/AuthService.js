const { server, infrastructure } = require("../config/main.settings");
const Authenticate = require("../utils/Authentication");
const Logger = require("../utils/Logger");
const UserProfileRepository = require("../repository/UserProfileRepository");
const UserRepository = require("../repository/UserRepository");
const NotificationService = require("./NotificationService");
const crypto = require("crypto");
const CacheService = require("./CacheService");

let instance;

class AuthService {
	#logger;
	#userrepository;
	#userprofilerepository;
	#baseUrl;
	#notificationService;
	#authenticator;
	#cacheService;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();

		this.#userrepository = new UserRepository();

		this.#userprofilerepository = new UserProfileRepository();

		this.#baseUrl =
			server.mode == "development"
				? infrastructure.baseUrl.development
				: infrastructure.baseUrl.production;

		this.#authenticator = new Authenticate();

		this.#notificationService = new NotificationService();

		this.#cacheService = new CacheService();

		instance = this;
	}

	createadminaccount = async (payload, callback) => {
		try {
			const adminExists = await this.#userrepository.findbyemail(
				payload.emailAddress
			);

			if (adminExists) {
				return callback({ status: 400, error: "Email already in use" });
			}

			const password = this.#generateRandomPassword();

			const salt = this.#generateSalt();

			const hashedPassword = crypto
				.pbkdf2Sync(password, salt, 10000, 64, "sha512")
				.toString("hex");

			const user = await this.#userrepository.create({
				emailAddress: payload.emailAddress,
				password: hashedPassword,
				salt,
				type: "Admin",
				activated: 1,
				profilesourceId: 1,
			});

			if (!user.id) {
				return callback({
					status: 400,
					error: "Account creation failed. Please try again or contact support if the issue persists.",
				});
			}

			const profile = await this.#userprofilerepository.create({
				firstName: payload.firstName,
				lastName: payload.lastName,
				pictureUrl:
					"https://res.cloudinary.com/dzybjyiku/image/upload/v1732189212/47c1ef85da8ba758aef568df072e8f13.png",
				phoneNumber: payload.phoneNumber,
				userId: user.id,
			});

			if (!profile.id) {
				this.#userrepository.delete(user.id);
				return callback({
					status: 400,
					error: "Account creation failed. Please try again or contact support if the issue persists.",
				});
			}

			const userNotification = {
				recipients: [`${user.emailAddress}`],
				data: {
					name: profile.firstName,
					emailAddress: payload.emailAddress,
					password,
					baseurl: this.#baseUrl,
				},
			};

			this.#notificationService.sendAdminAccountDetails(
				userNotification,
				() => {}
			);

			callback({
				status: 201,
				message: "Adminstrative Account Successfully",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	createcustomeraccount = async (payload, callback) => {
		try {
			const customerExists = await this.#userrepository.findbyemail(
				payload.emailAddress
			);

			if (customerExists) {
				return callback({
					status: 400,
					error: "Email already in use",
				});
			}

			const salt = this.#generateSalt();

			const hashedPassword = crypto
				.pbkdf2Sync(payload.password, salt, 10000, 64, "sha512")
				.toString("hex");

			const user = await this.#userrepository.create({
				emailAddress: payload.emailAddress,
				password: hashedPassword,
				salt,
				type: "Customer",
				profilesourceId: 1,
			});

			if (!user.id) {
				return callback({
					status: 400,
					error: "Account creation failed. Please try again or contact support if the issue persists.",
				});
			}

			const otp = await this.#authenticator.generateOtp(user.id);

			const userNotification = {
				recipients: [`${user.emailAddress}`],
				data: {
					otp,
				},
			};

			this.#notificationService.sendVerifyRegistration(
				userNotification,
				() => {}
			);

			callback({
				status: 201,
				message: `Check your mail(${user.emailAddress}) for OTP to activate your account`,
				data: {
					userId: user.id,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	activateAccount = async (payload, callback) => {
		try {
			const otpValid = await this.#authenticator.validateOtp(
				payload.otp,
				payload.userId
			);

			if (!otpValid) {
				return callback({
					status: 400,
					error: "Invalid/Expired Otp",
				});
			}

			const user = await this.#userrepository.findById(payload.userId);

			if (!user) {
				return callback({
					status: 400,
					error: "Invalid/Expired Otp",
				});
			}

			const updateUser = await this.#userrepository.update(user.id, {
				activated: 1,
			});

			if (updateUser[0] != 1) {
				return callback({
					status: 400,
					error: "Account activation failed. Please try again or contact support if the issue persists.",
				});
			}

			const userNotification = {
				recipients: [`${user.emailAddress}`],
				data: {},
			};

			this.#notificationService.sendAccountActivated(
				userNotification,
				() => {}
			);

			callback({
				status: 200,
				message: "Account activated successfully",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	resendOtp = async (payload, callback) => {
		try {
			const user = await this.#userrepository.findById(payload.userId);

			if (!user) {
				return callback({
					status: 404,
					error: "User not found",
				});
			}

			if (payload.type == 0) {
				if (user.activated != 0) {
					return callback({
						status: 400,
						error: "Account has been activate before",
					});
				}
			} else {
				if (user.activated != 1) {
					return callback({
						status: 400,
						error: "Please Activate your account",
						data: {
							userId: isEmailValid.id,
						},
					});
				}
			}

			const otp = await this.#authenticator.generateOtp(payload.userId);

			const userNotification = {
				recipients: [`${user.emailAddress}`],
				data: {
					otp,
				},
			};

			if (payload.type == 0) {
				this.#notificationService.sendVerifyRegistration(
					userNotification,
					() => {}
				);
			} else {
				this.#notificationService.sendInitiatePasswordChange(
					userNotification,
					() => {}
				);
			}

			callback({
				status: 200,
				message: `OTP sent to your email(${user.emailAddress})`,
				data: {
					userId: user.id,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	signin = async (payload, callback) => {
		try {
			let user = await this.#cacheService.get(
				`user-${payload.emailAddress}`
			);

			if (!user) {
				user = await this.#userrepository.findbyemail(
					payload.emailAddress
				);

				this.#cacheService.set(
					`user-${payload.emailAddress}`,
					user,
					1209000
				);
			}

			if (!user) {
				return callback({
					status: 400,
					error: "Invalid Email Address",
				});
			}

			if (user.activated == 2) {
				return callback({
					status: 400,
					error: "Account Deactivated",
				});
			}

			if (user.activated != 1) {
				return callback({
					status: 400,
					error: "Please Activate your account to continue",
					data: {
						userId: user.id,
					},
				});
			}

			const hashedpassword = crypto
				.pbkdf2Sync(payload.password, user.salt, 10000, 64, "sha512")
				.toString("hex");

			if (hashedpassword != user.password) {
				return callback({
					status: 400,
					error: "Invalid Password",
				});
			}
			const profileExists =
				await this.#userprofilerepository.findByUserId(user.id);

			const token = await this.#authenticator.generateToken(
				user.id,
				user.type
			);

			callback({
				status: 200,
				message: "Sign In Successful",
				data: {
					token,
					profile: Boolean(profileExists),
					type: user.type,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	signout = async (userId, callback) => {
		try {
			await this.#authenticator.logout(userId);

			callback({
				status: 200,
				message: "Sign out Successful",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	initiatepasswordchanage = async (emailAddress, callback) => {
		try {
			const user = await this.#userrepository.findbyemail(emailAddress);

			if (!user) {
				return callback({
					status: 404,
					error: "No account found with the provided email address. Please check and try again.",
				});
			}

			if (user.activated != 1) {
				return callback({
					status: 400,
					error: "Please Activate your account",
					data: {
						userId: isEmailValid.id,
					},
				});
			}

			const otp = await this.#authenticator.generateOtp(user.id);

			const userNotification = {
				recipients: [`${user.emailAddress}`],
				data: {
					otp,
				},
			};

			this.#notificationService.sendInitiatePasswordChange(
				userNotification,
				(resp) => {}
			);

			callback({
				status: 200,
				message: "Check your mail for otp",
				data: {
					userId: user.id,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	completepasswordchanage = async (payload, callback) => {
		try {
			const otpValid = await this.#authenticator.validateOtp(
				payload.otp,
				payload.userId
			);

			if (!otpValid) {
				return callback({
					status: 400,
					error: "Invalid/Expired Otp",
				});
			}

			const user = await this.#userrepository.findById(payload.userId);

			if (!user) {
				return callback({
					status: 400,
					error: "Invalid/Expired Otp",
				});
			}

			const salt = this.#generateSalt();

			const hashedPassword = crypto
				.pbkdf2Sync(payload.password, salt, 10000, 64, "sha512")
				.toString("hex");

			const updatePassword = await this.#userrepository.update(user.id, {
				password: hashedPassword,
				salt,
			});

			if (updatePassword[0] != 1) {
				return callback({
					status: 400,
					error: "Password Change Failed",
					data: {
						userId: user.id,
					},
				});
			}

			this.#cacheService.del(`user-${user.emailAddress}`);

			const userNotification = {
				recipients: [`${user.emailAddress}`],
				data: {},
			};

			this.#notificationService.sendCompletePasswordChange(
				userNotification,
				(resp) => {}
			);

			callback({
				status: 200,
				message: "Password Change Complete",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

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

			const profile = await this.#userprofilerepository.create(payload);

			if (!profile.id) {
				return callback({
					status: 400,
					error: "Profile Creation Failed, Try again later",
				});
			}

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

	deactivateAccount = async (userId, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);

			if (!user) {
				return callback({
					status: 400,
					error: "Invalid/Expired Otp",
				});
			}

			const updateduser = await this.#userrepository.update(user.id, {
				activated: 2,
			});

			if (updateduser[0] != 1) {
				return callback({
					status: 400,
					error: "Account Deactivation Failed, Try Again later",
				});
			}

			const userNotification = {
				recipients: [`${user.emailAddress}`],
				data: {},
			};

			this.#notificationService.sendAccountDeactivated(
				userNotification,
				(resp) => {}
			);

			this.#cacheService.del(`user-${user.emailAddress}`);

			callback({
				status: 200,
				message: "Account Deactivated Successfully.",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	#generateSalt = () => {
		return crypto.randomBytes(16).toString("hex");
	};

	#generateRandomPassword = (length = 8) => {
		const characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
		let password = "";
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			password += characters[randomIndex];
		}
		return password;
	};
}

module.exports = AuthService;
