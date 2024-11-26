const WalletController = require("../../controllers/WalletController");

let instance;
class WalletRoute {
	#router;
	#controller;

	constructor() {
		if (instance) return instance;

		this.#router = require("express").Router();

		this.#controller = new WalletController();

		this.#configure();

		instance = this;
	}

	#configure = () => {
		this.#router.get("/currencies", this.#controller.getCurrencies);

		this.#router.get("/balance", this.#controller.getWalletBalance);

		this.#router.get(
			"/transactions/id",
			this.#controller.getWalletTransactions
		);

		this.#router.get("/transactions", this.#controller.getTransactions);

		this.#router.get("/transaction", this.#controller.getTransaction);

		this.#router.post("/paystack", this.#controller.paystackWebhook);

		this.#router.post("/transfer", this.#controller.processWalletTransfer);

		this.#router.get("/exchange-rate", this.#controller.getExchangeRate);

		this.#router.post("/exchange", this.#controller.convertFunds);

		this.#router.put(
			"/cancel-transaction",
			this.#controller.cancleTransaction
		);

		this.#router.post("/top-up", this.#controller.initiateTopup);
	};

	getRoutes = () => {
		return this.#router;
	};
}

module.exports = WalletRoute;
