const {Builder, Browser} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class DriverManager{
    static driver = null;

    static async createDriver(browser = 'chrome'){
        let driver;

        switch(browser.toLowerCase()){
            case 'chrome':
                const chromeOptions = new chrome.Options();
                chromeOptions.addArguments('--headless=new');
                chromeOptions.addArguments('--no-sandbox');
                chromeOptions.addArguments('--disable-dev-shm-usage');
                driver = await new Builder()
                    .forBrowser(Browser.CHROME)
                    .setChromeOptions(chromeOptions)
                    .build();
                break;

            case 'firefox': 
                driver = await new Builder()
                    .forBrowser(Browser.FIREFOX)
                    .build();
                break;

            default:
                throw new Error(`Unsupported browser: ${browser}`);
        }

        DriverManager.driver = driver;
        await driver.manage().window().maximize();
        await driver.manage().setTimeouts({implicit: 10000});

        return driver;
    }

    static getDriver(){
        if(!DriverManager.driver){
            throw new Error('Driver not initialized. Call createDriver first.');
        }

        return DriverManager.driver;
    }

    static async quitDriver(){
        if(DriverManager.driver){
            await DriverManager.driver.quit();
            DriverManager.driver = null;
        }
    }
}

module.exports = DriverManager;
