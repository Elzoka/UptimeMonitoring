 /*
*
*
* Primary file for the API
*
*/

// Dependencies 
const server = require('./lib/server');
const  workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');

// Declare the app
const app = {};

// Init function
app.init = (callback) => {
    // if we are on the master thread, start the background workers and cli
    if(cluster.isMaster){
        // Start the workers
        workers.init();
        // Start the CLI, make sure it starts last
        setImmediate(() => {
            cli.init();
            callback();
        });

        // Fork the process
        for(let i = 0; i < os.cpus().length; i++){
            cluster.fork();
        }
    }else{
        // if we are not on the master thread, Start the server
        server.init();
    }
};

// Self invoking only if required directly
if(require.main === module){
    app.init(() => {});
}

// Export the app
module.exports = app;