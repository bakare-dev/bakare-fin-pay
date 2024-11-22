const Mailer = require("../utils/Mailer");

let instance;
class NotificationService {
	#mailer;

	constructor() {
		this.#mailer = new Mailer();
	}

	sendVerifyRegistration = async (message, callback) => {
		for (const recipient of message.recipients) {
			const info = {
				sender: "noreply@bakaredev.me",
				templateFile: "verify-registration.ejs",
				subject: "Account Created Successfully",
				recipients: [recipient],
				data: message.data,
			};

			this.#mailer.sendMail(info, (resp) => {
				callback(resp);
			});
		}
	};

	sendAdminAccountDetails = async (message, callback) => {
		for (const recipient of message.recipients) {
			const info = {
				sender: "noreply@bakaredev.me",
				templateFile: "admin-account-details.ejs",
				subject: "Welcome on board",
				recipients: [recipient],
				data: message.data,
			};

			this.#mailer.sendMail(info, (resp) => {
				callback(resp);
			});
		}
	};

	sendInitiatePasswordChange = async (message, callback) => {
		for (const recipient of message.recipients) {
			const info = {
				sender: "noreply@bakaredev.me",
				templateFile: "initiate-password-change.ejs",
				subject: "Initiate Password Change",
				recipients: [recipient],
				data: message.data,
			};

			this.#mailer.sendMail(info, (resp) => {
				callback(resp);
			});
		}
	};

	sendCompletePasswordChange = async (message, callback) => {
		for (const recipient of message.recipients) {
			const info = {
				sender: "noreply@bakaredev.me",
				templateFile: "complete-password-change.ejs",
				subject: "Password Change Completed",
				recipients: [recipient],
				data: message.data,
			};

			this.#mailer.sendMail(info, (resp) => {
				callback(resp);
			});
		}
	};

	sendAccountActivated = async (message, callback) => {
		for (const recipient of message.recipients) {
			const info = {
				sender: "noreply@bakaredev.me",
				templateFile: "account-activated.ejs",
				subject: "Account Activated",
				recipients: [recipient],
				data: message.data,
			};

			this.#mailer.sendMail(info, (resp) => {
				callback(resp);
			});
		}
	};

	sendAccountDeactivated = async (message, callback) => {
		for (const recipient of message.recipients) {
			const info = {
				sender: "noreply@bakaredev.me",
				templateFile: "deactivate-account.ejs",
				subject: "Account Deactivation Successful",
				recipients: [recipient],
				data: message.data,
			};

			this.#mailer.sendMail(info, (resp) => {
				callback(resp);
			});
		}
	};
}

module.exports = NotificationService;
