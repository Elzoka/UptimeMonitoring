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
    console.log('Got here');
    console.log(data.payload);
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
// @TODO Only let an authenticated user access their object, Don't let them access anyone elses
handlers._users.get = (data, callback) => {
    // Check that the phone number is valid
    const phone = (typeof(data.queryStringObject.phone == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : null);
    if(phone){
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
        callback(400, {'Error': 'Missing required field'});
    }
};

// Users - put
// Required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user update their object, Don't let them update anyone elses
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
            callback(400, {'Error': 'Missing fields to update'})
        }
    }else{
        callback(400, {'Error': 'Missing required field'})
    }
};

// Users - delete
// Required field : phone
// @TODO only let an authenticated user delete their object, Don't let them delete anyone else's
// @TODO cleanup (delete) any other data files associated with the user

handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid
    const phone = (typeof(data.queryStringObject.phone == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : null);
    if(phone){
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