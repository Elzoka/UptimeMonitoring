/*
*
* Heloers for various tasks
*
*/

// Dependencies
const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');
const path = require('path');
const fs = require('fs');

const config = require('./config');

// Container for all the helpers
let helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }else {
        return null;
    }
}

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = (str) => {
    try{
        const obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }   
}

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = (strLength) =>{
    strLength = (typeof(strLength) == 'number' && strLength > 0) ? strLength : null;
    if(strLength){
        // Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let str = '';
        for(i = 1; i <= strLength; i++){
            // Get a random character from the possibleCharacters string
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the final string
            str +=randomCharacter;
        }
        return str;
    }else{
        return null;
    }
}

helpers.sendTwilioSms = (phone, msg, callback) => {
    // Validate the parameters
    // Send an SMS message via twilio
    phone = typeof phone == 'string' && phone.trim().length == 10 ? phone.trim() : null;
    msg = typeof msg == 'string' && msg.length > 0 && msg.trim().length <= 1600 ? msg.trim() : null;
    if(phone && msg){
        // Configure the request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+20'+ phone,
            'Body': msg
        };

        // Stringify the payload
        const stringPayload = querystring.stringify(payload);
        // Configure the request details
        const requestDetails = {
            'protocol': "https:",
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path' : `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
            'auth': `${config.twilio.accountSid}:${config.twilio.authToken}`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        }
        
        // Inistantiate the request object
        const req = https.request(requestDetails, (res) => {
            // Grab the status of the sent request
            const status = res.statusCode;
            // Callback successfully if request went through
            if(status == 200 || status == 201){
                callback(null);
            }else {
                callback('Status code returned was '+ status);
                console.log(res);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', (e) => {
            callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end;
    }else{
        callback('Given parameters were missing or invalid');
    }
};

// Get the string content of a template
helpers.getTemplate = (templateName, callback) => {
    templateName = typeof templateName == 'string' && templateName.length > 0 ? templateName : null;

    if(templateName){
        const templatesDir = path.join(__dirname, '../templates');
        fs.readFile(`${templatesDir}/${templateName}.html`, 'utf8', (err, str) => {
            if(!err && str && str.length > 0){
                callback(null, str);
            }else{
                callback('No template could be found');
            }
        });

    }else{
        callback('A valid template name was not specified');
    }
};


// Export the module
module.exports = helpers;