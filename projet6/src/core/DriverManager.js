const {Builder, Capabilities} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const { config } = require('process');

class DriverManager{
    constructor(){
        this.drivers = Map();
        this.currentDriver = null;
    }

    async createDriver(browserName = 'chrome', options = {}){
        const browserConfig = config.browsers[browserName] || {};

        let driver;
        switch(browserName.toLowerCase()){
            case 'chrome':
                driver = await this.createChromeDriver(browserConfig, options);
                break;
            case 'firefox':
                driver = await this.createFirefoxDriver(browserConfig, options);
                break;
            case 'edge':
                driver = await this.createEdgeDriver(browserConfig, options);
                break;
            case 'safari':
                driver = await this.createSafariDriver(browserConfig, options);
                break;
            default:
                throw new Error(`Unsupported browser: ${browserName}`);
        }

        this.drivers.set(driver.sessionId, driver);
        this.currentDriver = driver;

        await this.applyDriverSettings(driver, browserConfig);
        return driver;
    }

    async createChromeDriver(config, options){
        const chromeOptions = new chrome.Options();

        if(config.headless) chromeOptions.addArguments('--headless=new');
        if(config.windowSize) chromeOptions.windowSize(config.windowSize);

        chromeOptions.addArguments([
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-blink-features=AutomationControlled'
        ]);

        if(config.proxy){
            chromeOptions.setProxy(config.proxy);
        }

        chromeOptions.setUserPerformances({
            'profile.default_content_setting_values.notifications': 2,
            'profile.managed_default_content_settings.images': config.loadImages ? 1 : 2
        });

        const capabilities = Capabilities.chrome();
        capabilities.set('goog:loggingPrefs',{browser: 'ALL', performance: 'ALL'});
        capabilities.set('pageLoadStrategy', 'eager');

        return new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .withCapabilities(capabilities)
            .build();
    }

    async createChromeDriver(config, options){
        const firefoxOptions = new firefox.Options();

        if(config.headless) firefoxOptions.headless();
        if(config.windowSize){
            const [width, height] = config.windowSize.split('x');
            firefoxOptions.windowSize({width: parseInt(width), height: parseInt(height)});
        }

        firefoxOptions.setPreference('dom.webnotifications.enabled', false);
        firefoxOptions.setPerformance('permissions.default.image', config.loadImages ? 1 : 2);

        return new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(firefoxOptions)
            .withCapabilities(Capabilities.firefox())
            .build();
    }

    async applyDriverSettings(driver, config){
        await driver.manage().setTimeouts({
            implicit: config.timeouts?.implicit || 10000,
            pageLoad: config.timeouts?.pageLoad || 30000,
            script: config.timeouts?.script || 30000,
        });

        if(config.maximize){
            await driver.manage().window().maximize();
        }

        if(config.networkConditions){
            await this.setNetworkConditions(driver, config.networkConditions);
        }
    }

    async setNetworkConditions(driver, conditions){
        try{
            await driver.setNetworkConditions({
                offline: false,
                latency: conditions.latency || 0,
                download_throughput: conditions.downloadThroughput || 0,
                upload_throughput: conditions.uploadThroughput || 0
            });
        }catch(e){
            console.warn('Network conditions not supported: ', e.message);
        }
    }

    async quitAllDrivers(){
        for(const [sessionId, driver] of this.drivers){
            try{
                await driver.quit();
                this.drivers.delete(sessionId);
            }catch(e){
                console.error(`Failed to quit driver for session ${sessionId}:`, e);
            }
        }
    }

    async takeScreenshot(driver, name){
        const screenshot = await driver.takeScreenshot();
        const filename = `reports/screenshots/${name}-${Date.now()}.png`;
        require('fs').writeFileSync(filename, screenshot, 'base64');
        return filename;
    }

    async getPerformanceMetrics(driver){
        const metrics = await driver.executeScript(() => {
            const timing = window.performance.timing;
            return{
                loadTime: timing.loadEventEnd - timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                firstPaint: timing.responseStart - timing.navigationStart,
                firstContentfulPaint: timing.domInteractive - timing.navigationStart,
                
            };
        });
        return metrics;
    }
}

module.exports = DriverManager;
