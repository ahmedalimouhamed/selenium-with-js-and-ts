const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function basicNavigation(){
    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(new chrome.Options())
        .build();

    await driver.manage().window().maximize();

    try{
        await driver.get('https://www.google.com');
        console.log("Page google chargée");

        let title = await driver.getTitle();
        console.log('Titre de la page : ', title);

        await driver.sleep(2000);

        await driver.get('https://github.com');
        console.log("Page Github chargé");

        await driver.navigate().back();
        console.log("Retour à google");
        await driver.sleep(1000);

        await driver.navigate().forward();
        console.log('Retour à github');
    }finally{
        if(driver){
            await driver.quit();
        }
    }
})().catch(console.error);
