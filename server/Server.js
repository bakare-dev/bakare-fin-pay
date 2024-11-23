"use strict";
const express = require("express");
const cors = require("cors");
const Logger = require("../utils/Logger");
const Redis = require("../utils/Redis");
const http = require("http");
const SocketService = require("../services/SocketService");
const RateLimiter = require("../middlewares/RateLimiter");
const RouteProtector = require("../middlewares/RouteProtector");
const MediaRoute = require("./routes/MediaRoute");
const AuthRoute = require("./routes/AuthRoute");
const ProfileRoute = require("./routes/ProfileRoute");
const BillRoute = require("./routes/BillRoute");
const WalletRoute = require("./routes/WalletRoute");

let instance;

class Server {
	#app;
	#server;
	#io;
	#port;
	#logger;

	#redis;

	constructor(port) {
		if (instance) return instance;

		this.#port = port;
		this.#configure();
		this.#buildRoutes();
		this.#redis = new Redis();
		this.#logger = new Logger().getLogger();

		instance = this;
	}

	#configure = () => {
		this.#app = express();
		this.#app.use(express.json());
		this.#app.set("trust proxy", true);

		this.#app.use(
			cors({
				origin: "*",
				methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
				allowedHeaders:
					"Content-Type, Authorization, source, auth_mode",
				credentials: true,
				optionsSuccessStatus: 200,
			})
		);

		this.#app.use(new RateLimiter().checkRateLimit);
		this.#app.use(new RouteProtector().use);
	};

	#buildRoutes = () => {
		this.#app.get("/health", async (req, res) => {
			const healthInfo = {
				status: "Server is up and running",
			};

			res.status(200).json(healthInfo);
		});

		this.#app.use("/api/v1/media", new MediaRoute().getRoutes());

		this.#app.use("/api/v1/auth", new AuthRoute().getRoutes());

		this.#app.use("/api/v1/profile", new ProfileRoute().getRoutes());

		this.#app.use("/api/v1/wallet", new WalletRoute().getRoutes());

		this.#app.use("/api/v1/bill", new BillRoute().getRoutes());
	};

	start = async () => {
		this.#server = http.createServer(this.#app);
		new SocketService(this.#server);

		this.#server.listen(this.#port, async () => {
			await this.#redis.connect();
			this.#logger.info(
				`bakare-fin-pay-server now listening on port ${this.#port}`
			);
		});
	};

	getServerApp = () => {
		return this.#app;
	};
}

module.exports = Server;
