const TestRunner = require('./tests/testRunner');

const path = require('path');

async function main(){
    const runner = new TestRunner();
    
    const testFiles = [
        path.join(__dirname, 'tests', 'smoke', 'smokeTests.js'),
        path.join(__dirname, 'tests', 'regression', 'regressionTests.js')
    ];

    try{
        await runner.runTests(testFiles);
    }catch(error){
        console.error("X test execution failed", error.message);
        process.exit(1);
    }
}

const args = process.argv.slice(2);

if(args.includes('--help')){
    console.log(`
    Usage: node run.js [options]
    Options:
        --help    Show this help message
        --smoke   Run smoke tests
        --regression Run regression tests
        --all     Run all tests
        --browser <name>  Run tests in Chrome or Firefox
    `);
    process.exit(0);
}

main().catch(console.error)