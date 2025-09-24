const {By, until} = require('selenium-webdriver');
const DriverManager = require('../core/DriverManager');
const Reporting = require('../core/Reporting');

class BasePage{
    constructor(){
        this.driver = DriverManager.getDriver();
        this.reporting = new Reporting();
        this.selectors = require('../../config/selectors.json');
        this.timeout = 10000;
    }

    async navigateTo(url){
        try{
            await this.driver.get(url);
            await this.driver.wait(until.urlContains(url), this.timeout);
            this.reporting.logStep(`Navigated to: ${url}`);
            return true;
        }catch(e){
            this.reporting.logError('Failed to navigate to ' + url, 'fail');
            throw e;
        }
    }

    async click(element, elementName = 'Element'){
        try{
            const el = await this.driver.wait(until.elementLocated(element), this.timeout);
            await this.driver.wait(until.elementIsVisible(el), this.timeout);
            await el.click();
            this.reporting.logStep(`Clicked : ${elementName}`);
            return true;
        }catch(e){
            this.reporting.logError(`Failed to click : ${elementName}`, 'fail');
            throw e;
        }
    }

    async type(text, element, elementName='Input'){
        try{
            const el = await this.driver.wait(until.elementLocated(element), this.timeout);
            await this.driver.wait(until.elementIsVisible(el), this.timeout);
            await el.clear();
            await el.sendKeys(text);
            this.reporting.logStep(`Typed : ${text} into ${elementName}`);
            return true;
        }catch(e){
            this.reporting.logError(`Failed to type : ${elementName}`, 'fail');
            throw e;
        }
    }

    async getText(element, elementName='Element'){
        try{
            const el = await this.driver.wait(until.elementLocated(element), this.timeout);
            const text = await el.getText();
            this.reporting.logStep(`Go text from ${elementName}: ${text}`);
            return text;
        }catch(e){
            this.reporting.logError(`Failed to get text from : ${elementName}`, 'fail');
            throw e;
        }
    }

    async isElementVisible(element, timeout = 5000){
        try{
            const el = await this.driver.wait(until.elementLocated(element), timeout);
            return await el.isDisplayed();
        }catch(e){
            this.reporting.logError(`Failed to check visibility of element ${element}`, 'fail');
            throw e;
        }
    }

    async takeScreenshot(name){
        try{
            const screenshot = await this.driver.takeScreenshot();
            const filename = `reports/screenshots/${name}-${Date.now()}.png`;
            require('fs').writeFileSync(filename, screenshot, 'base64');
            this.reporting.logStep(`Screenshot taken: ${filename}`);
            return filename;
        }catch(e){
            this.reporting.logError(`Failed to take screenshot`, 'fail');
            throw e;
        }
    }

    async waitForPageLoad(){
        await this.driver.wait(async () => {
            return await this.driver.executeScript('return document.readyState') === 'complete';
        }, this.timeout);
    }
}

module.exports = BasePage;

