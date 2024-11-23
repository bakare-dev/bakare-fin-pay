const BillConstraint = require("../constraints/BillConstraint");
const BillService = require("../services/BillService");
const Logger = require("../utils/Logger");
const validate = require("validate.js");

let instance;

class BillController {
	#logger;
	#service;
	#constraint;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();

		this.#constraint = new BillConstraint();

		this.#service = new BillService();

		instance = this;
	}

	getDataPlans = async (req, res) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	buyData = async (req, res) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	buyAirtime = async (req, res) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	initiateBillPayment = async (req, res) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	completeBillPayment = async (req, res) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};
}

module.exports = BillController;
