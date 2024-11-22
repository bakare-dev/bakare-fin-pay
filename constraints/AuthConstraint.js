let instance;

class AuthConstraint {
	constructor() {
		if (instance) return instance;

		instance = this;
	}

	createadminaccount = () => {
		return {
			emailAddress: {
				presence: true,
				email: true,
			},
			firstName: {
				presence: {
					allowEmpty: false,
				},
			},
			lastName: {
				presence: {
					allowEmpty: false,
				},
			},
			phoneNumber: {
				presence: true,
				length: {
					minimum: 7,
				},
			},
		};
	};

	createcustomeraccount = () => {
		return {
			emailAddress: {
				presence: true,
				email: true,
			},
			password: {
				presence: true,
				length: {
					minimum: 8,
					message: "^Password must be at least 8 characters long",
				},
				format: {
					pattern:
						/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
					message:
						"^Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
				},
			},
		};
	};

	activateAccount = () => {
		return {
			userId: {
				presence: true,
				format: {
					pattern:
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
					message: "is not a valid UUID",
				},
			},
			otp: {
				presence: true,
				length: {
					is: 6,
					message: "^OTP must be exactly 6 digits",
				},
			},
		};
	};

	resendOtp = () => {
		return {
			userId: {
				presence: true,
				format: {
					pattern:
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
					message: "is not a valid UUID",
				},
			},
			type: {
				presence: true,
				numericality: {
					onlyInteger: true,
				},
			},
		};
	};

	signin = () => {
		return {
			emailAddress: {
				presence: true,
				email: true,
			},
			password: {
				presence: true,
				length: {
					minimum: 8,
					message: "^Password must be at least 8 characters long",
				},
				format: {
					pattern:
						/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
					message:
						"^Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
				},
			},
		};
	};

	initiatepasswordchanage = () => {
		return {
			emailAddress: {
				presence: true,
				email: true,
			},
		};
	};

	completepasswordchanage = () => {
		return {
			userId: {
				presence: true,
				format: {
					pattern:
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
					message: "is not a valid UUID",
				},
			},
			otp: {
				presence: true,
				length: {
					is: 6,
					message: "^OTP must be exactly 6 digits",
				},
			},
			password: {
				presence: true,
				length: {
					minimum: 8,
					message: "^Password must be at least 8 characters long",
				},
				format: {
					pattern:
						/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
					message:
						"^Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
				},
			},
		};
	};

	createprofile = () => {
		return {
			firstName: {
				presence: {
					allowEmpty: false,
				},
			},
			lastName: {
				presence: {
					allowEmpty: false,
				},
			},
			phoneNumber: {
				presence: true,
				length: {
					minimum: 7,
				},
			},
			pictureUrl: {
				presence: true,
				url: true,
			},
		};
	};

	verify2fa = () => {
		return {
			emailAddress: {
				presence: true,
				email: true,
			},
			key: {
				presence: true,
				length: {
					is: 6,
					message: "^OTP must be exactly 6 digits",
				},
			},
		};
	};

	deactivateAccount = () => {
		return {
			otp: {
				presence: true,
				length: {
					is: 6,
					message: "^OTP must be exactly 6 digits",
				},
			},
		};
	};
}

module.exports = AuthConstraint;
