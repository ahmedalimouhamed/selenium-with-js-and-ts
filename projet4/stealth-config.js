const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');

function createStealthDriver(){
    const options = new chrome.Options();

    options.addArguments([
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-default-apps',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]);

    options.setLoggingPrefs({browser: 'OFF', driver: 'OFF'});

    options.excludeSwitches(['enable-automation', 'enable-logging']);

    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
}

async function hideWebDriver(driver){
    await driver.executeScript(`
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });

        window.chrome = {
            runtime: {}
        };

        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?  
                Promise.resolve({state: Notification.permission}) : 
                originalQuery(parameters)
        )
    `)
}

module.exports = {
    createStealthDriver,
    hideWebDriver
}