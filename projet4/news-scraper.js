const {By, until, Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function getRandomUserAgent(){
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function scrapeNews(){
    const options = new chrome.Options();
    options.addArguments([
        'disable-blink-features=AutomationControlled',
        `--user-agent=${getRandomUserAgent()}`,
        '--window-size=1366,768',
        'disable-web-security'
    ]);

    options.excludeSwitches(['enable-automation']);

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try{
        await driver.executeScript(`
            delete window.cdc_adoQpoasnfa76pfcZmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZmcfl_Symbol;
        `);

        await driver.get('https://news.ycombinator.com/');
        console.log('Hacker News chargé');

        await driver.wait(until.elementLocated(By.css('.athing')), 10000);

        const articles = await driver.findElements(By.css('.athing'));
        const newsData = [];

        for(let i = 0; i < Math.min(articles.length, 10); i++){
            try{
                const article = articles[i];
                const titleElem = await article.findElement(By.css('.titleline a'));
                const title = await titleElem.getText();
                const url = await titleElem.getAttribute('href');
                const nextRow = await article.findElement(By.xpath('./following-sibling::tr'));
                const score = await nextRow.findElement(By.css('.score')).getText().catch(() => '0 points');
                const user = await nextRow.findElement(By.css('.hnuser')).getText().catch(() => 'Anomymous');

                newsData.push({
                    rank: i + 1,
                    title: title.trim(),
                    url: url,
                    score: score.trim(),
                    user: user.trim(),
                    scrapedAt: new Date().toISOString()
                });

                await randomDelay(800, 2000);

            }catch(e){
                console.log('Erreur sur un article : ', e.message);
                throw e;
            }

        }

        console.log('Articles scrapés : ', newsData.length);
        require('fs').writeFileSync('hacker-news.json', JSON.stringify(newsData, null, 2));
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
}

async function randomDelay(min, max){
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
}

scrapeNews().catch(console.error);