const {Builder, By, until} = require("selenium-webdriver");

(async function testLogin(){

    let driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();

    try{
        await driver.get('https://the-internet.herokuapp.com/login');
        
        const username = await driver.findElement(By.id('username'));
        const password = await driver.findElement(By.id('password'));
        const loginButton = await driver.findElement(By.css('button[type="submit"]'));

        await username.sendKeys('tomsmith');
        await password.sendKeys('SuperSecretPassword!');
        await loginButton.click();

        console.log('Formulaire soumis');
        
        await driver.wait(until.elementLocated(By.css('.flash.success')), 5000);
        const successMessage = await driver.findElement(By.css('.flash.success')).getText();
        console.log('Message de succès : ', successMessage.substring(0, 50) + '...');
        const logoutButton = await driver.findElement(By.css('a.button.secondary'));
        await logoutButton.click();
        console.log('Déconnexion effectuée');
        await driver.sleep(2000);
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }

})()