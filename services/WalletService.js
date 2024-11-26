const Logger = require("../utils/Logger");
const UserRepository = require("../repository/UserRepository");
const UserProfileRepository = require("../repository/UserProfileRepository");
const WalletRepository = require("../repository/WalletRepository");
const WalletTransactionRepository = require("../repository/WalletTransactionRepository");
const TransactionRepository = require("../repository/TransactionRepository");
const CurrencyRepository = require("../repository/CurrencyRepository");
const PaystackService = require("../utils/PaystackService");
const NotificationService = require("./NotificationService");
const { infrastructure, server } = require("../config/main.settings");
const crypto = require("crypto");
const dayjs = require("dayjs");
const axios = require("axios");

let instance;

class WalletService {
	#logger;
	#userrepository;
	#userprofilerepository;
	#walletrepository;
	#wallettransactionrepository;
	#transactionrepository;
	#currencyrepository;
	#paystackservice;
	#notificationService;
	#baseUrl;

	constructor() {
		if (instance) return instance;

		this.#logger = new Logger().getLogger();

		this.#userrepository = new UserRepository();

		this.#userprofilerepository = new UserProfileRepository();

		this.#walletrepository = new WalletRepository();

		this.#wallettransactionrepository = new WalletTransactionRepository();

		this.#transactionrepository = new TransactionRepository();

		this.#currencyrepository = new CurrencyRepository();

		this.#paystackservice = new PaystackService();

		this.#notificationService = new NotificationService();

		this.#baseUrl =
			server.mode == "development"
				? infrastructure.baseUrl.development
				: infrastructure.baseUrl.production;

		instance = this;
	}

