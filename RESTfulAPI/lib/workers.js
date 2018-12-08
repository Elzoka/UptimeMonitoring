/*
*
* Worker-related tasks
*
*/

const util = require('util');
const https = require('https');
const http = require('http');
const url = require('url');

const _data = require('./data');
const helpers = require('./helpers');
const _logs = require('./logs');

const debug = util.debuglog('workers');

// Instantiate the worker object
const workers = {};

// Lookup all the checks, get their data, send to validator
workers.gatherAllChecks = () => {
    _data.list('checks', (err, checks) => {
        if(!err && checks && checks.length > 0){
            checks.forEach(check => {
                // Read in the check data
                _data.read('checks', check, (err, originalCheckData) =>{
                    if(!err && originalCheckData){
                        // pass it to the check validator, and let that function continue or log error
                        workers.validateCheckData(originalCheckData);
                    }else {
                        debug('Error reading one of the check data');
                    }
                });
            });
        }else{
            debug("Error: Could not find any checks to process");
        }
    });
};

// Sanity-check the check-data
workers.validateCheckData = (originalCheckData) => {
    originalCheckData = typeof originalCheckData == 'object' && originalCheckData != null ? originalCheckData : {};

    const {id, userPhone, protocol, url, method, successCodes, timeoutSeconds, state, lastChecked} = originalCheckData;

    originalCheckData.id = typeof id == 'string' && id.trim().length == 20 ? id.trim() : null;
    originalCheckData.userPhone = typeof userPhone == 'string' && userPhone.trim().length == 10 ? userPhone.trim() : null;
    originalCheckData.url = typeof url == 'string' && url.trim().length > 0 ? url.trim() : null;
    originalCheckData.protocol = typeof protocol == 'string' && ['http', 'https'].includes(protocol.trim()) ? protocol.trim() : null;
    originalCheckData.method = typeof method == 'string' && ['post', 'get', 'put', 'delete'].includes(method.trim()) ? method.trim() : null;
    originalCheckData.successCodes = typeof successCodes == 'object' && successCodes instanceof Array && successCodes.length >  0 ? successCodes : null;
    originalCheckData.timeoutSeconds = typeof timeoutSeconds == 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : null;

    // Set the keys that may not be set (if the workers have never seen this check before)
    originalCheckData.state = typeof state == 'string' && ['up', 'down'].includes(state) ? state : 'down';
    originalCheckData.lastChecked = typeof lastChecked == 'number' && lastChecked > 0 ? lastChecked : null;

    // if all the checks pass, pass the data along to the next stop on the process
    if(
        originalCheckData.id &&
        originalCheckData.userPhone &&
        originalCheckData.url &&
        originalCheckData.protocol &&
        originalCheckData.method &&
        originalCheckData.successCodes &&
        originalCheckData.timeoutSeconds
    ){
        workers.perfomCheck(originalCheckData);
    }else{
        debug('Error: one of the checks is not properly formatted. Skipping it');
    }
}

// Perform the check, send the originalCheckData and the outcome of the check process to the next step in the process
workers.perfomCheck = (originalCheckData) => {
    // Prepare the initial check outcome
    let checkOutcome = {
        error: null,
        responseCode : null
    }

    // Mark that the outcome has not been sent
    let outcomeSent = false;

    // Parse the hostname and the path out of the originalCheckData
    const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true)
    const {hostname, path} = parsedUrl;

    // Constracting the request
    const requestDetails = {
        protocol: originalCheckData.protocol+":",
        hostname,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000
    }

    // Instantiate the request object (using either http or https module)
    const _moduleToUse = originalCheckData.protocol == 'http' ? http : https;

    const request = _moduleToUse.request(requestDetails, (res) => {
        // Grab the status of the sent request
        const status = res.statusCode;

        // Update the checkOutcome and pass the data along
        checkOutcome.responseCode = status;
        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the error event so it doesn't get thrown
    request.on('error', (e) => {
        // Update the checkOutcome and pass the data along
        checkOutcome = {
            error: true,
            value: e
        }

        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the timeout event
    request.on('timeout', (e) => {
        // Update the checkOutcome and pass the data along
        checkOutcome.error = {
            error: true,
            value: 'timeout'
        }

        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // End the request
    request.end();
}

// Process the check outcome, update the check data as needed, trigger an alert to the user if needed
// Special logic for accomodating a check that has never been tested before (Don't want to alert on that one)
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
    // Decide if the check is considered up or down
    const state = (!checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.includes(checkOutcome.responseCode) ? 'up' : 'down');
    // Deccide if an alert is warranted
    const alertWarranted = originalCheckData.lastChecked && originalCheckData.state != state;

    // Log the outcome
    const timeOfCheck = Date.now();
    workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);

    // update the check data
    const newCheckData = {
        ...originalCheckData,
        state,
        lastChecked: timeOfCheck
    };

    // Save the updates
    _data.update('checks', newCheckData.id, newCheckData, (err) => {
        if(!err){
            // Send the new check data to the new next phase in the process if needed
            if(alertWarranted){
                workers.alertUsertoStatusChange(newCheckData);
            }else{
                debug('Check outcome has not changed, no alert needed')
            }
        }else{
            debug('Error trying to save updates to one of the checks')
        }
    });
}

// Alert the user as to change in their check status
workers.alertUsertoStatusChange = ({method, protocol, url, state, userPhone}) => {
    const msg = `Alert: Your check for ${method.toUpperCase()} ${protocol}://${url} is currently ${state}`;
    helpers.sendTwilioSms(userPhone, msg, err => {
        if(!err){
            debug('Success: User was alerted to a status change in their check, via sms', msg);
        }else{
            debug('Error: Couldnot send sms alert to user who had a state change in their check');
        }
    });
};

//
workers.log = (originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) => {
    // Form the log data
    const logData = {
        check: originalCheckData,
        outcome:checkOutcome,
        state,
        alert: alertWarranted,
        time: timeOfCheck
    }

    const logString = JSON.stringify(logData);

    // Determine the name of the log file
    const logFileName = originalCheckData.id;

    // Append the log string to the file
    _logs.append(logFileName, logString, (err) => {
        if(!err){
            debug('Logging to file succeeded');
        }else{
            debug('Logging to file failed');
        }
    });
}


// Timer to execute the worker-process once per Minute
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

// Rotate (Compress) file log files
workers.rotateLogs = () => {
    // Listing all the (non compressed) log files
    _logs.list(false, (err, logs) => {
        if(!err && logs && logs.length > 0){
            logs.forEach(logName => {
                // Compress the data to different file
                const logId = logName.replace('.log', '');
                const newFileId = logId + '-' + Date.now();
                _logs.compress(logId, newFileId, err => {
                    if(!err){
                        // Truncate the log
                        _logs.truncate(logId, (err) => {
                            if(!err){
                                debug('Success Truncating the logFile');
                            }else{
                                debug('Error Truncating the logFile');
                            }
                        });
                    }else{
                        debug('Error compressing one of the file', err);
                    }
                });
            });
        }else {
            debug('Error: Could not find any logs to rotate');
        }
    });
};

// Timer to execute the log-rotation once per day
workers.logRotaionLoop = () => {
    setInterval(() => {
        workers.rotateLogs();
    }, 1000 * 60 * 60 * 24);
}

// Init script
workers.init = () => {
    // Send to console, in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

    // Execute all the checks immediatly
    workers.gatherAllChecks();
    // Call the loop so the checks will execute later on
    workers.loop();

    // Compress all the logs immediatly
    workers.rotateLogs();

    // Call the compression loop so logs will be compressed later on
    workers.logRotaionLoop();
};

// Export the module
module.exports = workers;