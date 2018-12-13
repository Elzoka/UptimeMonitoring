/*
*
* Request handlers
*
*/

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config  = require('./config');

// Define the handlers
const handlers = {};


/*
*
* HTML Handlers
*
*/

handlers.index = (data, callback) => {
    if(data.method == 'get'){
        // Prepare data for interpolation
        let templateData = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds, When your site goes down, we\'ll send you a text to let you know.',
            'body.class': 'index'
        };

        // Read in a template as a string
        helpers.getTemplate('index', templateData,(err, str) => {
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
    }else{
        callback(405, undefined, 'html');
    }
}

// Favicon
handlers.favicon = (data, callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
        // Read in the favicon's data
        helpers.getStaticAsset('favicon.ico', (err, data) => {
            if(!err && data){
                // Callback the data
                callback(200, data, 'favicon');
            }else{
                callback(500);
            }
        });
    }else{
        callback(405);
    }
}

// Public assets
handlers.public = (data, callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
        // Get the filename being requested
        const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if(trimmedAssetName.length > 0){
            // Read in the assets data
            helpers.getStaticAsset(trimmedAssetName, (err, data) => {
                if(!err && data){
                    // Determine the content type (default to plain text)
                    let contentType = 'plain';

                    if(trimmedAssetName.includes('.css')){
                        contentType = 'css';
                    }
                    
                    if(trimmedAssetName.includes('.png')){
                        contentType = 'png';
                    }
                    if(trimmedAssetName.includes('.jpg')){
                        contentType = 'jpg';
                    }
                    if(trimmedAssetName.includes('.ico')){
                        contentType = 'favicon';
                    }

                    // callback the data
                    callback(200, data, contentType);

                }else{
                    callback(500);
                }
            });
        }else{
            callback(404);
        }
    }else{
        callback(405);
    }
}

/*
*
* JSON API Handlers
*
*/


// Users
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }else{
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    let {firstName, lastName, phone, password, tosAgreement} = data.payload;
    firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : null;
    lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : null;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : null;
    password = typeof(password) == 'string' && password.trim().length > 10 ? password.trim() : null;
    tosAgreement = typeof(tosAgreement) == 'boolean' && tosAgreement ==  true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user doesn't already exist
        _data.read('users', phone, (err, data) => {
            if(err){
                // Hash the password
                const hashedPassword = helpers.hash(password);

                if(!hashedPassword){
                    return callback(500, {'Error': 'Could not hash the user\'s password'});
                }
                // Create the user object
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    hashedPassword,
                    tosAgreement: true
                }

                // Store the user
                _data.create('users', phone, userObject, (err) => {
                    if(!err){
                        callback(200);
                    }else{
                        console.log(err);
                        callback(500, {Error: 'Couldn\'t create a new user'});
                    }
                });
            }else{
                callback(400, {'Error': 'A user with that phone number already exists'});
            }
        });
    }else{
        callback(400, {'Error' : "Missing required fields"})
    }
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
    // Check that the phone number is valid
    const phone = (typeof(data.queryStringObject.phone == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : null);
    if(phone){
        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : null;
        // verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsVaild) => {
            if(tokenIsVaild){
                // Lookup the user
                _data.read('users', phone, (err, data) => {
                    if(!err && data){
                        // Remove the hashed password from the user object before returning it to the requester
                        delete data.hashedPassword;
                        callback(200, data);
                    }else{
                        callback(404);
                    }
                });
            }else{
                callback(403, {'Error': 'Missing required token in header, or token is invalid'})
            }
        });
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
};

