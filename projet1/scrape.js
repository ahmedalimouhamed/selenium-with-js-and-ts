const {Builder, By} = require('selenium-webdriver');

(async function scrapeHackerNews(){
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();

    try{
        await driver.get("https://news.ycombinator.com");

        let elements = await driver.findElements(By.css('.titleline a'));

        for(let elem of elements){
            let title = await elem.getText();
            let url = await elem.getAttribute('href');
            console.log(` - ${title} - (${url})\n`);
        }
        console.log("Total : ", elements.length);
        console.log("Scraping terminé ! ")
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
    
})()