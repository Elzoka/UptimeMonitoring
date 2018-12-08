/*
*
* Server related tasks
*
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const {StringDecoder} = require('string_decoder');
const fs = require('fs');
const path = require('path');

const handlers = require('./handlers');
const helpers = require('./helpers');
const config = require('./config');

// Instantiate the server module object
const server = {};

// Instantiating the HTTP server        
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

// Instantiating the HTTPS server
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, '../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../https/cert.pem')) 
};

server.httpsServer = https.createServer(server.httpsServerOptions,function(req, res){
    server.unifiedServer(req, res);    
});



// All the server logic for both the http and https server
server.unifiedServer = function(req, res) {
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
        const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
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


// Define a request router
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};

// Init Script
server.init = () => {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, () => {
        console.log(`The Server is listening on port ${config.httpPort}`);
    });


    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log(`The Server is listening on port ${config.httpsPort}`);
    });
}

// Export the module
module.exports = server;