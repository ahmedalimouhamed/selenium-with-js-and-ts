const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');


(async function googleSearch(){
    let options = new chrome.Options();
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--disable-infobars');
    options.addArguments('--start-maximized');
    options.setUserPreferences({
        'credentials_enable_service': false,
        'profile.password_manager_enabled': false
    });

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
    await driver.manage().window().maximize();

    try{
        await driver.get('https://www.google.com')
        console.log('Page google chargée');

        try{
            const acceptButton = await driver.wait(
                until.elementLocated(By.xpath('//button[contains(., "Tout accepter") or contains(., "Accept all")]')),
                3000
            );

            await acceptButton.click();
            console.log("Cookies acceptés ! ")
        }catch(e){
            console.log("Pas de popup cookies")
        }

        const searchBox = await driver.findElement(By.name("q"));

        await searchBox.sendKeys('selenium Javascript', Key.RETURN);
        console.log('Recherche effectuée');

        await driver.wait(until.elementLocated(By.id('search')), 5000);

        const title = await driver.getTitle();
        console.log('Titre après recherche : ', title);

        await driver.takeScreenshot().then(image => {
            require('fs').writeFileSync('search-results.png', image, 'base64');
            console.log('Capture d\'écran sauvegardée !')
        })

        await driver.sleep(2000);
    }catch(e){
        console.log(e)
        throw e
    }finally{
        if(driver){
            await driver.quit()
        }
    }
})()