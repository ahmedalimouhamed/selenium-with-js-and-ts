const fs = require('fs');
const path = require('path');
const DriverManager = require('./DriverManager');

class Reporting{
    constructor(){
        this.currentTest = null;
    }

    startTest(testName){
        this.currentTest = {
            name: testName,
            startTime: new Date(),
            steps: []
        };

        console.log(`\n+ Starting test : ${testName}`)
    }

    logStep(stepMessage){
        if(this.currentTest){
            this.currentTest.steps.push({
                time: new Date().toLocaleTimeString(),
                message: stepMessage
            })
        }
        console.log(`   ${stepMessage}`)
    }

    logError(message, error){
        const errorMessage = `${message} : ${error.message}`;
        if(this.currentTest){
            this.currentTest.steps.push({
                time: new Date().toLocaleTimeString(),
                message: `Error: ${errorMessage}`,
                error: true
            })
        }
        console.log(`   ${errorMessage}`)
    }

    async takeScreenshot(testName){
        try{
            const screenshot = await DriverManager.getDriver().takeScreenshot();
            const screenshotDir = path.join(__dirname, '../../reports/screenshots');

            if(!fs.existsSync(screenshotDir)){
                fs.mkdirSync(screenshotDir, {recursive: true});
            }

            const filename = path.join(screenshotDir, `${testName}-${Date.now()}.png`);
            fs.writeFileSync(filename, screenshot, 'base64');
            console.log(`   Screenshot saved ${filename}`);
            return filename;
        }catch(error){
            console.error(`Failed to take screenshot: ${error.message}`);
            return null;
        }
    }

    endTest(testName, passed, duration, errorMessage = null){
        const status = passed ? 'PASSED' : 'FAILED';
        const emoji = passed ? '✅' : '❌';
        console.log(`\n${emoji} Test: ${testName} ${status} (${duration}ms)`);
        
        if(errorMessage){
            console.log(`   Error: ${errorMessage}`);   
        }

        this.currentTest = null;
    }
} 

module.exports = Reporting;
