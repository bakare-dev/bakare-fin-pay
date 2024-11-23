const Repository = require("./Repository");
const TransactionEntity = require("../entities/Transaction");
const Helper = require("../utils/Helper");

let instance;

class TransactionRepository extends Repository {
	#helper;

	constructor() {
		if (instance) return instance;

		super(TransactionEntity);

		this.#helper = new Helper();

		instance = this;
	}

	getUserTransactions = async (query) => {
		let whereClause = {
			userId: query.userId,
		};

		if (query.type) whereClause.type = query.type;
		if (query.status) whereClause.status = query.status;
		if (query.mode) whereClause.mode = query.mode;

		let response;
		response = await TransactionEntity.findAndCountAll({
			where: {
				...whereClause,
			},
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

	getTransactionByRef = async (ref) => {
		return await TransactionEntity.findOne({
			where: {
				ref,
			},
		});
	};
}

module.exports = TransactionRepository;