// Users - put
// Required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
    let {firstName, lastName, phone, password} = data.payload;
    // Check for the required fields
    phone = (typeof phone == 'string' && phone.trim().length == 10 ? phone.trim() : null);

    // Check for the optional fields
    firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : null;
    lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : null;
    password = typeof(password) == 'string' && password.trim().length > 10 ? password.trim() : null;

    // Error if the phone is invalid
    if(phone){
        // Error if nothing sent to update
        if(firstName || lastName || password){
            // Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : null;
            // verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsVaild) => {
                if(tokenIsVaild){
                    //Lookup the user
                _data.read('users', phone, (err, userData) => {
                    if(!err && userData){
                    // Update the fields necessary
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.hashedPassword = helpers.hash(password);
                    }

                    // Store the new update
                    _data.update('users', phone, userData, (err) => {
                        if(!err){
                            callback(200);
                        }else{
                            console.log(err);
                            callback(500, {'Error': 'Could not update the user'});
                        }
                    })
                }else{
                    callback(400, {'Error': 'The specified user does not exist'})
                }
            })
                }else{
                    callback(403, {'Error': 'Missing required token in header, or token is invalid'})
                }
            });
            
        }else{
            callback(400, {'Error': 'Missing fields to update'})
        }
    }else{
        callback(400, {'Error': 'Missing required field'})
    }
};

// Users - delete
// Required field : phone
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid
    const phone = (typeof(data.queryStringObject.phone == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : null);
    if(phone){
        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : null;
        // verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsVaild) => {
            if(tokenIsVaild){
                // Lookup the user
                _data.read('users', phone, (err, userData) => {
                if(!err && data){
                    _data.delete('users', phone, (err) => {
                            if(!err){
                                // Delete each of the checks associated with the user
                                const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                const checksToDelete = userChecks.length;

                                if(checksToDelete > 0){
                                    let checksDeleted = 0;
                                    let deletionError = false;

                                    // Delete the check
                                    userChecks.forEach(checkId => {
                                        // Delete the check
                                        _data.delete('checks', checkId, err => {
                                            if(err){
                                                deletionError = true;
                                            }
                                            checksDeleted++;

                                            if(checksDeleted == checksToDelete){
                                                if (!deletionError){
                                                    callback(200);
                                                }else{
                                                    callback(500, {'Error': 'Errors encountered while attempting to delete all of user\'s checks. All checks may not have been deleted'})
                                                }
                                            }
                                        });
                                    })
                                }else{
                                    callback(200);
                                }
                            }else{
                                callback(500, {'Error': 'Couldn\'t delete the specified user'})
                            }
                        });
                    }else{
                        callback(404, {'Error': 'Could not find the specified user'});
                    }
                });
            }else{
                callback(403, {'Error': 'Missing required token in header, or token is invalid'})
            }
        });
        
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
};

// Tokens
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put','delete'];
    if(acceptableMethods.includes(data.method)){
        handlers._tokens[data.method](data, callback);
    }else{
        callback(405);
    }
};

// Container for all the tokens methods;
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    let {phone, password} = data.payload;
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : null;
    password = typeof(password) == 'string' && password.trim().length > 10 ? password.trim() : null;
   
    if(phone && password){
        // Lookup the user who matched that phone number
        _data.read('users', phone, (err, userData) => {
            if(!err && userData){
                // Hash the sent password, and compare it to the password stored in the user object
                const hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // if valid create a new token with a random name, set expiration date 1 hour in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        phone,
                        expires,
                        id: tokenId
                    };
                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if(!err){
                            callback(200, tokenObject);
                        }else{
                            callback(500, {'Error': 'Could not create the new token'})
                        }
                    });
                }else{
                    callback(400, {'Error': 'Password did not match the specified user\'s stored password'})
                }
            }else{
                callback(400, {'Error': 'Could not find the specified user'});
            }
        });
    }else{
        callback(400, {'Error': 'Missing required field(s)'})
    }
}

