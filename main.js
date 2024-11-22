const DatabaseEngine = require("./utils/DatabaseEngine");
const ValidateJSInit = require("./utils/ValidateJSInit");
const Server = require("./server/Server");
const config = require("./config/main.settings");
const Logger = require("./utils/Logger");
const Startup = require("./utils/Startup");

const logger = new Logger().getLogger();

const startup = new Startup();
main = () => {
	try {
		process.env.TZ = config.infrastructure.timezone;
		let validateJSInit = new ValidateJSInit();
		validateJSInit.setup();

		let server = new Server(config.server.port);
		server.start();

		// let db = new DatabaseEngine();

		// db.connect(async () => {
		// 	let server = new Server(config.server.port);
		// 	await startup.startMigration();
		// 	server.start();
		// });
	} catch (e) {
		logger.error(e);
		process.exit(1);
	}
};

main();
