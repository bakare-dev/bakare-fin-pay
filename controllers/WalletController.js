const { infrastructure } = require("../config/main.settings");
const WalletConstraint = require("../constraints/WalletConstraint");
const WalletService = require("../services/WalletService");
const Logger = require("../utils/Logger");
const validate = require("validate.js");

let instance;

class WalletController {
	#logger;
	#service;
	#constraint;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();

		this.#constraint = new WalletConstraint();

		this.#service = new WalletService();

		instance = this;
	}

	getCurrencies = async (req, res) => {
		try {
			this.#service.getcurrencies({}, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	getWalletBalance = async (req, res) => {
		try {
			this.#service.getWalletBalance(req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	getTransactions = async (req, res) => {
		try {
			const validation = await validate(
				req.query,
				this.#constraint.getTransactions()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.getTransactions(req.userId, req.query, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	getWalletTransactions = async (req, res) => {
		try {
			const validation = await validate(
				req.query,
				this.#constraint.getWalletTransactions()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.getWalletTransactions(
				req.userId,
				req.query,
				(resp) => {
					res.status(resp.status).json(resp);
				}
			);
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	getTransaction = async (req, res) => {
		try {
			const validation = await validate(
				req.query,
				this.#constraint.getTransaction()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.getTransaction(req.userId, req.query.id, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	paystackWebhook = async (req, res) => {
		try {
			const allowedIPs = infrastructure.paystack.ips;
			const hash = crypto
				.createHmac("sha512", infrastructure.paystack.sk)
				.update(JSON.stringify(req.body))
				.digest("hex");

			const clientIP = req.ip;

			if (!allowedIPs.includes(clientIP)) {
				res.status(403).send("Forbidden");
				return;
			}

			if (hash == req.headers["x-paystack-signature"]) {
				this.#service.paystackWebHook(req.body, (resp) => {});
				res.status(200).send("OK");
			} else {
				res.status(400).send("Bad Request");
			}
		} catch (err) {
			this.#logger.error(err);
			res.status(500).send(500);
		}
	};

	initiateTopup = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.initiateTopup()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.initiateTopup(req.userId, req.body, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	cancleTransaction = async (req, res) => {
		try {
			const validation = await validate(
				req.query,
				this.#constraint.cancleTransaction()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.cancleTransaction(
				req.userId,
				req.query.id,
				(resp) => {
					res.status(resp.status).json(resp);
				}
			);
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	convertFunds = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.convertFunds()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.convertFunds(req.userId, req.body, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	getExchangeRate = async (req, res) => {
		try {
			this.#service.getExchangeRate({}, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	initiateWithdrawer = async (req, res) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	completeWithdrawer = async (req, res) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	processWalletTransfer = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.processWalletTransfer()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.processWalletTransfer(
				req.userId,
				req.body,
				(resp) => {
					res.status(resp.status).json(resp);
				}
			);
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};
}

module.exports = WalletController;
