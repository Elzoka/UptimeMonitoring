/*
*
* CLI-Related Tasks
*
*/

// Dependencies
const readline = require('readline');
const util = require('util');
const events = require('events');
const os = require('os');
const v8 = require('v8');

const debug = util.debuglog('cli');
class _events extends events{};
const e = new _events();

const _data = require('./data');


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
    const commands = {
        'exit': 'Kill the CLI (and the rest of the application)',
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'stats': 'Get statistics on the underlying operating system and resource utilization',
        'list users': 'Show a list of all the registered (undeleted) users in the system',
        'more user info --(userId)': 'Show details of a specific user',
        'more check info --up --down': 'Show a list of all the active checks in the system, including their state. The "--up" and the "--down flags are both optional"',
        'list checks --(checkId)': 'Show details of a specified check',
        'list logs': 'Show a list of all the log files available to be read (compressed and uncompressed)',
        'more log info --(fileName)': 'Show details of a specified log file'
    };

    // Show a header for the help page that is as wide as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Show each command, followed by it's explanation, in white and yellow respectively
    for (let key in commands){
        if(commands.hasOwnProperty(key)){
            let value = commands[key];
            let line =  '\x1b[33m' + key + '\x1b[0m';
            let padding = 60 - line.length;
            for(let i = 0; i< padding; i++){
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.horizontalLine();
};

// Create the vertical space
cli.verticalSpace = (lines = 1) => {
    for(let i = 0; i < lines; i++){
        console.log('');
    }
}

// Create a horizontal line across the the screen
cli.horizontalLine = () => {
    // Get the avilable screen size
    const width = process.stdout.columns;
    let line = '';
    for(let i = 0; i < width; i++){
        line += '-';
    }

    console.log(line);
};

// Create centered text on the screen
cli.centered = (str) => {
    str = typeof str == 'string' && str.trim().length > 0 ? str.trim(): '';

    // Get the available screen size
    const width = process.stdout.columns;

    // Calculate the left padding there should be
    const leftPadding  = Math.floor((width - str.length) /2);

    // Put in left padded spaces before the string itself
    let line = '';

    for(let i = 0; i < leftPadding; i++){
        line += ' ';
    }
    line += str;
    console.log(line);
};

// Exit
cli.responders.exit = () => {
    process.exit(0);
};

// Stats
cli.responders.stats = () => {
    // Compile an object of stats
    const stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'Uptime': os.uptime() + " Seconds"
    }

    // Show a header for the stats
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);


    // Log out Each stat
    for (let key in stats){
        if(stats.hasOwnProperty(key)){
            let value = stats[key];
            let line =  '\x1b[33m' + key + '\x1b[0m';
            let padding = 60 - line.length;
            for(let i = 0; i< padding; i++){
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.horizontalLine();
}

// List users
cli.responders.listUsers = () => {
    _data.list('users', (err, userIds) => {
        if(!err && userIds && userIds.length > 0){
            cli.verticalSpace();
            userIds.forEach(userId => {
                _data.read('users', userId, (err, userData) => {
                    if(!err && userData){
                        let line = `Name: ${userData.firstName} ${userData.lastName} Phone: ${userData.phone} Checks: `;
                        var numberOfChecks = typeof userData.checks == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;

                        line += numberOfChecks;
                        console.log(line);
                        cli.verticalSpace();
                    }
                });
            });
        }
    });
};

// more User info
cli.responders.moreUserInfo = (str) => {
    // Get the id from the string
    const arr = str.split('--');
    const userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : null;

    if(userId){
        // Lookup the user
        _data.read('users', userId, (err, userData) => {
            if(!err && userData){
                // Remove the hashed password
                delete userData.hashedPassword;

                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(userData, {'colors': true});
                cli.verticalSpace();
            }
        });
    }
}

// List checks
cli.responders.listChecks = (str) => {
    _data.list('checks', (err, checkIds) => {
        if(!err && checkIds && checkIds.length > 0){
            cli.verticalSpace();
            const flag = str.split('--')[1];
            const stateToPrint = flag && typeof flag == 'string' &&['down', 'up'].includes(flag.trim().toLowerCase()) ? flag.trim().toLowerCase() : 'all';
            checkIds.forEach(checkId => {
                _data.read('checks', checkId, (err, {id, method, protocol, url, state}) => {
                    let line = "";
                    if(stateToPrint === 'all'){
                        line = `ID: ${id} ${method.toUpperCase()} ${protocol}://${url} State: ${(state || 'Unknown')}`;
                        console.log(line);
                    }else{
                        if(state === stateToPrint){
                            line = `ID: ${id} ${method.toUpperCase()} ${protocol}://${url} State: ${(state || 'Unknown')}`;
                            console.log(line);
                        }
                    }
                    cli.verticalSpace();
                });
            });
        }
    });
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
        prompt: '',
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