const ProfileConstraint = require("../constraints/ProfileConstraint");
const ProfileService = require("../services/ProfileService");
const Logger = require("../utils/Logger");
const validate = require("validate.js");

let instance;

class ProfileController {
	#logger;
	#service;
	#constraint;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();

		this.#constraint = new ProfileConstraint();

		this.#service = new ProfileService();

		instance = this;
	}

	createprofile = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.createprofile()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.createprofile(req.body, req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	updateprofile = async (req, res) => {
		try {
			this.#service.updateprofile(req.body, req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	getprofile = async (req, res) => {
		try {
			this.#service.getprofile(req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	addBeneficiary = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.addBeneficiary()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.addBeneficiary(req.userId, req.body, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	searchBeneficiary = async (req, res) => {
		try {
			const validation = await validate(
				req.params,
				this.#constraint.searchBeneficiary()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.searchBeneficiary(
				req.userId,
				req.params.search,
				(resp) => {
					res.status(resp.status).json(resp);
				}
			);
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	deleteBeneficiary = async (req, res) => {
		try {
			const validation = await validate(
				req.query,
				this.#constraint.deleteBeneficiary()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.deleteBeneficiary(
				req.userId,
				req.query.beneficiaryId,
				(resp) => {
					res.status(resp.status).json(resp);
				}
			);
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	getBeneficiaries = async (req, res) => {
		try {
			this.#service.getBeneficiaries(req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};
}

module.exports = ProfileController;
