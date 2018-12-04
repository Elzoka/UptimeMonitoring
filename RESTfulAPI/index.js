/*
*
*
* Primary file for the API
*
*/

// Dependencies
const http = require('http');
const url = require('url');
const {StringDecoder} = require('string_decoder')


// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
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

});


// Start the server, and have it listen on port 3000
server.listen(3000, () => {
    console.log("The Server is listening on port 3000");
});

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