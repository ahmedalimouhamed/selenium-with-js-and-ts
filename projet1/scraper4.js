const {Builder, By} = require('selenium-webdriver');

(async function infiniteScroll(){
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();

    try{
        await driver.get("https://unsplash.com/s/photos/nature");

        for(let i = 0; i < 5; i++){
            await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
            await driver.sleep(2000);
        }

        let images = await driver.findElements(By.css("figure img"));

        for(let img of images.slice(0, 10)){
            let src = await img.getAttribute("src");
            console.log(src);
        }
        console.log("Total : ", images.length);
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
        console.log("Scraping terminé ! ");
    }
})()
