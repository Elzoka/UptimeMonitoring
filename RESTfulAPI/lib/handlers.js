/*
*
* Request handlers
*
*/

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers
const handlers = {};

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
// @TODO cleanup (delete) any other data files associated with the user

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
                _data.read('users', phone, (err, data) => {
                if(!err && data){
                    _data.delete('users', phone, (err) => {
                            if(!err){
                                callback(200);
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

handlers.ping = function(data, callback){
    callback(200);
}

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};


// Export the module
module.exports = handlers;