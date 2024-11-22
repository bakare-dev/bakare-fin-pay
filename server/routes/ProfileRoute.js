const ProfileController = require("../../controllers/ProfileController");

let instance;
class ProfileRoute {
	#router;
	#controller;

	constructor() {
		if (instance) return instance;

		this.#router = require("express").Router();

		this.#controller = new ProfileController();

		this.#configure();

		instance = this;
	}

	#configure = () => {
		this.#router.get(
			"/beneficiaries/:search",
			this.#controller.searchBeneficiary
		);

		this.#router.get("/", this.#controller.getprofile);

		this.#router.put("/", this.#controller.updateprofile);

		this.#router.post("/", this.#controller.createprofile);

		this.#router.post("/beneficiary", this.#controller.addBeneficiary);

		this.#router.get("/beneficiaries", this.#controller.getBeneficiaries);

		this.#router.delete("/beneficiary", this.#controller.deleteBeneficiary);
	};

	getRoutes = () => {
		return this.#router;
	};
}

module.exports = ProfileRoute;