	createWallet = async (userId, callback) => {
		try {
			const currencies = await this.#currencyrepository.getCurrencies();
			if (!currencies || currencies.length === 0) {
				return callback({
					status: 400,
					error: "No currencies available",
				});
			}

			const user = await this.#userprofilerepository.findByUserId(userId);
			if (!user) {
				return callback({ status: 404, error: "User not found" });
			}

			const walletExists = await this.#walletrepository.getWalletByUserId(
				userId
			);

			if (walletExists.length > 0) {
				return callback({
					status: 400,
					error: "Wallet already created for user",
				});
			}

			const walletName = this.#generateWalletName(user.firstName);

			const walletPromises = currencies.map((currency) =>
				this.#walletrepository.create({
					wallet: walletName,
					userId: user.userId,
					currencyId: currency.id,
				})
			);

			await Promise.all(walletPromises);

			callback({ status: 201, data: { message: "Wallet created" } });
		} catch (err) {
			this.#logger.error(
				`Error creating wallet for userId ${userId}:`,
				err
			);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	getWalletBalance = async (userId, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);

			if (!user) {
				return callback({ status: 404, error: "User not found" });
			}

			const wallets = await this.#walletrepository.getWalletByUserId(
				userId
			);

			if (!wallets || wallets.length == 0) {
				return callback({ status: 404, error: "Wallet not found" });
			}

			let walletBalances = [];

			for (const wallet of wallets) {
				const walletTransactions =
					await this.#wallettransactionrepository.getWalletTransactionsByWalletId(
						wallet.id
					);

				let totalCredit = 0;
				let totalDebit = 0;

				for (const transaction of walletTransactions) {
					if (transaction.transaction.status == "Successful") {
						if (transaction.transaction.type == "Credit") {
							totalCredit += parseFloat(
								transaction.transaction.amount
							).toFixed(6);
						} else if (transaction.transaction.type == "Debit") {
							totalDebit += parseFloat(
								transaction.transaction.amount
							).toFixed(6);
						}
					}
				}

				totalCredit = parseFloat(totalCredit).toFixed(6);
				totalDebit = parseFloat(totalDebit).toFixed(6);

				const balance = totalCredit - totalDebit;

				const currency = await this.#currencyrepository.findById(
					wallet.currencyId
				);

				walletBalances.push({
					walletId: wallet.id,
					currency: currency.symbol,
					currencyId: currency.id,
					balance: parseFloat(balance).toFixed(2),
				});
			}

			callback({ status: 200, data: { walletBalances } });
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	getTransactions = async (userId, query, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);
			if (!user) {
				return callback({ status: 404, error: "User not found" });
			}

			const transactions =
				await this.#transactionrepository.getUserTransactions({
					...query,
					userId: user.id,
				});

			const currencyMap = new Map(
				(await this.#currencyrepository.getCurrencies()).map(
					(currency) => [currency.id, currency.symbol]
				)
			);

			let wallettransactions = {
				total: transactions.count,
				currentSize: transactions.currentSize,
				currentPage: transactions.currentPage,
				rows: transactions.rows.map((transaction) => {
					const currencySymbol =
						currencyMap.get(transaction.currencyId) || "";
					return {
						id: transaction.id,
						date: transaction.createdAt,
						description: transaction.description,
						icon: transaction.mode == "Wallet" ? "wallet" : "card",
						amount: `${
							transaction.type == "Credit" ? "+" : "-"
						}${currencySymbol}${transaction.amount}`,
					};
				}),
			};

			callback({ status: 200, data: { wallettransactions } });
		} catch (err) {
			this.#logger.error(
				`Error fetching transactions for userId ${userId}: ${err.message}`
			);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	getWalletTransactions = async (userId, query, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);

			if (!user) {
				return callback({ status: 404, error: "User not found" });
			}

			const wallet = await this.#walletrepository.findById(
				query.walletId
			);

			if (!wallet) {
				return callback({ status: 404, error: "Wallet not found" });
			}

			if (wallet.userId != user.id) {
				return callback({ status: 403, error: "Forbidden" });
			}

			const walletTransactions =
				await this.#wallettransactionrepository.getWalletTransactionsByWalletIdPaginated(
					query
				);

			const currency = await this.#currencyrepository.findById(
				wallet.currencyId
			);

			const symbol = currency.symbol;

			const mode = wallet;

			let wallettransactions = {
				total: walletTransactions.count,
				currentSize: walletTransactions.currentSize,
				currentPage: walletTransactions.currentPage,
				rows: walletTransactions.rows.map((transaction) => {
					return {
						id: transaction.transaction.id,
						date: transaction.transaction.createdAt,
						description: transaction.transaction.description,
						icon: mode,
						amount: `${
							transaction.transaction.type == "Credit" ? "+" : "-"
						}${symbol}${transaction.transaction.amount}`,
					};
				}),
			};

			callback({ status: 200, data: { wallettransactions } });
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	getTransaction = async (userId, transactionId, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);

			if (!user) {
				return callback({ status: 404, error: "User not found" });
			}

			const transaction = await this.#transactionrepository.findById(
				transactionId
			);

			if (!transaction) {
				return callback({
					status: 404,
					error: "Transaction not found",
				});
			}

			if (transaction.userId != user.id) {
				return callback({ status: 403, error: "Forbidden" });
			}

			const currency = await this.#currencyrepository.findById(
				transaction.currencyId
			);

			const amount = `${transaction.type == "Credit" ? "+" : "-"}${
				currency.country
			} ${transaction.amount}`;

			callback({
				status: 200,
				data: {
					id: transaction.id,
					ref: transaction.ref,
					date: transaction.createdAt,
					description: transaction.description,
					amount,
					icon: transaction.mode == "Wallet" ? "wallet" : "card",
					status: transaction.status,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	paystackWebHook = async (payload, callback) => {
		try {
			this.#paystackservice.webHook(payload, async (resp) => {
				if (resp.status != 200) {
					callback({ status: resp.status });
					return;
				}

				if (resp.type == "payment") {
					this.completeTopup(payload.transactionId, (resp) => {});
				} else if (resp.type == "transfer") {
					this.completeWithdrawer(
						payload.transactionId,
						(resp) => {}
					);
				}
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Interner Server Error" });
		}
	};

	processWalletTransfer = async (userId, payload, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);
			if (!user)
				return callback({ status: 404, error: "User not found" });

			const isPinValid = await this.#verifyKey(
				payload.pin,
				user.transactionpin
			);

			if (!isPinValid)
				return callback({ status: 403, error: "Invalid PIN" });

			const senderWallet = await this.#walletrepository.findById(
				payload.senderWalletId
			);

			if (!senderWallet || senderWallet.userId != user.id) {
				return callback({ status: 403, error: "Forbidden" });
			}

			const currency = await this.#currencyrepository.findById(
				senderWallet.currencyId
			);

			const recipientWallet =
				await this.#walletrepository.getWalletByName(
					payload.recipientWalletName,
					currency.id
				);

			if (!recipientWallet) {
				return callback({
					status: 404,
					error: `Recipient Wallet not found`,
				});
			}

			const recipientUser = await this.#userrepository.findById(
				recipientWallet.userId
			);

			const transactions =
				await this.#wallettransactionrepository.getWalletTransactionsByWalletId(
					senderWallet.id
				);

			const balance = transactions.reduce((acc, transaction) => {
				if (transaction.transaction.status == "Successful") {
					const amount = parseFloat(
						transaction.transaction.amount
					).toFixed(6);
					return transaction.transaction.type == "Credit"
						? acc + amount
						: acc - amount;
				}
				return acc;
			}, 0);

			if (balance < payload.amount) {
				return callback({ status: 400, error: "Insufficient funds" });
			}

			const senderProfile =
				await this.#userprofilerepository.findByUserId(user.id);

			const recipientProfile =
				await this.#userprofilerepository.findByUserId(
					recipientWallet.userId
				);

			const debitTransaction = await this.#transactionrepository.create({
				amount: payload.amount,
				ref: this.#generateRef(),
				description:
					payload.description ||
					`Transfer to ${recipientProfile.firstName} wallet`,
				type: "Debit",
				mode: "Wallet",
				status: "Successful",
				currencyId: currency.id,
				userId: user.id,
			});

			if (!debitTransaction?.id) {
				return callback({
					status: 400,
					error: "An error occurred during debit transaction",
				});
			}

			await this.#wallettransactionrepository.create({
				walletId: senderWallet.id,
				transactionId: debitTransaction.id,
			});

			const creditTransaction = await this.#transactionrepository.create({
				amount: payload.amount,
				ref: this.#generateRef(),
				description:
					payload.description ||
					`Transfer from ${senderProfile.firstName}`,
				type: "Credit",
				mode: "Wallet",
				status: "Successful",
				currencyId: currency.id,
				userId: recipientUser.id,
			});

			if (!creditTransaction?.id) {
				this.#transactionrepository.delete(debitTransaction.id);
				return callback({
					status: 400,
					error: "An error occurred during credit transaction",
				});
			}

			await this.#wallettransactionrepository.create({
				walletId: recipientWallet.id,
				transactionId: creditTransaction.id,
			});

			this.#notificationService.sendWalletTransfer(
				{
					recipients: [user.emailAddress],
					data: {
						amount: payload.amount,
						currency: currency.symbol,
						sender: senderProfile.firstName,
						recipients: recipientProfile.firstName,
						transactionDate: dayjs(
							new Date(debitTransaction.createdAt)
						).format(infrastructure.dateFormat),
						transactionId: debitTransaction.id,
					},
				},
				(resp) => {}
			);

			this.#notificationService.sendWalletReceiver(
				{
					recipients: [recipientUser.emailAddress],
					data: {
						amount: payload.amount,
						sender: senderProfile.firstName,
						currency: currency.symbol,
						recipients: recipientProfile.firstName,
						transactionDate: dayjs(
							new Date(creditTransaction.createdAt)
						).format(infrastructure.dateFormat),
						transactionId: creditTransaction.id,
					},
				},
				(resp) => {}
			);

			callback({ status: 200, data: { message: "Transfer successful" } });
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	getExchangeRate = async (payload, callback) => {
		try {
			const response = await axios.get(
				`https://data.fixer.io/api/latest?access_key=${infrastructure.fixer.accessKey}`
			);

			if (response.status != 200 || !response.data.success) {
				return callback({
					status: 400,
					error: "An error occurred while fetching exchange rates",
				});
			}

			const rates = response.data.rates;

			const usdRate = rates["USD"];
			const ngnRate = rates["NGN"];

			if (!usdRate || !ngnRate) {
				return callback({
					status: 400,
					error: "Required exchange rates (USD or NGN) are missing",
				});
			}

			const usdToNgnRate = ngnRate / usdRate;
			const ngnToUsdRate = 1 / usdToNgnRate;

			callback({
				status: 200,
				data: {
					usdToNgnRate: usdToNgnRate.toFixed(2),
					ngnToUsdRate: ngnToUsdRate.toFixed(6),
				},
			});
		} catch (err) {
			this.#logger.error(err);
			return callback({ status: 500, error: "Internal server error" });
		}
	};

	convertFunds = async (userId, payload, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);
			if (!user)
				return callback({ status: 404, error: "User not found" });

			const isPinValid = await this.#verifyKey(
				payload.pin,
				user.transactionpin
			);

			if (!isPinValid)
				return callback({ status: 403, error: "Invalid PIN" });

			const senderCurrency = await this.#currencyrepository.findById(
				payload.senderCurrencyId
			);

			const receiverCurrency = await this.#currencyrepository.findById(
				payload.receiverCurrencyId
			);

			const senderWallet =
				await this.#walletrepository.getWalletByCurrencyId(
					senderCurrency.id,
					user.id
				);

			if (!senderWallet) {
				return callback({ status: 403, error: "Forbidden" });
			}

			const recipientWallet =
				await this.#walletrepository.getWalletByCurrencyId(
					receiverCurrency.id,
					user.id
				);

			if (!recipientWallet) {
				return callback({ status: 403, error: "Forbidden" });
			}

			const transactions =
				await this.#wallettransactionrepository.getWalletTransactionsByWalletId(
					senderWallet.id
				);

			const balance = transactions.reduce((acc, transaction) => {
				if (transaction.transaction.status == "Successful") {
					const amount = parseFloat(
						transaction.transaction.amount
					).toFixed(6);
					return transaction.transaction.type == "Credit"
						? acc + amount
						: acc - amount;
				}
				return acc;
			}, 0);

			if (balance < payload.amount) {
				return callback({ status: 400, error: "Insufficient funds" });
			}

			const response = await axios.get(
				`https://data.fixer.io/api/latest?access_key=${infrastructure.fixer.accessKey}`
			);

			if (response.status != 200 || !response.data.success) {
				return callback({
					status: 400,
					error: "An error occurred while fetching exchange rates",
				});
			}

			const rates = response.data.rates;

			const usdRate = rates["USD"];
			const ngnRate = rates["NGN"];

			if (!usdRate || !ngnRate) {
				return callback({
					status: 400,
					error: "Required exchange rates (USD or NGN) are missing",
				});
			}

			const usdToNgnRate = ngnRate / usdRate;
			const ngnToUsdRate = 1 / usdToNgnRate;

			let debit = {
				amount: payload.amount,
				currencyId: senderCurrency.id,
				description: "Wallet fund conversion",
				userId: user.id,
				type: "Debit",
				mode: "Wallet",
				status: "Successful",
				ref: this.#generateRef(),
			};

			let credit = {
				currencyId: receiverCurrency.id,
				description: "Wallet fund conversion",
				userId: user.id,
				type: "Credit",
				mode: "Wallet",
				status: "Successful",
				ref: this.#generateRef(),
			};

			if (senderCurrency.country == "NGN") {
				const amount = payload.amount;
				credit.amount = parseFloat((amount * ngnToUsdRate).toFixed(2));
			}

			if (senderCurrency.country == "USD") {
				const amount = payload.amount;
				credit.amount = parseFloat((amount * usdToNgnRate).toFixed(6));
			}

			const debitTransaction = await this.#transactionrepository.create(
				debit
			);

			if (!debitTransaction.id) {
				return callback({
					status: 400,
					error: "An error occurred during debit transaction",
				});
			}

			await this.#wallettransactionrepository.create({
				walletId: senderWallet.id,
				transactionId: debitTransaction.id,
			});

			const creditTransaction = await this.#transactionrepository.create(
				credit
			);

			if (!creditTransaction.id) {
				this.#transactionrepository.delete(debitTransaction.id);
				return callback({
					status: 400,
					error: "An error occurred during credit transaction",
				});
			}

			await this.#wallettransactionrepository.create({
				walletId: recipientWallet.id,
				transactionId: creditTransaction.id,
			});

			callback({
				status: 200,
				data: { message: "Conversion successful" },
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	initiateTopup = async (userId, payload, callback) => {
		try {
			const user = await this.#userrepository.findById(userId);

			if (!user) {
				return callback({ status: 404, error: "User not found" });
			}

			const currency = await this.#currencyrepository.findById(
				payload.currencyId
			);

			const isPinValid = await this.#verifyKey(
				payload.pin,
				user.transactionpin
			);

			if (!isPinValid) {
				return callback({ status: 403, error: "Invalid PIN" });
			}

			const wallet = await this.#walletrepository.getWalletByCurrencyId(
				currency.id,
				user.id
			);

			if (!wallet) {
				return callback({
					status: 404,
					error: `${currency.symbol} Wallet not found`,
				});
			}

			const transaction = await this.#transactionrepository.create({
				amount: payload.amount,
				ref: this.#generateRef(),
				description: `wallet top up`,
				type: "Credit",
				mode: "Wallet",
				currencyId: currency.id,
				userId: user.id,
			});

			if (!transaction.id) {
				return callback({
					status: 400,
					error: "An error occurred during transaction creation",
				});
			}

			await this.#wallettransactionrepository.create({
				walletId: wallet.id,
				transactionId: transaction.id,
			});

			const paystackPayload = {
				amount: transaction.amount * 100,
				email: user.emailAddress,
				reference: transaction.ref,
				currency: currency.country,
				callback_url: this.#baseUrl + "/wallet",
				metadata: {
					cancel_action: this.#baseUrl + "/wallet",
					callback_url: this.#baseUrl + "/wallet",
				},
			};

			this.#paystackservice.initializePayment(
				paystackPayload,
				async (resp) => {
					if (resp.status != "success") {
						this.#transactionrepository.update(transaction.id, {
							status: "Failed",
						});
						return callback({
							status: 400,
							error: "An error occurred during payment initialization",
						});
					} else {
						const profile =
							await this.#userprofilerepository.findByUserId(
								user.id
							);

						this.#notificationService.sendWalletTopupInitiated(
							{
								recipients: [user.emailAddress],
								data: {
									name: profile.firstName,
									amount: transaction.amount,
									transactionDate: dayjs(
										new Date(transaction.createdAt)
									).format(infrastructure.dateFormat),
									transactionId: transaction.id,
									currency: currency.symbol,
								},
							},
							(resp) => {}
						);
						return callback({
							status: 200,
							message: `Payment Initiated`,
							data: {
								amount: parseFloat(transaction.amount).toFixed(
									4
								),
								transactionReference: transaction.ref,
								paymentUrl: resp.data.paymentUrl,
							},
						});
					}
				}
			);
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	completeTopup = async (transactionId, callback) => {
		try {
			const transaction = await this.#transactionrepository.findById(
				transactionId
			);

			if (!transaction) {
				return callback({
					status: 404,
					error: "Transaction not found",
				});
			}
			const updatedtransaction = await this.#transactionrepository.update(
				transaction.id,
				{
					status: "Successful",
				}
			);

			if (updatedtransaction[0] != 1) {
				return callback({
					status: 400,
					error: "Transaction updated failed",
				});
			}

			const currency = await this.#currencyrepository.findById(
				transaction.currencyId
			);

			const user = await this.#userrepository.findById(
				transaction.userId
			);

			const profile = await this.#userprofilerepository.findByUserId(
				transaction.user.id
			);

			this.#notificationService.sendWalletTopupCompleted(
				{
					recipients: [user.emailAddress],
					data: {
						name: profile.firstName,
						amount: transaction.amount,
						transactionDate: dayjs(
							new Date(transaction.createdAt)
						).format(infrastructure.dateFormat),
						transactionId: transaction.id,
						currency: currency.symbol,
					},
				},
				(resp) => {}
			);

			callback({
				status: 200,
				message: "Wallet Top up successful",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	cancleTransaction = async (userId, transactionId, callback) => {
		try {
			const transaction = await this.#transactionrepository.findById(
				transactionId
			);

			if (!transaction) {
				return callback({
					status: 404,
					error: "Transaction not found",
				});
			}

			if (transaction.userId != userId) {
				return callback({
					status: 403,
					error: "Forbidden",
				});
			}

			const updatedtransaction = await this.#transactionrepository.update(
				transaction.id,
				{
					status: "Failed",
				}
			);

			if (updatedtransaction[0] != 1) {
				return callback({
					status: 400,
					error: "Transaction updated failed",
				});
			}

			callback({
				status: 200,
				message: "Transaction Cancelled",
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	initiateWithdrawer = async (userId, payload, callback) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	completeWithdrawer = async (transactionId, callback) => {
		try {
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	getcurrencies = async (payload, callback) => {
		try {
			const currencies = await this.#currencyrepository.getCurrencies();

			const data = currencies.map((currency) => {
				return {
					id: currency.id,
					symbol: currency.symbol,
				};
			});

			callback({
				status: 200,
				data: {
					currencies: data,
				},
			});
		} catch (err) {
			this.#logger.error(err);
			callback({ status: 500, error: "Internal server error" });
		}
	};

	#generateWalletName = (userName) => {
		const appName = "BKP";
		const randomString = Math.random().toString(36).substring(2, 4);
		const normalizedUserName = userName
			.trim()
			.replace(/\s+/g, "")
			.toLowerCase();
		return `${appName}${normalizedUserName}${randomString}`;
	};

	#verifyKey = (value, hashedValue) => {
		return new Promise((resolve, reject) => {
			const [salt, originalHash] = hashedValue.split(":");
			crypto.pbkdf2(
				value,
				salt,
				10000,
				64,
				"sha512",
				(err, derivedKey) => {
					if (err) {
						return reject(new Error("Error verifying hash"));
					}
					resolve(derivedKey.toString("hex") == originalHash);
				}
			);
		});
	};

	#generateRef = () => {
		return crypto.randomBytes(16).toString("hex");
	};
}

module.exports = WalletService;
