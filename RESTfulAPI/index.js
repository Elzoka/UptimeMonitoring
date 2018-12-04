/*
*
*
* Primary file for the API
*
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const {StringDecoder} = require('string_decoder');
const fs = require('fs');
const config = require('./config');

// Instantiating the HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});


// Start the HTTP server
httpServer.listen(config.httpPort, () => {
    console.log(`The Server is listening on port ${config.httpPort}`);
});

// Instantiating the HTTPS server
const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem') 
};

const httpsServer = https.createServer(httpsServerOptions,function(req, res){
    unifiedServer(req, res);    
});


// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
    console.log(`The Server is listening on port ${config.httpsPort}`);
});


// All the server logic for both the http and https server
const unifiedServer = function(req, res) {
    // Get the url and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query sting as an object
    const queryStringObject = parsedUrl.query;

    // Get http method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += (decoder.write(data));
        // buffer = data.toString('utf-8');
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the not found handler
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: buffer
        }

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode = 200, payload = {}) => {
            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            // return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // log the path
            console.log(
                "Returning this response: ", statusCode, payloadString
            );
        });
    });
}

// Define the handlers
const handlers = {};

// Sample handler
handlers.sample = function(data, callback){
    //Callback a http status code, and a payload object
    callback(406, {'name': 'sample handler'});
};

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

// Define a request router
const router = {
    'sample': handlers.sample
};