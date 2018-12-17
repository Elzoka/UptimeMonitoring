/*
*
* Test runner
*
*/

// Override the NODE_ENV variable
process.env.NODE_ENV = 'testing';


// Application logic for the test runner
_app = {};

// Container for the tests
_app.tests = {};

// add on unit tests
_app.tests.unit = require('./unit');

// add on api tests
_app.tests.api = require('./api');


// Count all the tests
_app.countTests = () => {
    let counter = 0;
    for (let key in _app.tests){
        if(_app.tests.hasOwnProperty(key)){
            const subTests = _app.tests[key];
            for(let testName in subTests){
                if(subTests.hasOwnProperty(testName)){
                    counter++;
                }
            }
        }
    }

    return counter;
}

// Run all tests, collecting the errors and successes
_app.runTests = () => {
    const errors = [];
    let successes = 0;
    const limit = _app.countTests();
    let counter = 0;

    for(let key in _app.tests){
        if(_app.tests.hasOwnProperty(key)){
            const subTests = _app.tests[key];
            for(let testName in subTests){
                if(subTests.hasOwnProperty(testName)){
                    (() => {
                        let tmpTestName = testName;
                        let testValue = subTests[testName];

                        // Call the test
                        try{
                            testValue(() => {
                                // If it calls back without throwing then it succeeded, so log it in green
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                                counter++;
                                successes++;

                                if(counter == limit){
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            });
                        }catch(e){
                            // If it throws, then it failed, so capture the error thrown and log it in red
                            errors.push({
                                name: testName,
                                error: e
                            });
                            console.log('\x1b[31m%s\x1b[0m', tmpTestName);
                            counter++;

                            if(counter == limit){
                                _app.produceTestReport(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }
}

// Produce a test outcome report
_app.produceTestReport = (limit, successes, errors) => {
    console.log("");
    console.log('-----------------------BEGIN TEST REPORT--------------------------');
    console.log("");
    console.log("Total Tests:", limit);
    console.log("Pass:", successes);
    console.log("Fail:", errors.length);
    console.log("");

    // If there are errors, print them in details
    if(errors.length > 0){
    console.log('-----------------------BEGIN ERROR REPORT--------------------------');
    console.log("");
    errors.forEach(testError => {
        console.log('\x1b[31m%s\x1b[0m', testError.name);
        console.log(testError.error);
        console.log("");
    });
    console.log('-----------------------END ERROR REPORT--------------------------');

    }

    console.log("");
    console.log('-----------------------END TEST REPORT--------------------------');

    process.exit(0);
}

// Run the tests
_app.runTests();