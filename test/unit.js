/*
*
* Unit Tests
*
*/

// Dependencies
const helpers = require('../lib/helpers');
const assert = require('assert');
const logs = require('./../lib/logs');

// Holder for tests
const unit = {};


// Assert that the getANumber function is returning 1
unit['helpers.getANumber should return 1'] = done => {
    const val = helpers.getANumber();
    assert.equal(val, 1);
    done();
};

// Assert that the getANumber function is returning a number
unit['helpers.getANumber should return a number'] = done => {
    const val = helpers.getANumber();
    assert.equal(typeof val, 'number');
    done();
};


// Assert that the getANumber function is returning 2
unit['helpers.getANumber should return 2'] = done => {
    const val = helpers.getANumber();
    assert.equal(val, 2);
    done();
};

// logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log names'] = (done) => {
    logs.list(true, (err, logFileNames) => {
        assert.equal(err, null);
        assert.ok(logFileNames instanceof Array);
        assert.ok(logFileNames.length > 1);
        done();
    });
};

// Logs.truncate should not throw if the logId doesn't exist
unit['logs.truncate should not throw if the logId does not exist. It should callback an error instead'] = (done) => {
    assert.doesNotThrow(() => {
        logs.truncate('I do not exist', err => {
            assert.ok(err);
            done();
        });
    }, TypeError);
};

// Export the test to the runner
module.exports = unit;