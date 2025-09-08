const {Builder, By, until, WebDriver} = require('selenium-webdriver');

(async function loginDemo(){
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();

    try{
        await driver.get("https://the-internet.herokuapp.com/login");

        await driver.findElement(By.id("username")).sendKeys("tomsmith");
        await driver.findElement(By.id("password")).sendKeys("SuperSecretPassword!");
        await driver.findElement(By.css("button[type='submit']")).click();

        await driver.wait(until.elementLocated(By.css(".flash.success")), 5000);

        console.log(await driver.findElement(By.css(".flash.success")).getText());
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
})()