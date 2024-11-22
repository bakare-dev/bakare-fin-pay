const validate = require("validate.js");
const dayjs = require("dayjs");
var utc = require('dayjs/plugin/utc')

let instance;
class ValidateJSInit {

    constructor(){

        if(instance) return instance;

       
        instance = this;
    }

    setup = () => {

        dayjs.extend(utc); 

        validate.extend(validate.validators.datetime, {
            parse: (value, options) => {
                return dayjs.utc(value);
            },

            format: (value, options) => {
                var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
    
                return dayjs.utc(value, format);
            }
        })
    }
}

module.exports = ValidateJSInit;