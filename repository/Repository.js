const Sequelize = require("sequelize");
const Helper = require("../utils/Helper");
const Logger = require("../utils/Logger");

let instance;
class Repository {
	#entity;
	#helper;
	#logger;

	constructor(entity) {
		this.#entity = entity;
		this.#helper = new Helper();
		this.#logger = new Logger().getLogger();
	}

	create = async (data) => {
		try {
			const response = await this.#entity.create(data);
			return response;
		} catch (error) {
			if (error.name === "SequelizeUniqueConstraintError") {
				return { error: "Resource already exists", status: 409 };
			} else {
				this.#logger.error(error.message);
				return { error: "Internal Server Error", status: 500 };
			}
		}
	};

	update = async (id, data) => {
		let response = await this.#entity.update(data, { where: { id } });
		return response;
	};

	delete = async (id) => {
		let response = await this.#entity.destroy({ where: { id } });
		return response;
	};

	findById = async (id) => {
		let response = await this.#entity.findByPk(id);

		return response;
	};

	fetchAll = async (query) => {
		try {
			let response;
			response = await this.#entity.findAndCountAll({
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

	getRecordCount = async () => {
		return await this.#entity.count();
	};

	insertBulk = async (bulk) => {
		try {
			const createdEntities = await this.#entity.bulkCreate(bulk);
			return createdEntities;
		} catch (error) {
			return { error: error.message };
		}
	};

	query = async (queryString, params) => {
		let result = await this.#entity.sequelize
			.query(queryString, {
				replacements: params,
				type: Sequelize.QueryTypes.RAW,
				raw: true,
			})
			.catch((e) => console.log(e));

		return result;
	};
}

module.exports = Repository;
