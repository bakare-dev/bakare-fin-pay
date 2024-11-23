const Repository = require("./Repository");
const WalletTransactionEntity = require("../entities/WalletTransaction");
const TransactionEntity = require("../entities/Transaction");
const Helper = require("../utils/Helper");

let instance;

class WalletTransactionRepository extends Repository {
	#helper;
	constructor() {
		if (instance) return instance;

		super(WalletTransactionEntity);

		this.#helper = new Helper();

		instance = this;
	}

	getWalletTransactionsByWalletId = async (walletId) => {
		return await WalletTransactionEntity.findAll({
			where: { walletId },
			include: [TransactionEntity],
		});
	};

	getWalletTransactionsByWalletIdPaginated = async (query) => {
		let response;
		let whereClause = {};

		if (query.type) whereClause.type = query.type;
		if (query.status) whereClause.status = query.status;

		response = await WalletTransactionEntity.findAndCountAll({
			where: { walletId: query.walletId },
			include: [
				{
					model: TransactionEntity,
					where: {
						...whereClause,
					},
				},
			],
			order: [["createdAt", "DESC"]],
			...this.#helper.paginate(query.page, query.size),
		});

		if (query.page && query.page != "undefined") {
			response.currentPage = query.page;
		} else {
			response.currentPage = "0";
		}

		if (query.size && query.size != "undefined") {
			response.currentSize = query.size;
		} else {
			response.currentSize = "50";
		}

		return response;
	};
}

module.exports = WalletTransactionRepository;
