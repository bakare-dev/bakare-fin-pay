const socketIO = require("socket.io");
const Logger = require("../utils/Logger");

let instance;

class SocketService {
	#logger;

	constructor(server) {
		if (instance) return instance;

		this.io = socketIO(server, {
			pingTimeout: 60000,
			cors: {
				origin: ["", ""],
				methods: ["GET", "POST"],
				allowedHeaders: ["Content-Type"],
				credentials: true,
			},
		});

		this.#logger = new Logger().getLogger();
		this.connections = new Map();

		this.io.on("connection", (socket) => {
			this.#handleConnection(socket);
		});

		instance = this;
	}

	#handleConnection = (socket) => {
		socket.on("register", async (token) => {
			this.connections.set(token, socket.id);
		});

		socket.on("joinRoom", (room) => {
			socket.join(room);
		});

		// socket.on('disconnect', () => {
		//     this.#handleDisconnect(socket);
		// });
	};

	#handleDisconnect = (socket) => {
		this.connections.forEach((value, key) => {
			if (value === socket.id) {
				this.connections.delete(key);
				this.#logger.info(`${socket.id} deleted`);
			}
		});
	};

	#sendNotification = (eventType, message, orderNo, userId) => {
		const socketId = this.connections.get(userId);
		if (socketId) {
			this.io.to(socketId).emit(eventType, ` ${message}`);
		}
	};

	static getInstance = () => {
		if (instance) {
			return instance;
		}
	};
}

module.exports = SocketService;
