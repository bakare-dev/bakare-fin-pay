const winston = require("winston");
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');
const { infrastructure } = require("../config/main.settings");

let instance;
class Logger {

    #logger;
    #logtail;

    constructor(){

        if(instance) return instance;

        this.#logtail = new Logtail(infrastructure.winston.sourceToken)

        this.#logger = winston.createLogger({
          format: winston.format.simple(),
          transports: [
              new winston.transports.Console(),
              // new LogtailTransport(this.#logtail)
          ]
        });

      instance = this;
    }

    getLogger = () => this.#logger;
}

module.exports = Logger;