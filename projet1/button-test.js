const {Builder, By, until} = require('selenium-webdriver');

(async function testButton(){
    let driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();

    try{
        await driver.get('https://the-internet.herokuapp.com/javascript_alerts');
        
        console.log("Test 1 : Alert Simple");
        const alertButton = await driver.findElement(By.xpath("//button[text()='Click for JS Alert']"));
        await alertButton.click();

        let alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        console.log('Texte de l\'alerte : ', alertText);
        await alert.accept();

        const result = await driver.findElement(By.id('result')).getText();
        console.log('Résultat : ', result);

        await driver.sleep(1000);

        console.log('Test 2 : Alert de confirmation');
        const confirmButton = await driver.findElement(By.xpath('//button[text()="Click for JS Prompt"]'));
        await confirmButton.click();

        alert = await driver.switchTo().alert();
        await alert.dismiss();

        const result2 = await driver.findElement(By.id('result')).getText();
        console.log('Résultat après annulation : ', result2);
        await driver.sleep(1000);

        console.log('Test 3 : Alert avec prompt');
        const promptButton = await driver.findElement(By.xpath('//button[text()="Click for JS Prompt"]'));
        await promptButton.click();

        alert = await driver.switchTo().alert();
        await alert.sendKeys('Hello selenium');
        await alert.accept();

        const result3 = await driver.findElement(By.id('result')).getText();
        console.log('Résultat après prompt : ', result3);
        await driver.sleep(1000);
        
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
})()