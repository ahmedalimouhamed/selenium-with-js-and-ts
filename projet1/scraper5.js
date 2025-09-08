const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const os = require('os');

// Generate a unique directory name for user data
const userDataDir = path.join(os.tmpdir(), `chrome-data-${Date.now()}`);

(async function scrapeEbay(){
    // Set Chrome options with a unique user data directory
    let options = new chrome.Options();
    options.addArguments(`--user-data-dir=${userDataDir}`);
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    await driver.manage().window().maximize();

    try{
        await driver.get("https://www.ebay.com/sch/i.html?_nkw=smartphone");

        for(let page = 1; page <= 3; page++){
            // Wait for items to load
            await driver.wait(until.elementLocated(By.css("div.su-card-container")), 10000);

            // Get all item containers
            let items = await driver.findElements(By.css("div.su-card-container"));
            console.log(`Page ${page}`);

            for(let item of items.slice(0, 5)){
                try{
                    // Get title and price using the correct selectors
                    const title = await item.findElement(By.css("span.su-styled-text.primary.default")).getText();
                    const price = await item.findElement(By.css("span.su-styled-text.primary.bold.large-1")).getText();
                    console.log(`- ${title} - (${price})\n`);
                }catch(e){
                    console.log("Error getting item details:", e.message);
                }
            }

            try{
                const nextButton = await driver.findElement(By.css(".pagination__next"));
                await nextButton.click();
            }catch(e){
                console.log("Fin de la pagination");
                console.log(e);
                throw e;
            }
        }
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
})()