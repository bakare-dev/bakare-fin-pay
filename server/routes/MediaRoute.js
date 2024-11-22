const multer = require("multer");
const CloudinaryService = require("../../utils/CloudinaryService");
const Logger = require("../../utils/Logger");
const path = require("path");

let instance;
class MediaRoute {
	#storage;
	#router;
	#fileFilter;
	#upload;
	#cloudinary;
	#logger;

	constructor() {
		if (instance) return instance;

		this.#router = require("express").Router();

		this.#storage = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, path.resolve(__dirname, "../../uploads"));
			},
			filename: (req, file, cb) => {
				cb(null, `${Date.now()}-${file.originalname}`);
			},
		});

		this.#logger = new Logger().getLogger();
		this.#cloudinary = new CloudinaryService();

		this.#configure();

		instance = this;
	}

	#configure = () => {
		this.#fileFilter = (req, file, cb) => {
			const allowedMimeTypes = ["image/jpeg", "image/png"];

			if (!allowedMimeTypes.includes(file.mimetype)) {
				return cb(new Error("Invalid file type"), false);
			}
			cb(null, true);
		};

		this.#upload = multer({
			storage: this.#storage,
			limits: { fileSize: 10 * 1024 * 1024 },
			fileFilter: this.#fileFilter,
		});

		this.#router.post(
			"/upload",
			this.#upload.single("file"),
			async (req, res) => {
				try {
					const file = req.file;

					if (!file) {
						return res
							.status(400)
							.json({ error: "File is required" });
					}

					const uploadResult = await this.#cloudinary.write(file);

					if (uploadResult.error) {
						return res.status(400).json({
							error: "Failed to upload",
						});
					}

					res.status(200).json({
						message: "File uploaded successfully",
						data: uploadResult,
					});
				} catch (error) {
					this.#logger.error(error.message || error);
					res.status(500).json({ error: "Internal server error" });
				}
			}
		);
	};

	getRoutes = () => {
		return this.#router;
	};
}

module.exports = MediaRoute;
