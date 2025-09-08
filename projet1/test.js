const {Builder, By, Key, until} = require('selenium-webdriver');

(async function example(){
    let driver = await new Builder().forBrowser("chrome").build();
    driver.manage().window().maximize();

    try{
        await driver.get("https://www.google.com");

        let searchBox = await driver.findElement(By.name("q"));
        await searchBox.sendKeys("Selenium with typescript", Key.RETURN);

        await driver.wait(until.titleContains("Selenium"), 5000);

        console.log("Test réussi ! ")
    }catch(e){
        console.log(e);
    }finally{
        await driver.quit();
    }
})();