// Tokens - get
// Rquired data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
    // Check that the id is valid
    const id = (typeof(data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id : null);
    if(id){
        // Lookup the user
        _data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData){
                callback(200, tokenData);
            }else{
                callback(404);
            }
        });
    }else{
        callback(400, {'Error': 'Missing required field'});
    }

}

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    let {id, extend} = data.payload;

    id = (typeof id == 'string' && id.trim().length == 20) ? id.trim() : null;
    extend = (typeof extend == 'boolean' && extend == true) ? true : false;

    if(id && extend){
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData){
                // Check to make sure the token isn't already expired
                if(tokenData.expires > Date.now()){
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update('tokens', id, tokenData, (err) => {
                        if(!err){
                            callback(200);
                        }else{
                            callback(500, {'Error': 'Could not update the token\'s expiration'})
                        }
                    });
                }else{
                    callback(400, {'Error': 'The token has already expired, and cannot be extended'})
                }
            }else{
                callback(400, {'Error': 'Specified token does not exist'})
            }
        });
    }else{
        callback(400, {'Error': 'Missing required field(s) or field(s) are invalid'})
    }
}

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
    // Check that the id is valid
    const id = (typeof(data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id : null);
    if(id){
        // Lookup the user
        _data.read('tokens', id, (err, data) => {
            if(!err && data){
                _data.delete('tokens', id, (err) => {
                    if(!err){
                        callback(200);
                    }else{
                        callback(500, {'Error': 'Couldn\'t delete the specified token'})
                    }
                });
            }else{
                callback(404, {'Error': 'Could not find the specified token'});
            }
        });
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    //Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData){
            // Check that the token is for the given user and has not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    })
}

// Checks
handlers.checks = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    if(acceptableMethods.includes(data.method)){
        handlers._checks[data.method](data, callback);
    }else{
        callback(405);
    }
}

// Container for all the checks methods

handlers._checks = {};

// Checks - post
// required data: protocol, url, method, successCodes, timeoutSeconds
// optional data: none

handlers._checks.post = (data, callback) => {
    let {protocol, url, method, successCodes, timeoutSeconds} = data.payload;

    protocol = typeof(protocol) == 'string' && ['http', 'https'].includes(protocol.trim()) ? protocol.trim() : null;
    url = typeof(url) == 'string' && url.trim().length > 0 ? url.trim() : null;
    timeoutSeconds = typeof(timeoutSeconds) == 'number' && timeoutSeconds % 1 == 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : null;
    method = typeof(method) == 'string' && ['post', 'get', 'update', 'delete'].includes(method.trim()) ? method.trim() : null;
    successCodes = typeof(successCodes) == 'object' && successCodes instanceof Array  && successCodes.length > 0? successCodes : null;
    
    if(protocol && url && method && successCodes && timeoutSeconds){
        // Get the tokens from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : null;

        // lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData) => {
            if(!err && tokenData){
                const userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, (err, userData) => {
                    if(!err && userData){
                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        // Verify that the user has less than the max-checks-per-user
                        if(userChecks.length < config.maxChecks){
                            // Create random id for the check
                            const checkId = helpers.createRandomString(20);

                            // Create the check object, and include the user's phone
                            const checkObject = {
                                id: checkId,
                                userPhone,
                                protocol,
                                url,
                                method,
                                successCodes,
                                timeoutSeconds
                            };

                            // Save the object
                            _data.create('checks', checkId, checkObject, (err) => {
                                if(!err){
                                    // Add the check id to the users's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // Save the new user Data
                                    _data.update('users', userPhone, userData, (err) => {
                                        if(!err){
                                            // Return the data to the new check
                                            callback(200, checkObject);
                                        }else{
                                            callback(500, {'Error': 'Could not update the user with the new check'});
                                        }
                                    });
                                }else{
                                    callback(500, {'Error': 'Could not create the new check'})
                                }
                            });
                        }else{
                            callback(400, {'Error': `The user already has the maximum number of checks (${config.maxChecks})`})
                        }
                    }else{

                    }
                });
            }else{
                callback(403);
            }
        });
    }else{
        callback(400, {'Error': 'Missing required inputs, or inputs are invalid'});
    }
}

// Checks - get
// Required data: id
// Optional data: none

handlers._checks.get = (data, callback) => {
    // Check that the id number is valid
    const id = (typeof(data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 10) ? data.queryStringObject.id : null);
    if(id){
        // Lookup the check
        _data.read('checks', id, (err, checkData) => {
            if(!err && checkData){

                // Get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : null;
                // verify that the given token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsVaild) => {
                    if(tokenIsVaild){
                        // Return the check data
                        callback(200, checkData);
                    }else{
                        callback(403);
                    }
                });
            }else{
                callback(404);
            }
        });
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
}

