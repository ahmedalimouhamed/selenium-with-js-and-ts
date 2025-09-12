const {Builder, By, until, Key} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

function createAmazonDriver(){
    const options = new chrome.Options();

    options.addArguments([
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--np-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1366,768',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--disable-images'
    ]);

    options.excludeSwitches(['enable-automation', 'enable-logging']);

    options.setUserPreferences({
        'profile.managed_default_content_settings.images' : 2
    });

    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

}

async function hideAutomation(driver){
    await driver.executeScript(`
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });

        Object.defineProperty(navigator, 'language', {
            get: () => 'fr-FR'
        });

        Object.defineProperty(navigator, 'options', {
            get: () => [1,2,3,4,5]
        });

        window.chrome = {
            runtime: {},
            app: {
                isInstalled: false
            }
        }
    `)
}

async function randomDelay(min = 1000, max = 3000){
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Pause de ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
}

async function simulateHumanBehavior(driver){
    const actions = driver.actions();

    await actions.move({
        x: Math.random() * 200,
        y: Math.random() * 200
    }).perform();

    const scrollAmount = Math.floor(Math.random() * 500) + 200;
    await driver.executeScript(`window.scrollBy(0, ${scrollAmount})`);
    await randomDelay(500, 1500);
}

async function scrapeAmazonProducts(searchQuery = 'iphone'){
    const driver = await createAmazonDriver();

    try{
        await hideAutomation(driver);
        console.log('Lancement du scraping Amazon...');

        await driver.get('https://www.amazon.fr');
        console.log('amazon.fr chargé');
        await randomDelay(2000, 4000);

        try{
            const acceptCookies = await driver.wait(
                until.elementLocated(By.id('sp-cc-accept')),
                5000
            );

            await acceptCookies.click();
            console.log('Cookies acceptés');
            await randomDelay(1000, 2000);
        }catch(e){
            console.log('Pas de popup cookies');
        }

        const searchBox = await driver.findElement(By.id('twotabsearchtextbox'));
        await searchBox.clear();

        const query = searchQuery;
        for(const char of query){
            await searchBox.sendKeys(char);
            await randomDelay(50, 150);
        }

        await randomDelay(500, 1000);
        
        // Essayer de cliquer sur le bouton de recherche
        try {
            const searchButton = await driver.findElement(By.css('input[type="submit"], #nav-search-submit-button'));
            await searchButton.click();
            console.log('Bouton de recherche cliqué');
        } catch (e) {
            // Si le bouton n'est pas trouvé, utiliser la touche Entrée
            console.log('Bouton non trouvé, utilisation de la touche Entrée');
            await searchBox.sendKeys(Key.RETURN);
        }

        console.log(`Recherche : "${searchQuery}"`);

        // Attendre que l'URL change pour confirmer la soumission de la recherche
        await driver.wait(async () => {
            const currentUrl = await driver.getCurrentUrl();
            return currentUrl.includes('/s?k=') || currentUrl.includes('/s/');
        }, 10000, 'La page de résultats de recherche ne s\'est pas chargée');

        try {
            // Attendre que les résultats soient chargés
            await driver.wait(until.elementLocated(By.css('.s-main-slot.s-result-list')), 20000);
            
            // Attendre que des éléments de résultats soient visibles
            await driver.wait(until.elementsLocated(By.css('.s-result-item[data-component-type="s-search-result"]')), 20000);
            
            // Faire défiler pour charger plus de contenu
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight / 3)');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight / 1.5)');
            
        } catch (error) {
            console.error('Erreur lors du chargement des résultats:', error.message);
            // Prendre une capture d'écran pour le débogage
            const screenshot = await driver.takeScreenshot();
            const filename = `error-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
            require('fs').writeFileSync(filename, screenshot, 'base64');
            console.log(`Capture d'écran enregistrée sous ${filename}`);
            throw error;
        }

        const productElements = await driver.findElements(By.css('.s-result-item[data-component-type="s-search-result"]'));
        console.log(`${productElements.length} produits trouvés`);
        const products = [];

        for(let i = 0; i < Math.min(productElements.length, 5); i++){
            try{
                await simulateHumanBehavior(driver);

                const product = await extractProductData(productElements[i]);
                if(product){
                    products.push(product);
                    console.log(`Produit ${i + 1} : ${product.title.substring(0, 50)}...`);
                }

                await randomDelay(1500, 2500)
            }catch(e){
                console.log(`Erreur produit ${i + 1}: ${e.message}`);
            }
        }

        const filename = `amazon-${searchQuery}-${Date.now()}.json`;
        require('fs').writeFileSync(filename, JSON.stringify(products, null, 2));
        return products;
    }catch(e){
        console.log(e);
        await driver.takeScreenshot().then(image => {
            require('fs').writeFileSync('amazon-error.png', image, 'base64');
            console.log('capture d\'écran sauvgardée');
        })
    }finally{
        if(driver){
            await driver.quit();
            console.log('navigateur fermé');
        }
    }
}

