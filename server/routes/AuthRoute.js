const AuthController = require("../../controllers/AuthController");

let instance;
class AuthRoute {
	#router;
	#controller;

	constructor() {
		if (instance) return instance;

		this.#router = require("express").Router();

		this.#controller = new AuthController();

		this.#configure();

		instance = this;
	}

	#configure = () => {
		this.#router.post("/sign-in", this.#controller.signin);

		this.#router.post("/resend-otp", this.#controller.resendOtp);

		this.#router.post(
			"/sign-up-admin",
			this.#controller.createadminaccount
		);

		this.#router.post("/sign-up", this.#controller.createcustomeraccount);

		this.#router.put("/activate-account", this.#controller.activateAccount);

		this.#router.post("/sign-out", this.#controller.signout);

		this.#router.post(
			"/initiate-password-change",
			this.#controller.initiatepasswordchanage
		);

		this.#router.put(
			"/complete-password-change",
			this.#controller.completepasswordchanage
		);

		this.#router.post(
			"/deactivate-account",
			this.#controller.deactivateAccount
		);

		this.#router.post("/enable-2fa", this.#controller.enable2fa);

		this.#router.post("/disable-2fa", this.#controller.disable2fa);

		this.#router.post("/verify-2fa", this.#controller.verify2fa);

		this.#router.post("/pin", this.#controller.addPin);
	};

	getRoutes = () => {
		return this.#router;
	};
}

module.exports = AuthRoute;
