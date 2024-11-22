const nodemailer = require("nodemailer");
const ejs = require("ejs");
const { infrastructure } = require("../config/main.settings");
const Logger = require("./Logger");

let instance;
class Mailer {

    #transporter;
    #logger;

    constructor() {

        if (instance) return instance;

        this.#transporter = nodemailer.createTransport({
            host: infrastructure.smtp.host,
            port: infrastructure.smtp.port,
            secure: false,
            auth: {
                user: infrastructure.smtp.user,
                pass: infrastructure.smtp.password
            }
        })

        this.#logger = new Logger().getLogger()

        instance = this;
    }


    sendMail = (info, callback) => {

        try {

            ejs.renderFile(process.cwd() + "/templates/" + info.templateFile, info.data, (err, data) => {

                if (err) {
                    this.#logger.error(err)
                    callback({ status: "failed", message: err.message })
                    return;
                }

                
                let message = {
                    from: info.sender,
                    to: info.recipients, 
                    subject: info.subject, 
                    html: data 
                }

                this.#transporter.sendMail(message, (err, info) => {

                    if (err) {
                        
                        this.#logger.error(err)
                        callback({ status: "failed", message: err.message });
                        return;
                    }

                    
                    callback({ status: "success", message: info });
                })

            })

        } catch (e) {
            this.#logger.error(e);
            callback({ status: "failed", message: e.message });
        }

    }

}

module.exports = Mailer;