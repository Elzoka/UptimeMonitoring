/*
*
*
* Primary file for the API
*
*/

// Dependencies
const http = require('http');
const url = require('url');


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

    // send the response
    res.end("Hello World\n");

    // log the path
    console.log(
        "Request recieved with these headers", headers
    );
});


// Start the server, and have it listen on port 3000
server.listen(3000, () => {
    console.log("The Server is listening on port 3000");
});