require("dotenv").config();
module.exports = {
	server: {
		port: process.env.PORT,
		mode: process.env.MODE,
	},
	database: {
		development: {
			database: process.env.DEV_DB,
			username: process.env.DEV_USER,
			password: process.env.DEV_PASSWORD,
			host: process.env.DEV_HOST,
			dialect: "mysql",
			logging: true,
		},
		test: {
			database: process.env.TEST_DB,
			username: process.env.TEST_USER,
			password: process.env.TEST_PASSWORD,
			host: process.env.TEST_HOST,
			dialect: "mysql",
			logging: false,
		},
		production: {
			database: process.env.PROD_DB,
			username: process.env.PROD_USER,
			password: process.env.PROD_PASSWORD,
			host: process.env.PROD_HOST,
			dialect: "mysql",
			logging: false,
		},
	},
	infrastructure: {
		dateFormat: "YYYY-MM-DD HH:mm:ss",
		timezone: "Africa/Lagos",
		baseUrl: {
			production: "",
			development: "http://localhost:3000",
		},
		winston: {
			server: process.env.WINSTONSOURCESERVER,
			sourceToken: process.env.WINSTONSOURCETOKEN,
		},
		ipinfo: {
			apiKey: process.env.IPINFOAPIKEY,
		},
		redis: {
			host: process.env.REDISHOST,
			port: process.env.REDISPORT,
			password: process.env.REDISPASSWORD,
			database: process.env.REDISDATABASE,
		},
		smtp: {
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			user: process.env.SMTP_USN,
			password: process.env.SMTP_PASSWORD,
		},
		cloudinary: {
			apiKey: process.env.CLOUDINARY_API_KEY,
			apiSecret: process.env.CLOUDINARY_API_SECRET,
			cloudName: process.env.CLOUDINARY_CLOUD_NAME,
		},
	},
	security: {
		jwtSecret: process.env.JWT_SECRET,
		unprotectedRoutes: [
			"/health",
			"/api/v1/media",
			"/swagger",
			"/api/v1/auth/sign-up",
			"/api/v1/auth/activate",
			"/api/v1/auth/resend-otp",
			"/api/v1/auth/sign-in",
			"/api/v1/auth/initiate-password-change",
			"/api/v1/auth/complete-password-change",
		],
		saltLength: process.env.SALT_LENGTH,
	},
};
