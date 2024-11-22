"use strict";

const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const Logger = require("./Logger");
const { server, database } = require("../config/main.settings");

let instance;

class DatabaseEngine {
	#connectionManager;
	#logger;

	constructor() {
		if (instance) return instance;

		// Select appropriate database configuration based on the mode
		const dbConfig =
			server.mode === "development"
				? database.development
				: server.mode === "test"
				? database.test
				: database.production;

		this.#connectionManager = new Sequelize(
			dbConfig.database,
			dbConfig.username,
			dbConfig.password,
			{
				host: dbConfig.host,
				dialect: dbConfig.dialect,
				logging: false,
			}
		);

		this.#logger = new Logger().getLogger();

		instance = this;
	}

	connect = async (cb) => {
		try {
			await this.#connectionManager.authenticate();
			await this.#synchronize();
			cb();
		} catch (e) {
			this.#logger.error(e);
		}
	};

	#synchronize = async () => {
		try {
			const db = {};

			const entitiesDir = path.resolve(__dirname, "../entities");

			fs.readdirSync(entitiesDir)
				.filter((file) => file.endsWith(".js"))
				.forEach((file) => {
					const modelName = file.slice(0, -3);
					db[modelName] = require(path.join(entitiesDir, file));
				});

			this.#connectionManager.db = db;

			await this.#connectionManager.sync({ alter: true });
		} catch (e) {
			this.#logger.error(e);
		}
	};

	getConnectionManager = () => this.#connectionManager;
}

module.exports = DatabaseEngine;
