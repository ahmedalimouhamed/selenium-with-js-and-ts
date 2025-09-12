const {By, until} = require('selenium-webdriver');
const {createStealthDriver, hideWebDriver} = require('./stealth-config');

async function scrapeEcommerce(){
    const driver = await createStealthDriver();

    try{
        await hideWebDriver(driver);
        await simulateHumanBehavior(driver);
        await driver.get('https://webscraper.io/test-sites/e-commerce/allinone');
        console.log('Page chargée');

        await driver.wait(until.elementLocated(By.css('.thumbnail')), 10000);

        const products = await driver.findElements(By.css('.thumbnail'));
        console.log(`Nombre de produits trouvés : ${products.length}`);

        const productData = [];

        for(const product of products.slice(0, 5)){
            try{
                const data = await extractProductData(product);
                productData.push(data);
                await randomDelay(1000, 3000);
            }catch(e){
                console.log(e);
                throw e;
            }
        }

        console.log('Données scrapées : ', productData);
        require('fs').writeFileSync('products.json', JSON.stringify(productData, null, 2));
        console.log('Données sauvgargées dans products.json !');
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
}

async function extractProductData(productElement){
    const title = await productElement.findElement(By.css('.title')).getText();
    const price = await productElement.findElement(By.css('.price')).getText();
    const description = await productElement.findElement(By.css('.description')).getText();
    const rating = await productElement.findElement(By.css('.ratings')).getText();

    return {
        title: title.trim(),
        price: price.trim(),
        description: description.trim(),
        rating: rating.trim(),
        scrapedAt: new Date().toISOString()
    }
}

async function simulateHumanBehavior(driver){
    const actions = driver.actions();
    await actions.move({x: Math.random() * 100, y: Math.random() * 100}).perform();
    await driver.executeScript('window.scrollBy(0, 200)');
    await randomDelay(500, 1500);
    await driver.executeScript('window.scrollBy(0, -100)');
    await randomDelay(500, 1500);
}

async function randomDelay(min, max){
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
}

scrapeEcommerce().catch(console.error);