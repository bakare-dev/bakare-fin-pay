const Repository = require("./Repository");
const BeneficiaryEntity = require("../entities/Beneficiary");
const Helper = require("../utils/Helper");
const { Op } = require("sequelize");

let instance;

class BeneficiaryRepository extends Repository {
	#helper;

	constructor() {
		if (instance) return instance;

		super(BeneficiaryEntity);

		this.#helper = new Helper();

		instance = this;
	}

	getBeneficiary = async (query) => {
		return await BeneficiaryEntity.findOne({
			where: {
				userId: query.userId,
				id: query.beneficiaryId,
			},
		});
	};

	getBeneficiaries = async (query) => {
		try {
			let response;
			response = await BeneficiaryEntity.findAndCountAll({
				where: {
					userId: query.userId,
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
		} catch (e) {
			console.log(e.message);
		}
	};

	searchBeneficiaries = async (query) => {
		try {
			let response;
			response = await BeneficiaryEntity.findAndCountAll({
				where: {
					name: { [Op.like]: `%${query.searchvalue}%` },
					userId: query.userId,
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
		} catch (e) {
			console.log(e.message);
		}
	};
}

module.exports = BeneficiaryRepository;
