const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runEcommerceTest(){
    console.log("Starting e-commerce Test...");

    let driver;

    try{
        let options = new chrome.Options();
        options.addArguments("--no-sandbox");
        options.addArguments('--disable-dev-shm-usage');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        
        await driver.manage().window().maximize();
        console.log('Testing login...');
        await driver.get('https://www.saucedemo.com');

        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');
        await driver.findElement(By.id('login-button')).click();

        await driver.wait(until.elementLocated(By.css('.inventory_list')), 5000);
        console.log('Login successful');

        console.log("2. checking products...");
        const products = await driver.findElements(By.css('.inventory_item'));
        console.log(`found ${products.length} products`);

        console.log('3. adding product to cart...');
        // wait for the add-to-cart button to exist and be clickable
        const firstAddBtn = await driver.wait(
            until.elementLocated(By.css('.btn_inventory')),
            10000
        );
        await driver.wait(until.elementIsVisible(firstAddBtn), 5000);
        await firstAddBtn.click();

        const cartBadge = await driver.wait(
            until.elementLocated(By.css('.shopping_cart_badge')),
            10000
        );
        const cartCount = await cartBadge.getText();
        console.log(`Cart updated: ${cartCount} items`);

        console.log('4. Going to cart...');
        const cartsLink = await driver.wait(
            until.elementLocated(By.css('.shopping_cart_link')),
            10000
        );
        
        await cartsLink.click();
        const cartList = await driver.wait(
            until.elementLocated(By.css('.cart_list')),
            10000
        );
        console.log('cart page loaded');

        console.log('5. Testing checkout...');
        const checkoutButton = await driver.wait(
            until.elementLocated(By.id('checkout')),
            10000
        );
        await checkoutButton.click();

        const firstName = await driver.wait(
            until.elementLocated(By.id('first-name')),
            10000
        );
        await firstName.sendKeys('John');
        await driver.findElement(By.id('last-name')).sendKeys('Doe');
        await driver.findElement(By.id('postal-code')).sendKeys('12345');
        await driver.findElement(By.id('continue')).click();

        await driver.wait(until.elementLocated(By.css('.summary_info')), 10000);
        await driver.findElement(By.id('finish')).click();

        const confirmation = await driver.wait(until.elementLocated(By.css('.complete-header')), 10000);
        const message = await confirmation.getText();
        console.log(`Order completed: ${message}`);

        console.log('\nAll Tests Passed!!!');
    }catch(error){
        console.error("Test execution failed:", error);
        if(driver){
            const screenshot = await driver.takeScreenshot();
            require('fs').writeFileSync('error.png', screenshot, 'base64');
            console.log('Screenshot saved as error.png')
        }
    }finally{
        if(driver){
            await driver.quit();
        }
    }
}

runEcommerceTest();
