let instance;

class ProfileConstraint {
	constructor() {
		if (instance) return instance;

		instance = this;
	}

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

	addBeneficiary = () => {
		return {
			name: {
				presence: true,
				length: {
					minimum: 2,
				},
			},
			accountNumber: {
				presence: true,
				length: {
					minimum: 10,
					maximum: 20,
				},
			},
			bankName: {
				presence: true,
				length: {
					minimum: 2,
				},
			},
		};
	};

	searchBeneficiary = () => {
		return {
			search: {
				presence: true,
				length: {
					minimum: 2,
				},
			},
		};
	};

	deleteBeneficiary = () => {
		return {
			beneficiaryId: {
				presence: true,
				format: {
					pattern:
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
					message: "is not a valid UUID",
				},
			},
		};
	};
}

module.exports = ProfileConstraint;