async function extractProductData(productElement){
    try{
        const titleElement = await productElement.findElement(By.css('h2 a, h2 span, a h2, a.a-link-normal.s-line-clamp-4'));
        const title = await titleElement.getAttribute('title') || await titleElement.getText();
        const link = await titleElement.getAttribute('href');
        let price = 'Non disponible';
        try{
            const priceWhole = await productElement.findElement(By.css('.a-price-whole')).getText().catch(() => '');
            const priceFraction = await productElement.findElement(By.css('.a-price-fraction')).getText().catch(() => '');
            price = priceWhole && priceFraction ? `${priceWhole}${priceFraction}€` : 'Non disponible';
        }catch{
            try{
                price = await productElement.findElement(By.css('.a-price')).getText();
            }catch{
                price = 'Non disponible';
            }
        }

        let rating = 'Non noté';
        let reviewCount = '0';

        try{
            rating = await productElement.findElement(By.css('.a-icon-star-mini .a-icon-alt')).getAttribute('innerText');
            reviewCount = await productElement.findElement(By.css('.a-size-base')).getText();
        }catch(error){
            console.log('Erreur extraction rating produit : ', error.message);
        }

        let imageUrl = '';

        try{
            const imgElement = await productElement.findElement(By.css('img.s-image'));
            imageUrl = await imgElement.getAttribute('src');
        }catch(error){
            console.log('Erreur extraction image produit : ', error.message);
        }

        return {
            title: title.trim(),
            price: price.trim(),
            rating: rating.replace('sur 5 étoiles', '').trim(),
            reviews: reviewCount.trim(),
            link: link.startsWith('http') ? link : `https://amazon.fr${link}`,
            image: imageUrl,
            scrapedAt: new Date().toISOString()
        }
    }catch(e){
        console.log('Erreur extraction produit : ', e.message);
        return null;
    }
}

async function scrapeProductDetails(productUrl){
    const driver = await createAmazonDriver();

    try{
        await hideAutomation(driver);
        console.log('scraping des détails produit...');
        await driver.get(productUrl);
        await randomDelay(3000, 5000);

        try{
            const acceptCookies = await driver.wait(
                until.elementLocated(By.id('sp-cc-accept')),
                3000
            );

            await acceptCookies.click();
            console.log('Cookies acceptés');
            await randomDelay(1000, 2000);
        }catch(e){
            console.log('Pas de popup cookies');
        }

        const details = {}

        try{
            details.title = await driver.findElement(By.id('productTitle')).getText();
        }catch(e){
            console.log('Erreur extraction titre produit : ', e.message);
        }

        try{
            details.price = await driver.findElement(By.css('.a-price-whole')).getText();
        }catch(e){
            console.log('Erreur extraction prix produit : ', e.message);
        }

        try{
            details.description = await driver.findElement(By.id('productDescription')).getAttribute('innerText');
        }catch(e){
            console.log('Erreur extraction description produit : ', e.message);
        }

        try{
            const featureElements = await driver.findElements(By.css('#feature-bullets li'));
            details.features = [];

            for(const element of featureElements){
                details.features.push(await element.getText());
            }
            
        }catch(e){
            console.log('Erreur extraction image produit : ', e.message);
        }

        console.log(`Détails produit scrapés`);
        return details;
    }catch(e){
        console.log('Erreur scraping produit : ', e.message);
        return null;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
}

async function main(){
    try{
        console.log('Début du scraping Amazon');

        const products = await scrapeAmazonProducts('iphone 13');
        console.log(`\n ${products.length} produits scrapés avec succès!`);

        if(products.length > 0){
            console.log('\nScraping des détails du premier produit...');
            const productDetails = await scrapeProductDetails(products[0].link);
            console.log('\nDétails produit : ', productDetails);
        }
    }catch(e){
        console.log('Erreur scraping : ', e.message);
    }
}

if(require.main === module){
    main().catch(console.error);
}

module.exports = {
    scrapeAmazonProducts,
    scrapeProductDetails
}