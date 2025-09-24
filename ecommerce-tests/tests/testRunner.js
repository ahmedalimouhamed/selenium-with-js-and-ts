const DriverManager = require('../src/core/DriverManager');
const reporting = require('../src/core/Reporting');
const fs = require('fs');
const path = require('path');

class TestRunner{
    constructor(){
        this.reporting = new reporting();
        this.testResults = [];
        this.startTime = new Date();
    }

    async runTests(testFiles, browser='chrome'){
        console.log('Starting test execution...');
        console.log(`Start Time : ${this.startTime.toLocaleString()}`);
        console.log(`Browser : ${browser}`);
        console.log('='.repeat(60));

        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;

        for(const testFile of testFiles){
            const tests = require(testFile);
            totalTests += tests.length;

            for(const test of tests){
                try{
                    await DriverManager.createDriver(browser);
                    this.reporting.startTest(test.name);
                    const startTime = Date.now();
                    await test.execute();
                    const duration = Date.now() - startTime;
                    
                    this.reporting.endTest(test.name, true, duration);
                    passedTests++;

                    this.testResults.push({
                        name: test.name,
                        status: 'PASSED',
                        duration: duration,
                        error: null
                    });
                }catch(error){
                    const duration = Date.now() - Date.now();
                    this.reporting.endTest(test.name, false, duration, error.message);
                    failedTests++;

                    this.testResults.push({
                        name: test.name,
                        status: 'FAILED',
                        duration: duration,
                        error: error.message
                    });

                    await this.reporting.takeScreenshot(`FAILED_${test.name}`);
                }finally{
                    await DriverManager.quitDriver();
                }
            }
        }

        await this.generateReport(totalTests, passedTests, failedTests);
    }

    async generateReport(total, passed, failed){
        const endTime = new Date();
        const totalDuration = endTime - this.startTime;
        
        const report = {
            summary: {
                totalTests: total,
                passed: passed,
                failed: failed,
                successRate: ((passed / total) * 100).toFixed(2),
                startTime: this.startTime.toISOString(),
                endTime: endTime.toISOString(),
                totalDuration: totalDuration
            },

            details: this.testResults
        };

        const reportDir = 'reports';
        if(!fs.existsSync(reportDir)){
            fs.mkdirSync(reportDir, {recursive: true});
        }

        const reportFile = path.join(reportDir, `test-report-${date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        await this.generateHTMLReport(report);
        console.log('\n'+'='.repeat(60));
        console.log('Test Execution Summary:');
        console.log('\n'+'='.repeat(60));
        console.log(`Total Tests: ${total}`);
        console.log(`Passed Tests: ${passed}`);
        console.log(`Failed Tests: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);
        console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)} s`);
        console.log('='.repeat(60));

        if(failed > 0){
            process.exit(1)
        }
    }

    async generateHTMLReport(report){
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Test Report</title>
                    <style>
                        body{
                            font-family: Arial, sans-serif;
                            margin: 40px;
                            background-color: #f4f4f9;
                        }

                        .header{
                            background: #2c3e50;
                            color: white;
                            padding: 20px;
                            border-radius: 5px;
                        }

                        .summary{
                            background: #2c3e50;
                            color: white;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px;
                        }

                        .test{
                            padding: 15px;
                            margin: 10px 0;
                            border-left: 5px solid;
                            border-radius: 3px;
                        }

                        .passed{
                            border-color: #27ae60;
                            background-color: #d5f4e6;
                        }

                        .failed{
                            border-color: #c0392b;
                            background-color: #f4d5d5;
                        }

                        .metrics{
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 10px;
                        }

                        .metric{
                            background: white;
                            padding: 15px;
                            text-align: center;
                            border-radius: 5px;
                        }
                        
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Ecommerce Test Automation Report</h1>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>

                    <div class="summary">
                        <h2>Test Summary</h2>
                        <div class="metrics">
                            <div class="metric">Total Tests: ${report.summary.totalTests}</div>
                            <div class="metric">Passed Tests: ${report.summary.passed}</div>
                            <div class="metric">Failed Tests: ${report.summary.failed}</div>
                            <div class="metric">Success Rate: ${report.summary.successRate}%</div>
                        </div>
                        <p><strong>Duration: ${report.summary.totalDuration / 1000}.toFixed(2)} seconds</strong></p>
                    </div>

                    <h2>Test Details</h2>
                    ${report.details.map(test => `
                        <div class="test ${test.status.toLowerCase()}">
                            <h3>${test.name}</h3>
                            <p>Status: <span style="color:${test.status === 'PASSED' ? '#27ae60' : '#e74c3c'}">${test.status}</span>></p>
                            <p>Duration: ${test.duration / 1000}.toFixed(2)} seconds</p>
                            ${test.error ? `<p>Error: ${test.error}</p>` : ''}
                        </div>
                    `).join('')}
                </body>
            </html>
        `;
        fs.writeFileSync('reports/test-report.html', html);
    }
}

module.exports = TestRunner;
