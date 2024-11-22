const http = require("http");
const https = require("https");

let instance;
class HttpClient {


    constructor(){

        if(instance) return instance;

        instance = this;
    }


    request = async  (clientOptions, data, secure, callback) => {

       
        
        let encodedData = JSON.stringify(data);
        
        let httpClient = secure ? https : http;

        let options = {
            headers: {
                'Content-Type' : 'application/json',
                'Content-Length': encodedData?.length > 0 ? encodedData?.length : 0
            }
        }

        options = {...options, ...clientOptions};


        let req = httpClient.request(options, res => {

       
            let rawData = [];
            let responseBody;

            res.setEncoding('utf-8');

            res.on("data", chunk => {
                rawData.push(chunk)
            })

            res.on('end', () => {

                responseBody = JSON.parse(rawData);
                callback({status: res.statusCode, message: res.statusMessage, data: responseBody});
            });

            res.on("error", (error) => {
                console.log(error)
            })

        })

        req.on('error', e => {
            callback({status: 500, message: e});
        })

        req.write(JSON.stringify(data));
    }


}

module.exports = HttpClient;