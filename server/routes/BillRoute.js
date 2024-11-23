const BillController = require("../../controllers/BillController");

let instance;
class BillRoute {
	#router;
	#controller;

	constructor() {
		if (instance) return instance;

		this.#router = require("express").Router();

		this.#controller = new BillController();

		this.#configure();

		instance = this;
	}

	#configure = () => {};

	getRoutes = () => {
		return this.#router;
	};
}

module.exports = BillRoute;
