const {By, until} = require('selenium-webdriver');
const DriverManager = require('../core/DriverManager');
const WaitManager = require('../core/WaitManager');
const Reporting = require('../core/Reporting');

class BasePage{
    constructor(){
        this.driver = DriverManager.getDriver();
        this.wait = new WaitManager();
        this.reporting = new Reporting();
        this.selectors = require('../../config/selectors.json');
    }

    async navigateTo(url){
        try{
            await this.driver.get(url);
            await this.forPageLoad();
            this.reporting.logStep('Navigated to ' + url);
            return true;
        }catch(e){
            this.reporting.logStep('Failed to navigate to ' + url, 'fail');
            throw e;
        }
    }

    async click(elementLocator, elementName='Element'){
        try{
            const element = await this.waitManager.forElementVisible(elementLocator);
            await element.click();
            this.reporting.logStep(`Clicked on : ${elementName}`);
            return true;
        }catch(e){
            this.reporting.logStep(`Failed to click on : ${elementName}`, 'fail');
            throw e;
        }
    }

    async type(text, elementLocator, elementName='Input Field'){
        try{
            const element = await this.wait.forElementVisible(elementLocator);
            await element.clear();
            await element.sendKays(text);
            this.reporting.logStep(`Typed '${text}' in: ${elementName}`);
            return true;
        }catch(e){
            this.reporting.logStep(`Failed to type ${text} in : ${elementName}`, 'fail');
            throw e;
        }
    }

    async getText(elementLocator, elemenetName='Element'){
        try{
            const element = await this.wait.forElementisible(elementLocator);
            const text = await element.getText();
            this.reporting.logStep(`Got text from ${elementName}: ${text}`);
            return text;
        }catch(e){
            this.reporting.logStep(`Failed to get text from ${elementName}`, 'fail');
            throw e;
        }
    }

    async selectDropdownByText(dropdownLocator, optionText, elementNam='Dropdown'){
        try{
            const dropdown = await this.wait.forElementVisible(dropdownLocator);
            const options = await dropdown.findElements(By.tagName('option'));

            for(const option of options){
                const text = await option.getText();
                if(text.trim() = await optionText){
                    await option.click();
                    this.reporting.logStep(`Selected '${optionText}' from ${elementName}`);
                    return true;
                }
            }

            throw new Error(`Option '${optionText}' not found in ${elementName}`);
        }catch(e){
            this.reporting.logStep(`Failed to select '${optionText}' from ${elementName}`, 'fail');
            throw e;
        }
    }

    async takeScreenshot(name){
        return await DriverManager.takeScreenshot(this.driver, name);
    }

    async verifyElementVisible(elementLocator, elementName='Element'){
        try{
            const isVisible = await this.wait.forElementVisible(elementLocator, 5000);
            this.reporting.logStep(`Verified ${elementName} is visible`);
            return isVisible !== null;
        }catch(e){
            this.reporting.logStep(`Failed to verify ${elementName} is visible`, 'fail');
            throw e;
        }
    }

    async verifyTextContains(elementLocator, expectedText, elementName='Element'){
        try{
            const actualText = await this.getText(elementLocator, elementName);
            const contains = actualText.includes(expectedText);

            if(contains){
                this.reporting.logStep(`Verified ${elementName} contains '${expectedText}'`)
            }else{
                this.reporting.logStep(`Text verification failed. Expected : '${expectedText}', Got '${actualText}'`);
            }
        }catch(e){
            this.reporting.logStep(`Failed to verify ${elementName} contains text: ${expectedText}`, 'fail');
            throw e;
        }
    }

    async executeJavaScript(script, ...args){
        return await this.driver.executeJavaScript(script, ...args);
    }

    async switchToFrame(frameLocator){
        const frame = await this.wait.forElementVisible(frameLocator);
        await this.driver.switchTo().frame(frame);
    }

    async handleAlert(action='accept'){
        const alert = await this.driver.switchTo().alert();
        if(action === 'accept'){
            await alert.accept();
        }else{
            await alert.dismiss();
        }
    }

    async getPerformanceMetrics(){
        return await DriverManager.getPerformanceMetrics(this.driver)
    }
}

module.exports = BasePage;

