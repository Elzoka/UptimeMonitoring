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
helpers.getTemplate = (templateName, data, callback) => {
    templateName = typeof templateName == 'string' && templateName.length > 0 ? templateName : null;
    data = typeof data == 'object' && data !== null ? data : {};

    if(templateName){
        const templatesDir = path.join(__dirname, '../templates');
        fs.readFile(`${templatesDir}/${templateName}.html`, 'utf8', (err, str) => {
            if(!err && str && str.length > 0){
                // Do the interpolation on the string
                const finalString = helpers.interpolate(str, data);
                callback(null, finalString);
            }else{
                callback('No template could be found');
            }
        });
    }else{
        callback('A valid template name was not specified');
    }
};

// Add the universal header and footer to a string and pass the provided data object to the heaer and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
    str = typeof str == 'string' && str.length > 0 ? str : '';
    data = typeof data == 'object' && data !== null ? data : {};

    // Get the header
    helpers.getTemplate('_header', data, (err, headerString) => {
        if(!err && headerString){
            // Get the footer
            helpers.getTemplate('_footer', data, (err, footerString) => {
                if(!err && footerString){
                    // Add them all together
                    const fullString =  headerString + str + footerString;
                    callback(null, fullString);
                }else{
                    callback('Couldn\'t find the footer template');
                }
            });
        }else{
            callback('Couldn\'t find the header template');
        }
    });
}

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
    str = typeof str == 'string' && str.length > 0 ? str : '';
    data = typeof data == 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with "global"
    for(let keyName in config.templateGlobals){
        if(config.templateGlobals.hasOwnProperty(keyName)){
            data['global.'+keyName] = config.templateGlobals[keyName];
        }
    }
    // For each key in the data object, insert it's value into the string at the corresponding placeholder
    for(let key in data){
        if(data.hasOwnProperty(key) && typeof(data[key]) == 'string'){
            let replace = data[key];
            let find = `{${key}}`;
            str = str.replace(find, replace);
        }
    }
    return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, callback) => {
    fileName = typeof fileName == 'string' && fileName.length > 0 ? fileName : null;
    if(fileName){
        const publicDir = path.join(__dirname, '/../public');

        fs.readFile(`${publicDir}/${fileName}`, (err, data) => {
            if(!err && data){
                callback(null, data);
            }else{
                callback('No file could be found');
            }
        });
    }else{
        callback('A valid file name was not specified');
    }
};

helpers.renderPage = (pageName, templateData, callback) => {
    // Read in a template as a string
    helpers.getTemplate(pageName, templateData,(err, str) => {
        if(!err && str){
            // Add the universal header and footer
            helpers.addUniversalTemplates(str, templateData, (err, str) => {
                if(!err && str){
                callback(200, str, 'html');
                }else{
                callback(500, null, 'html');
                }
            });
        }else{
            callback(500, undefined, 'html');
        }
    });
}

// Export the module
module.exports = helpers;