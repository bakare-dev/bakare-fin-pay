let instance;

class BillConstraint {
	constructor() {
		if (instance) return instance;

		instance = this;
	}

	getDataPlans = () => {
		return {};
	};

	buyData = () => {
		return {};
	};

	buyAirtime = () => {
		return {};
	};

	initiateBillPayment = () => {
		return {};
	};

	completeBillPayment = () => {
		return {};
	};
}

module.exports = BillConstraint;
