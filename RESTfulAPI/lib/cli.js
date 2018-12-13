/*
*
* CLI-Related Tasks
*
*/

// Dependencies
const readline = require('readline');
const util = require('util');
const events = require('events');

const debug = util.debuglog('cli');
class _events extends events{};
const e = new _events();

// Instantiate the CLI module object
const cli = {};

// Input handlers
e.on('man', (str) => {
    cli.responders.help();
});

e.on('help', (str) => {
    cli.responders.help();
});

e.on('exit', (str) => {
    cli.responders.exit();
});

e.on('stats', (str) => {
    cli.responders.stats();
});

e.on('list users', (str) => {
    cli.responders.listUsers();
});

e.on('more user info', (str) => {
    cli.responders.moreUserInfo(str);
});

e.on('list checks', (str) => {
    cli.responders.listChecks(str);
});

e.on('more check info', (str) => {
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', (str) => {
    cli.responders.listLogs();
});

e.on('more log info', (str) => {
    cli.responders.moreLogInfo(str);
});


// Responders
cli.responders = {};


// Help / Man
cli.responders.help = () => {
    console.log('You asked for help');
};

// Exit
cli.responders.exit = () => {
    console.log('You asked for exit');
};

// Stats
cli.responders.stats = () => {
    console.log('You asked for stats');
}

// List users
cli.responders.listUsers = () => {
    console.log('You asked for list users');
};

// more User info
cli.responders.moreUserInfo = (str) => {
    console.log('You asked for more user info', str);
}

// List checks
cli.responders.listChecks = (str) => {
    console.log('You asked to list checks', str);
}

// more check info
cli.responders.moreCheckInfo = (str) => {
    console.log('You asked for more check info', str);
}

// list logs
cli.responders.listLogs = () => {
    console.log('You asked to list logs', str);
}

// More logs info
cli.responders.moreLogInfo = (str) => {
    console.log('You asked for more log info', str);
}

// Input processor
cli.processInput = (str) => {
    // Only process the input if the user actually wrote something, Otherwise we want to ignore it 
    str = typeof str == 'string' && str.trim().length > 0 ? str.trim() : null;
    if(str){
        // Codify the unique strings that identify the unique questions allowed to be asked
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'more check info',
            'list checks',
            'list logs',
            'more log info'
        ];

        // Go through the possible inputs, emit an event when a match is found
        let matchFound = false;
        let count = 0;
        uniqueInputs.some(input => {
            if(str.toLowerCase().includes(input)){
                matchFound = true;

                // Emit an event matching the unique input, and include the full string given
                e.emit(input, str);
                return true;
            }
        });

        // If no match is found, tell the user to try again
        if(!matchFound){
            console.log('Sorry, try again');
        }
    }
}

// Init script
cli.init = () => {
    // Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', `The CLI is running`);

    // Start the interface
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>',
        terminal: false
    });

    // Create an initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line', (str) => {
        // Send to the input processor
        cli.processInput(str);

        // Re-initialize the prompt afterwards
        _interface.prompt();
    });

    // If the user wants to stops the CLI, kill the associated process
    _interface.on('close', () => {
        process.exit(0);
    });
}

// Export the module 
module.exports = cli;