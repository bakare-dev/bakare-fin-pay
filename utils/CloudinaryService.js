const fs = require("fs");
const { infrastructure } = require("../config/main.settings");
const cloudinary = require("cloudinary").v2;

class CloudinaryService {
	#logger;
	#options;

	constructor() {
		cloudinary.config({
			cloud_name: infrastructure.cloudinary.cloudName,
			api_key: infrastructure.cloudinary.apiKey,
			api_secret: infrastructure.cloudinary.apiSecret,
			secure: true,
		});

		this.#options = {
			use_filename: true,
			unique_filename: false,
			overwrite: true,
		};
	}

	write = async (file) => {
		try {
			const cloudinaryResp = await cloudinary.uploader.upload(file.path, {
				...this.#options,
				resource_type: "auto",
			});

			if (fs.existsSync(file.path)) {
				await fs.promises.unlink(file.path);
			}

			return { url: cloudinaryResp.secure_url };
		} catch (error) {
			this.#logger.error(error);
			return { error: "Try Again" };
		}
	};
}

module.exports = CloudinaryService;
