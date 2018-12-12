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
const util = require('util');

const handlers = require('./handlers');
const helpers = require('./helpers');
const config = require('./config');

const debug = util.debuglog('server');

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
        chosenHandler(data, (statusCode = 200, payload = {}, contentType = 'json') => {
            // return the response parts that are content-specific
            let payloadString = '';
            if(contentType == 'json'){
                res.setHeader('Content-Type', 'application/json');
                payloadString = JSON.stringify(payload);

            }
            if(contentType == 'html'){
                res.setHeader('Content-Type', 'text/html');
                payloadString += payload;
            }

            // return the response parts that are common to all content types
            res.writeHead(statusCode);
            res.end(payloadString);

            // If response is 200 otherwise print red
            const logColor = statusCode == 200 ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m'
            debug(logColor, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);            
        });
    });
}


// Define a request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks
};

// Init Script
server.init = () => {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m', `The Server is listening on port ${config.httpPort}`);
    });


    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[35m%s\x1b[0m', `The Server is listening on port ${config.httpsPort}`);
    });
}

// Export the module
module.exports = server;