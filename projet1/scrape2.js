import {Builder, By, until, WebDriver} from 'selenium-webdriver';

(async function scrapeGoogle(){
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();

    try{
        await driver.get("https://www.google.com");

        const searchBox = await driver.findElement(By.name("q"));
        await searchBox.sendKeys("OpenAI ChatGPT",);

        await searchBox.submit();

        await driver.wait(until.elementsLocated(By.css("h3")), 5000);

        const results = await driver.findElements(By.css("h3"));

        for(let result of results){
            console.log(await result.getText());
        }
        console.log("Total : ", results.length);
        console.log("Scraping terminé ! ");
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
})()