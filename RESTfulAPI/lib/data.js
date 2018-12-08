/*
*
* Library for storing and editing data
*
*/

// Dependencies
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');
// Container for the module (to be exported)
var lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data');

// Write data to a file
lib.create = (dir, file, data, callback) => {
    // Open the file for writing
    fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'wx', (err, fileDescriptor) =>{
        if(!err && fileDescriptor){
            // Convert data to string
            const stringData = JSON.stringify(data);

            //write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(null);
                        }else{
                            callback('Error closing new file');
                        }
                    })
                }else{
                    callback('Error writing to new file');
                }
            });
        }else{
            callback("Could not create new file, it may already exist");
        }
    });
}

//Read data from a file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf-8', (err, data) => {
        if(!err && data){
            var parsedData = helpers.parseJsonToObject(data);
            callback(null, parsedData);
        }else{
            callback(err, data);
        }
    });
};

// Update data inside a file
lib.update = (dir, file, data, callback) => {
    // Open the file for writing
    fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.ftruncate(fileDescriptor, (err) => {
                if(!err){
                    // write file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if(!err){
                            fs.close(fileDescriptor, (err) => {
                                if(!err){
                                    callback(null);
                                }else{
                                    callback('Error closing the file');
                                }
                            });
                        }else{
                            callback('Error writing to existing file')
                        }
                    });
                }else{
                    callback('Error truncating file')
                }
            });
        }else{
            callback('Could not open the file for updating, it may not exist yet');
        }
    });
};

// Delete a file
lib.delete = (dir, file, callback) => {
    // Unlink the file
    fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (err) => {
        if(!err){
            callback(null);
        }else{
            callback('Error deleting file');
        }
    });
}

// List all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.baseDir}/${dir}`, (err, data) => {
        if(!err && data && data.length > 0){
            const trimmedFileNames = [];
            data.forEach(fileName => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(null, trimmedFileNames);
        }else{
            callback(err, data)
        }
    });
};

// export
module.exports = lib;