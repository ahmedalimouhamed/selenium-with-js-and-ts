const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testProgressiveUi(){
    console.log('Testing progressive ui loading...\n');

    let driver;

    try{
        const options = new chrome.Options();
        options.addArguments('--no-sandbox');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        const waitForElement = async (selector, timeout=15000) => {
            console.log(`Waiting for : ${selector}`);

            const element = await driver.wait(
                until.elementLocated(selector),
                timeout
            );

            await driver.wait(
                until.elementIsVisible(element),
                timeout
            );

            await driver.sleep(500);

            console.log(`element ready : ${selector}`);
            return element;
        };

        console.log('1. Testing progressive loading...');
        await driver.get('https://the-internet.herokuapp.com/dynamic_loading/2');

        const startButton = await waitForElement(By.css('#start button'));
        await startButton.click();

        await waitForElement(By.id('loading'));
        console.log('loader appeared');

        await driver.wait(async() => {
            try{
                const loading = await driver.findElement(By.id('loading'));
                return !(await loading.isDisplayed());
            }catch{
                return true;
            }
        }, 15000);

        const finishText = await waitForElement(By.id('finish'));
        const text = await finishText.getText();
        console.log(`Final text : "${text}"`);

        console.log('\n2. Testing scroll-triggred elements...');
        await driver.get('https://the-internet.herokuapp.com/large');

        const table = await waitForElement(By.id('large-table'));

        await driver.executeScript(`
            window.scrollTo(0, document.body.scrollHeight);
        `);

        await driver.sleep(2000);

        const lastCell = await waitForElement(By.css('#large-table td:last-child'));
        const cellText = await lastCell.getText();
        console.log(`Scrolled to bottom cell : "${cellText}"`);

        console.log('\n3. Testing tab content...');
        await driver.get('http://the-internet.herokuapp.com/windows');
        
        const clickHereLink = await waitForElement(By.css('.example a'));
        await clickHereLink.click();

        await driver.sleep(1000);

        const windows = await driver.getAllWindowHandles();
        await driver.switchTo().window(windows[1]);

        const newWindowContent = await waitForElement(By.css('h3'));
        const newText = await newWindowContent.getText();
        console.log(`New Window content : "${newText}"`);

        await driver.close();
        await driver.switchTo().window(windows[0]);

        console.log('\n4. Testing AJAX content...');
        await driver.get('https://the-internet.herokuapp.com/dynamic_content');

        const content = await waitForElement(By.css('#content .row'));
        const images = await driver.findElements(By.css('.row img'));
        console.log(`AjJAX content loaded with ${images.length} images`);

        console.log('\n5. Testing reel-time validation...');
        await driver.get('https://the-internet.herokuapp.com/inputs');

        const numberInput = await waitForElement(By.css('input[type="number"]'));
        await numberInput.sendKeys('123');

        await driver.wait(async() => {
            const value = await numberInput.getAttribute('value');
            return value === '123';
        }, 5000);

        console.log('input validation working');
        console.log('\n. Progressive UI test completes successfully!!!');

    }catch(error){
        console.error('Test execution failed:', error);

        if(driver){
            const screenshot = await driver.takeScreenshot();
            require('fs').writeFileSync('progressive-ui-error.png', screenshot, 'base64');
            console.log('Screenshot saved as progressive-ui-error.png');
        }
    }finally{
        if(driver){
            await driver.quit();
        }
    }
}

testProgressiveUi();