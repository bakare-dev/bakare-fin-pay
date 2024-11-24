const { infrastructure } = require("../config/main.settings");
const Logger = require("./Logger");
const axios = require("axios");
const TransactionRepository = require("../repository/TransactionRepository");

let instance;

class PaystackService {
	#logger;
	#headers;
	#transactionrepository;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();
		this.#headers = {
			headers: {
				Authorization: `Bearer ${infrastructure.paystack.sk}`,
				"Content-Type": "application/json",
			},
		};
		this.#transactionrepository = new TransactionRepository();

		instance = this;
	}

	initializePayment = async (payload, callback) => {
		try {
			const response = await axios.post(
				"https://api.paystack.co:443/transaction/initialize",
				payload,
				this.#headers
			);

			if (response.status != 200) {
				callback({ status: "error", data: response.data.data.message });
				return;
			}

			callback({
				status: "success",
				data: { paymentUrl: response.data.data.authorization_url },
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal Server Error" });
			return;
		}
	};

	webHook = async (payload, callback) => {
		try {
			const event = payload.event;

			const data = payload.data;

			const reference = data.reference;

			const amountPaid = parseFloat(data.amount / 100).toFixed(4);

			const transaction =
				await this.#transactionrepository.getTransactionByRef(
					reference
				);

			if (!transaction) {
				callback({ status: 404, error: "Transaction not found" });
				return;
			}

			if (event == "transfer.success") {
				if (amountPaid != transaction.amount) {
					callback({
						status: 400,
						error: "Amount Transferred does not match transaction amount",
					});
					return;
				}

				callback({
					status: 200,
					message: "Transfer Successful",
					data: {
						transactionId: transaction.id,
						type: "transfer",
					},
				});
			} else if (event == "charge.success") {
				if (amountPaid != transaction.amount) {
					callback({
						status: 400,
						error: "Amount paid does not match transaction amount",
					});
					return;
				}

				callback({
					status: 200,
					message: "Payment Successful",
					data: {
						transactionId: transaction.id,
						type: "payment",
					},
				});
			}
		} catch (err) {
			callback({ status: 500, error: "Internal Server Error" });
			return;
		}
	};

	makeTranfer = async (bankDetails, callback) => {
		try {
			const response = await axios.get(
				"https://api.paystack.co/bank?currency=NGN",
				this.#headers
			);

			if (response.status != 200) {
				callback({ status: "error", data: response.data.data.message });
				return;
			}

			const banks = response.data.data;

			const userBank = banks.find(
				(bank) => bank.name === bankDetails.bankName
			);

			const recipientData = {
				type: userBank.type,
				name: `${bankDetails.firstName} ${bankDetails.lastName}}`,
				account_number: bankDetails.accountNumber,
				bank_code: userBank.code,
				currency: "NGN",
			};

			const recipientResp = await axios.post(
				"https://api.paystack.co/transferrecipient",
				recipientData,
				this.#headers
			);

			if (recipientResp.status != 201) {
				callback({ status: "error", data: response.data.data.message });
				return;
			}

			const transferPayload = {
				source: "balance",
				reason: bankDetails.reason,
				amount: bankDetails.amount * 100,
				reference: bankDetails.ref,
				recipient: recipientResp.data.data.recipient_code,
			};

			const transferPayment = await axios.post(
				"https://api.paystack.co/transfer",
				transferPayload,
				this.#headers
			);

			if (transferPayment.status != 200) {
				callback({ status: "error", data: response.data.data.message });
				return;
			}

			callback({
				status: 200,
				message: "Transfer Successful",
				data: { transfer: transferPayment.data },
			});
		} catch (err) {
			this.#logger.error(err.message);
			callback({ status: 500, error: "Internal Server Error" });
			return;
		}
	};
}

module.exports = PaystackService;
