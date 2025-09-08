const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuration des options Chrome
let options = new chrome.Options();
options.addArguments(
    '--disable-blink-features=AutomationControlled',
    '--start-maximized',
    '--disable-infobars',
    '--disable-extensions',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-web-security',
    '--ignore-certificate-errors',
    '--ignore-ssl-errors',
    '--disable-notifications',
    '--disable-popup-blocking',
    '--disable-default-apps',
    '--disable-translate',
    '--disable-web-resource',
    '--disable-save-password-bubble',
    '--disable-single-click-autofill',
    '--disable-background-networking',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--safebrowsing-disable-auto-update',
    '--disable-bundled-ppapi-flash',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-sync',
    '--disable-webgl',
    '--disable-threaded-animation',
    '--disable-threaded-scrolling',
    '--disable-in-process-stack-traces',
    '--disable-logging',
    '--output=/dev/null',
    '--log-level=3',
    '--disable-remote-fonts',
    '--disable-features=IsolateOrigins,site-per-process',
    'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);

(async function scrapeAmazon() {
    // Désactiver le mode headless
    options.setPageLoadStrategy('eager');  // Ne pas attendre le chargement complet de la page
    
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Configurer les timeouts
        await driver.manage().setTimeouts({
            implicit: 15000,  // 15 secondes pour localiser les éléments
            pageLoad: 60000,  // 60 secondes pour charger la page
            script: 30000     // 30 secondes pour exécuter les scripts
        });

        // Aller sur la page d'accueil d'Amazon
        await driver.get('https://www.amazon.com/');
        console.log('Page d\'accueil chargée');
        
        // Attendre que la page soit interactive
        await driver.wait(until.elementLocated(By.tagName('body')), 10000);
        console.log('Page interactive détectée');
        
        // Vérifier si on est sur une page de vérification
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('robot')) {
            console.log('Détection de robot détectée. Essayez de résoudre le CAPTCHA manuellement.');
            await new Promise(resolve => setTimeout(resolve, 60000)); // Attendre 1 minute
        }

        // Essayer de trouver la barre de recherche avec plusieurs sélecteurs
        let searchBox;
        const selectors = [
            '#twotabsearchtextbox',
            '#nav-bb-search',
            'input[type=text][name=field-keywords]',
            'input[type=text]'
        ];

        for (const selector of selectors) {
            try {
                searchBox = await driver.wait(until.elementLocated(By.css(selector)), 10000);
                if (searchBox) {
                    console.log('Barre de recherche trouvée avec le sélecteur:', selector);
                    break;
                }
            } catch (e) {
                console.log('Sélecteur non trouvé:', selector);
            }
        }

        if (!searchBox) {
            // Prendre une capture d'écran pour le débogage
            const screenshot = await driver.takeScreenshot();
            const fs = require('fs');
            fs.writeFileSync('debug.png', screenshot, 'base64');
            throw new Error('Impossible de trouver la barre de recherche');
        }

        // Remplir le formulaire de recherche
        await searchBox.clear();
        await searchBox.sendKeys('laptop');
        await searchBox.submit();
        console.log('Recherche effectuée');

        // Attendre les résultats
        try {
            await driver.wait(until.elementLocated(By.css('div[data-component-type="s-search-result"]')), 15000);
            console.log('Résultats chargés');
            
            // Récupérer les résultats
            const items = await driver.findElements(By.css('div[data-component-type="s-search-result"]'));
            console.log(`Nombre de résultats trouvés: ${items.length}`);
            
            for (let i = 0; i < Math.min(5, items.length); i++) {
                //console.log("Article : ", i + 1, items[i]);
                try {
                    const item = items[i];
                    
                    // Récupérer le titre
                    let title = 'Titre non disponible';
                    try {
                        const titleElement = await item.findElement(By.css('h2.a-size-medium span'));
                        title = await titleElement.getText();
                    } catch (e) {
                        console.log('Titre non trouvé pour un article');
                    }

                    // Récupérer le prix
                    let price = 'Prix non disponible';
                    try {
                        // Essayer d'abord avec le sélecteur du prix principal
                        try {
                            const priceElement = await item.findElement(By.css('.a-price .a-offscreen'));
                            price = await priceElement.getAttribute('textContent');
                        } catch (e) {
                            // Si le premier sélecteur échoue, essayer avec la structure alternative
                            const priceWhole = await item.findElement(By.css('.a-price-symbol')).getText() + 
                                                    await item.findElement(By.css('.a-price-whole')).getText() +
                                                    await item.findElement(By.css('.a-price-fraction')).getText();
                            price = priceWhole;
                        }
                    } catch (e) {
                        console.log('Aucun format de prix trouvé');
                    }

                    // Afficher les informations
                    console.log(`Article ${i + 1}:`);
                    console.log(`  Titre: ${title}`);
                    console.log(`  Prix: ${price}\n`);
                
                } catch (e) {
                    console.log('Erreur lors de la récupération des informations d\'un article:', e.message);
                }
            }
        } catch (e) {
            console.error('Erreur lors de la récupération des résultats:', e.message);
            // Prendre une capture d'écran en cas d'erreur
            const screenshot = await driver.takeScreenshot();
            const fs = require('fs');
            fs.writeFileSync('error_results.png', screenshot, 'base64');
        }

    } catch (e) {
        console.error('Erreur critique:', e.message);
        // Prendre une capture d'écran en cas d'erreur critique
        try {
            const screenshot = await driver.takeScreenshot();
            const fs = require('fs');
            fs.writeFileSync('error_critical.png', screenshot, 'base64');
        } catch (screenshotError) {
            console.error('Impossible de prendre une capture d\'écran:', screenshotError.message);
        }
    } finally {
        if (driver) {
            try {
                await driver.quit();
                console.log('Navigateur fermé');
            } catch (e) {
                console.error('Erreur lors de la fermeture du navigateur:', e.message);
            }
        }
        console.log('Scraping terminé !');
    }
})();