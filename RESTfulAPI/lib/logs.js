/*
*
*   Library for storing and rotating logs
*
*/

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container for the module
const lib = {};

// Base directory of the logs folder
lib.baseDir = path.join(__dirname, '../.logs');

// Append a string to a file, create a file if it not exist.
lib.append = (file, str, callback) => {
    // Open the file for appending
    fs.open(`${lib.baseDir}/${file}.log`, 'a', (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            fs.appendFile(fileDescriptor, str + '\n', (err) => {
                if(!err){
                    fs.close(fileDescriptor, (err) => {
                        if(!err){
                            callback(null);
                        }else{
                            callback('Error closing file that was being appended');
                        }
                    });
                }else{
                    callback('Error appending to file');
                }
            });
        }else{
            callback('Could not open file for appending')
        }
    });
}

// List all the logs and optionally includes the compressed logs
lib.list = (includeCompressedLogs, callback) => {
    fs.readdir(lib.baseDir, (err, data) => {
        if(!err && data && data.length > 0){
            const trimmedFileNames = [];
            data.forEach(fileName => {
                // Add the .log files
                if(fileName.includes('.log')){
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }

                // Add on the .gz files
                if(fileName.includes('.gz.b64') && includeCompressedLogs){
                    trimmedFileNames.push(fileName.push(fileName.replace('.gz.b64')));
                }
            });
            callback(null, trimmedFileNames);
        }else{
            callback(err, data);
        }
    });
}

// Compress the contents of one .log file into a .gz.64 file within the same dir
lib.compress = (logId, newFileId, callback) => {
    const sourceFile = logId + '.log';
    const destinationFile = newFileId + '.gz.b64';

    // Read the source file
    fs.readFile(`${lib.baseDir}/${sourceFile}`, 'utf8', (err, inputString) => {
        if(!err && inputString){
            // Compress the data using gzip
            zlib.gzip(inputString, (err, buffer) => {
                if(!err && buffer){
                    // Send the data to the destination file
                    fs.open(`${lib.baseDir}/${destinationFile}`, 'wx', (err, fileDescriptor) => {
                        if(!err && fileDescriptor){
                            // Write to the destination file
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                                if(!err){
                                    fs.close(fileDescriptor, (err) => {
                                        if(!err){
                                            callback(null);
                                        }else{
                                            callback(err);
                                        }
                                    });
                                }else{
                                    callback(err);
                                }
                            });
                        }else{
                            callback(err);
                        }
                    });
                }else{
                    callback(err);
                }
            });
        }else{
            callback(err);
        }
    });
};

// Decompress the content of the .gz.b64 file into a string variable
lib.decompress = (fileId, callback) => {
    const fileName = fileId + '.gz.b64';

    fs.readFile(`${lib.baseDir}/${fileName}`, 'utf8',(err, str) => {
        if(!err && str){
            // Decompress the data
            const inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, (err, outputBuffer) => {
                if(!err && outputBuffer){
                    // Callback
                    const str = outputBuffer.toString();
                    callback(null ,str);
                }else{
                    callback(err);
                }
            });
        }else{
            callback(err);
        }
    });
}

// Truncate a log file
lib.truncate = (logId, callback) => {
     fs.truncate(`${lib.baseDir}/${logId}.log`, 0, err => {
        if(!err){
            callback(null);
        }else{
            callback(err);
        }
     });
};

// Export the module
module.exports = lib;