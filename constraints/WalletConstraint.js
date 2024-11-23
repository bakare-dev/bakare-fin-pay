let instance;

class WalletConstraint {
	constructor() {
		if (instance) return instance;

		instance = this;
	}

	getTransactions = () => {
		return {
			page: {
				presence: true,
				numericality: {
					onlyInteger: true,
				},
			},
			size: {
				presence: true,
				numericality: {
					onlyInteger: true,
					greaterThan: 0,
				},
			},
		};
	};

	getWalletTransactions = () => {
		return {
			page: {
				presence: true,
				numericality: {
					onlyInteger: true,
				},
			},
			size: {
				presence: true,
				numericality: {
					onlyInteger: true,
					greaterThan: 0,
				},
			},
		};
	};

	getTransaction = () => {
		return {
			id: {
				presence: true,
				format: {
					pattern:
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
					message: "is not a valid UUID",
				},
			},
		};
	};

	initiateTopup = () => {
		return {};
	};

	completeTopup = () => {
		return {};
	};

	convertFunds = () => {
		return {
			pin: {
				presence: true,
				length: {
					is: 4,
					message: "^PIN must be exactly 4 digits",
				},
			},
			senderCurrencyId: {
				presence: true,
				format: {
					pattern:
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
					message: "is not a valid UUID",
				},
			},
			receiverCurrencyId: {
				presence: true,
				format: {
					pattern:
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
					message: "is not a valid UUID",
				},
			},
			amount: {
				presence: true,
				numericality: {
					greaterThan: 0,
					onlyInteger: false,
				},
			},
		};
	};

	initiateWithdrawer = () => {
		return {};
	};

	completeWithdrawer = () => {
		return {};
	};

	processWalletTransfer = () => {
		return {
			pin: {
				presence: true,
				length: {
					is: 4,
					message: "^PIN must be exactly 4 digits",
				},
			},
			senderWalletId: {
				presence: true,
				format: {
					pattern:
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
					message: "is not a valid UUID",
				},
			},
			recipientWalletName: {
				presence: true,
				length: {
					minimum: 3,
				},
			},
			amount: {
				presence: true,
				numericality: {
					greaterThan: 0,
					onlyInteger: false,
				},
			},
			description: {
				presence: true,
				length: {
					mimimum: 5,
				},
			},
		};
	};

	generatePaymentLink = () => {
		return {};
	};
}

module.exports = WalletConstraint;
