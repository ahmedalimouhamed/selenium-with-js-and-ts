const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class SmartWaiter{
    constructor(driver){
        this.driver = driver;
        this.timeout = 15000;
    }

    async waitForElementVisible(selector, timeout=this.timeout){
        console.log(`Waiting for element to be visible : ${selector}`);
        const element = await this.driver.wait(
            until.elementLocated(selector),
            timeout
        );
    
        await this.driver.wait(
            until.elementIsVisible(element),
            timeout
        );
    
        console.log(`element is now visible : ${selector}`);
        return element;
    }

    async waitForElementClickable(selector, timeout=this.timeout){
        const element = await this.waitForElementVisible(selector, timeout);

        await this.driver.wait(async () => {
            try{
                return await element.isEnabled() && await element.isDisplayed();
            }catch{
                return false;
            }
        }, timeout);
        return element;
    }

    async waitForElementText(selector, expectedText, timeout=this.timeout){
        const element = await this.waitForElementVisible(selector, timeout);

        await this.driver.wait(async () => {
            try{
                const actualText = await element.getText();
                return actualText === expectedText;
            }catch{
                return false;
            }
        }, timeout);

        return element;
    }

    async waitForElementNotVisible(selector, timeout=this.timeout){
        console.log(`Waiting for element to disappear : ${selector}`);

        await this.driver.wait(async() => {
            try{
                const elements = await this.driver.findElements(selector);
                if(elements.length === 0) return true;

                const element = elements[0];
                return !(await element.isDisplayed());
            }catch{
                return true;
            }
        }, timeout);
        console.log(`Element is no longer visible : ${selector}`);
    }
}

async function testHiddenElement(){
    console.log('Testing Hidden Elements with Smart Waiting...\n');

    let driver;

    try{
        const options = new chrome.Options();
        options.addArguments('--no-sandbox');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        const waiter = new SmartWaiter(driver);
        console.log('1. Testing delayed element appearence...');
        await driver.get('https://the-internet.herokuapp.com/dynamic_loading/1');
        const startButton = await waiter.waitForElementClickable(By.css('#start button'));
        await startButton.click();

        const finisText = await waiter.waitForElementText(By.id('finish'), 'Hello World!');
        const text = await finisText.getText();
        console.log(`Delayed text appeared: ${text}`);

        console.log('\n2. Testing dropdown elements...');
        await driver.get('https://the-internet.herokuapp.com/dropdown');
        const dropdown = await waiter.waitForElementVisible(By.id('dropdown'));
        await dropdown.click();

        const option2 = await waiter.waitForElementVisible(By.css('option[value="2"]'));
        await option2.click();
        console.log('Dropdown option selected');

        console.log('\n3. Testing hover elements...');
        await driver.get('https://the-internet.herokuapp.com/hovers');

        const image = await waiter.waitForElementVisible(By.css('.figure'));
        const actions = driver.actions();
        await actions.move({origin: image}).perform();

        const hiddenText = await waiter.waitForElementVisible(By.css('.figcaption'));
        const profileText = await hiddenText.getText();
        console.log(`Hidden text on hover : "${profileText}"`);

        console.log('\n4. Testing modal elements...');
        await driver.get("https://the-internet.herokuapp.com/entry_ad");
        const modal = await waiter.waitForElementVisible(By.css('.modal'));
        const modalTitle = await modal.findElement(By.css('.modal-title')).getText();
        console.log(`Modal appeared "${modalTitle}"`);

        const closeButton = await waiter.waitForElementClickable(By.css('.modal .modal-footer p'));
        await closeButton.click();
        
        await waiter.waitForElementNotVisible(By.css('.modal'));
        console.log('Modal is closed successfully');

        console.log('\n5. Testing dynamic content...');
        await driver.get('https://the-internet.herokuapp.com/dynamic_controls');



        // click enable button
        const enableButton = await waiter.waitForElementClickable(
            By.css('#input-example button')
        );
        await enableButton.click();
        
        const input = await waiter.waitForElementVisible(
            By.css('#input-example input')
        );
        
        await driver.wait(async () => await input.isEnabled(), 10000);
        
        console.log('Input became enabled after interaction');

        console.log('\n All hidden element tests passes!!!')
        
    }catch(error){
        console.error('Test execution failed:', error);

        if(driver){
            const screenshot = await driver.takeScreenshot();
            require('fs').writeFileSync('hidden-elements-error.png', screenshot, 'base64');
            console.log('Screenshot saved as hidden-elements-error.png')
        }
    }finally{
        if(driver){
            await driver.quit();
        }
    }
}

testHiddenElement();