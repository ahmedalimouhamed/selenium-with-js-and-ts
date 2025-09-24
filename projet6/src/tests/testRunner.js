const DriverManager = require('../core/DriverManager');
const Reporting = require('../core/Reporting');
const {config} = require('../utils/configLoader');
const fs = require('fs');
const path = require('path');

class TestRunner{
    constructor(){
        this.reporting = new Reporting();
        this.testResults = [];
        this.currentTest = null;
        this.parallelExecutions = new Map();
    }

    async runTestSuite(testSuite, options= {}){
        const{
            browser = 'chrome',
            parallel = false,
            maxParallel = 3,
            retryFailed = false,
            environment = 'dev'
        } = options;

        this.reporting.startTestSuite(testSuite.name);

        if(parallel){
            await this.runTestsInParallel(testSuite.tests, maxParallel, browser, environment);
        }else{
            await this.runTestsSequentially(testSuite.tests, browser, environment, retryFailed);
        }

        await this.generateFinalReport();
        return this.testResults;
    }

    async runTestsSequentially(tests, browser, environment, retryFailed){
        for(const test of tests){
            let attempt = 1;
            const maxAttempts = retryFailed ? 3 : 1;
            let result = null;

            while(attempt <= maxAttempts && !result?.success){
                this.reporting.startTest(test.name, attempt);

                try{
                    await DriverManager.createDriver(browser, {environment});
                    result = await this.executeTest(test, environment);

                    if(result.success){
                        this.reporting.endTest(test.name, true, result.duration);
                    }else if(attempt < maxAttempts){
                        this.reporting.logStep(`Test failed, retrying... (Attempt ${attempt + 1}/${maxAttempts})`)
                    }
                }catch(e){
                    result = {
                        success: false,
                        error: e.message,
                        duration: 0
                    }
                }finally{
                    await DriverManager.quitAllDrivers();
                    attempt++;
                }
            }

            this.testResults.push({
                name: test.name,
                ...result,
                attempts: attempt - 1,
            });
        }
    }

    async runTestsInParallel(tests, maxParallel, browser, environment){
        const testQueue = [...tests];
        const runningTests = new Set();

        while(testQueue.length > 0 || runningTests.size > 0){
            while(runningTests.size < maxParallel && testQueue.length > 0){
                const test = testQueue.shift();
                const testPromise = this.runSingleTest(test, browser, environment);
                runningTests.add(testPromise);

                testPromise.then(result => {
                    runningTests.delete(testPromise);
                    resourceLimits.push(result);
                });
            }

            if(runningTests.size() >= maxParallel){
                await Promise.race(runningTests);
            }
        }

        await Promise.all(runningTests);
        this.testResults = results;
    }

    async runSingleTest(test, browser, environment){
        this.reporting.startTest(test.name);
        
        try{
            await DriverManager.createDriver(browser, {environment});
            const startTime = Date.now();

            await text.execute();

            const duration = Date.now() - startTime;
            this.reporting.endTest(test.name, true, duration);

            return{
                test: test.name,
                success: true,
                duration,
                error: null
            }
            
        }catch(e){
            const duration = Date.now() - Date.parse(this.currentTest.startTime);
            this.reporting.endTest(test.name, false, duration, e.message);

            return{
                test: test.name,
                success: false,
                duration,
                error: e.message
            }
        }finally{
            await DriverManager.quitAllDrivers();
        }
    }

    async executeTest(test, environment){
        const startTime = Date.now();

        try{
            await this.setupTestEnvironment(environment);

            for(const step of test.steps){
                await this.executeTestStep(step);
            }

            if(test.verification){
                await this.verifyTestResults(test.verification);
            }

            return {
                success: true,
                duration: Date.now() - startTime,
                error: null
            }
        }catch(e){
            return {
                success: false,
                duration: Date.now() - startTime,
                error: e.message
            }
        }
    }

    async setupTestEnvironment(environment){
        const envConfig = config.environments[environment];
        if(!envConfig){
            throw new Error(`Environment ${environment} not configured`);
        }     

        process.env.BASE_URL = envConfig.url;
        process.env.API_URL = envConfig.apiUrl;

        this.reporting.logStep(`Test environment set to ${environment}`);
    }

    async executeTestStep(step){
        const {action, locator, value, description} = step;

        this.reporting.logStep(description || `Executing : ${action}`);

        switch(action){
            case 'navigate':
                await this.currentPage.navigateTo(value);
                break;
            case 'click':
                await this.currentPage.click(locator);
                break;
            case 'type':
                await this.currentPage.type(value, locator);
                break;
            case 'select':
                await this.currentPage.selectDropsownByText(locator, value);
                break;
            case 'verify':
                await this.currentPage.verifyElementVisible(locator);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);    
            
        }
    }

    async verifyTestResults(verification){
        for(const verify of verification){
            const {type, locator, expected, description} = verify;

            switch(type){
                case 'text':
                    await this.currentPage.verifyTextContains(locator, expected, description);
                    break;
                case 'visible':
                    await this.currentPage.verifyElementVisible(locator, description);
                    break;
                case 'url':
                    const currentUrl = await this.currentPage.driver.getCurrentUrl();

                    if(!currentUrl.includes(expected)){
                        throw new Error(`URL verification failed. Expected: ${expected}, Got: ${currentUrl}`);
                    }

                    break;
                default:
                    throw new Error(`Unknown verification type: ${type}`);
            }
        }
    }

    async generateFinalReport(){
        const summary = {
            total: this.testResults.length,
            passed: this.testResults.filter(r => r.success).length,
            failed: this.testResults.filter(r => !r.success).length,
            successRate: 0,
            totalDuration: this.testResults.reduce((sum, r) => sum + r.duration, 0),
            startTime: new Date().toISOString(),
            environment: process.env.TEST_ENV || 'unknown',
            
        };
        
        summary.successRate = (summary.passed / summary.total) * 100;

        const htmlReport = this.generateHTMLReport(summary);
        fs.writeFileSync('reports/html-report/test-report.html', htmlReport);

        const jsonReport = {
            summary,
            details: this.testResults,
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync('reports/json-reports/test-report.json', JSON.stringify(jsonReport, null, 2));

        console.log('\n' + '='.repeat(50));
        console.log('Test Run Summary:');
        console.log('='.repeat(50));
        console.log('Total Tests: ' + summary.total);
        console.log('Passed Tests: ' + summary.passed);
        console.log('Failed Tests: ' + summary.failed);
        console.log('Success Rate: ' + summary.successRate.toFixed(2) + '%');
        console.log('Total Duration: ' + (summary.totalDuration / 1000).toFixed(2) + 's');
        console.log('='.repeat(50) + '\n');

        if(summary.failed > 0){
            process.exit(1);
        }
    }

    generateHTMLReport(summary){
        return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Test Report</title>
                <style>
                    body{
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                </style>
            </head>
            <body>
                <div class="report-container">
                    <h1>Test Report</h1>
                    <div class="summary">
                        <p>Total Tests: ${summary.total}</p>
                        <p>Passed Tests: ${summary.passed}</p>
                        <p>Failed Tests: ${summary.failed}</p>
                        <p>Success Rate: ${summary.successRate.toFixed(2)}%</p>
                        <p>Total Duration: ${(summary.totalDuration / 1000).toFixed(2)}s</p>
                    </div>
                </div>
            </body>
        </html>
        `
    }
}
