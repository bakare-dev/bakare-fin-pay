const validate = require("validate.js");
const AuthConstraint = require("../constraints/AuthConstraint");
const AuthService = require("../services/AuthService");
const Logger = require("../utils/Logger");

let instance;

class AuthController {
	#service;
	#constraint;
	#logger;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();
		this.#service = new AuthService();
		this.#constraint = new AuthConstraint();

		instance = this;
	}

	createadminaccount = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.createadminaccount()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.createadminaccount(req.body, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	createcustomeraccount = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.createcustomeraccount()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.createcustomeraccount(req.body, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	activateAccount = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.activateAccount()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.activateAccount(req.body, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	resendOtp = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.resendOtp()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.resendOtp(req.body, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	signin = async (req, res) => {
		try {
			const authHeader = req.headers["authorization"];

			if (!authHeader) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const encodedCredentials = authHeader.split(" ")[1];
			const decodedCredentials = Buffer.from(
				encodedCredentials,
				"base64"
			).toString("utf-8");
			const [username, password] = decodedCredentials.split(":");

			const payload = {
				emailAddress: username,
				password,
			};

			const validation = await validate(
				payload,
				this.#constraint.signin()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.signin(payload, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	signout = async (req, res) => {
		try {
			this.#service.signout(req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	initiatepasswordchanage = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.initiatepasswordchanage()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.initiatepasswordchanage(
				req.body.emailAddress,
				(resp) => {
					res.status(resp.status).json(resp);
				}
			);
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	completepasswordchanage = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.completepasswordchanage()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.completepasswordchanage(req.body, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	deactivateAccount = async (req, res) => {
		try {
			this.#service.deactivateAccount(req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	enable2fa = async (req, res) => {
		try {
			this.#service.enable2Fa(req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	verify2fa = async (req, res) => {
		try {
			const validation = await validate(
				req.body,
				this.#constraint.verify2fa()
			);

			if (validation) {
				return res.status(422).json({
					error: "validation error",
					data: { validation },
				});
			}

			this.#service.verify2FA(
				req.body.emailAddress,
				req.body.key,
				(resp) => {
					res.status(resp.status).json(resp);
				}
			);
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	disable2fa = async (req, res) => {
		try {
			this.#service.disable2FA(req.userId, (resp) => {
				res.status(resp.status).json(resp);
			});
		} catch (err) {
			this.#logger.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	};
}

module.exports = AuthController;