// Checks - put
// Required data: id
// Optional data: protocol, url, method, successCodes, timeoutSeconds (one must be sent)
handlers._checks.put = (data, callback) => {
    let {id, protocol, url, timeoutSeconds, method, successCodes} = data.payload;
    // Check for the required fields
    id = (typeof id == 'string' && id.trim().length == 20 ? id.trim() : null);

    // Check for the optional fields
    protocol = typeof(protocol) == 'string' && ['http', 'https'].includes(protocol.trim()) ? protocol.trim() : null;
    url = typeof(url) == 'string' && url.trim().length > 0 ? url.trim() : null;
    timeoutSeconds = typeof(timeoutSeconds) == 'number' && timeoutSeconds % 1 == 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : null;
    method = typeof(method) == 'string' && ['post', 'get', 'update', 'delete'].includes(method.trim()) ? method.trim() : null;
    successCodes = typeof(successCodes) == 'object' && successCodes instanceof Array  && successCodes.length > 0? successCodes : null;
    
    // Check ti make sure id is valid
    if(id){
        // Check to make sure one or more optional fields has been sent
        if(protocol || url || method || successCodes || timeoutSeconds){
            // Lookup the checks
            _data.read('checks', id, (err, checkData) => {
                if(!err && checkData){
                   // Get the token from the headers
                    const token = typeof(data.headers.token) == 'string' ? data.headers.token : null;
                    // verify that the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsVaild) => {
                        if(tokenIsVaild){
                            // Update the check where necessary
                            if(protocol){
                                checkData.protocol = protocol;
                            }
                            if(url){
                                checkData.url = url;
                            }
                            if(method){
                                checkData.method = method;
                            }
                            if(successCodes){
                                checkData.successCodes = successCodes;
                            }
                            if(timeoutSeconds){
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            // store the new update
                            _data.update('checks', id, checkData, (err) => {
                                if(!err){
                                    callback(200);
                                }else{
                                    callback(500, {'Error': 'Could not update the check'})
                                }
                            });
                        }else{
                            callback(403);
                        }
                    }); 
                }else{
                    callback(400, {'Error': 'Check ID did not exist'});
                }
            });
        }else{
            callback(400, {'Error': 'Missing field to update'});
        }

    }else{
        callback(400, {'Error': 'Missing required field'});
    }
    

}

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = (data, callback) => {
    // Check that the phone number is valid
    const id = (typeof(data.queryStringObject.id == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id : null);
    if(id){
        // Lookup the check
        _data.read('checks', id, (err, checkData) => {
            if(!err && checkData){
                // Get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : null;
                // verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsVaild) => {
                    if(tokenIsVaild){

                        // Delete the check data
                        _data.delete('checks', id, (err) => {
                            if(!err){
                                // Lookup the user
                                _data.read('users', checkData.userPhone, (err, userData) => {
                                    if(!err && userData){
                                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                        // remove the deleted check from their list of checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            // resave the users data

                                            _data.update('users', checkData.userPhone, userData,(err) => {
                                                if(!err){
                                                    callback(200);
                                                }else{
                                                    callback(500, {'Error': 'Couldn\'t update the user'})
                                                }
                                            });
                                        }else{
                                            callback(500, {'Error': 'Could not find the check on the users object, so could not remove it'})
                                        }
                                    }else{
                                        callback(500, {'Error': 'Could not find the user who created the check'});
                                    }
                                });
                            }else{
                                callback(500, {'Error': 'Could not delete check data'});
                            }
                        });
                    }else{
                        callback(403);
                    }
                });
            }else{
                callback(400, {'Error': 'Check id does not exist'});
            }
        });
        
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
};





handlers.ping = function(data, callback){
    callback(200);
}

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};


// Export the module
module.exports = handlers;