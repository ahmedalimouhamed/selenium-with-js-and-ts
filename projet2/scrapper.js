import { Builder, By, until, WebDriver } from "selenium-webdriver";
import fs from "fs";
(async function scrapeQuotes() {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
    let allQuotes = [];
    try {
        await driver.get("https://quotes.toscrape.com/");
        let page = 1;
        while (true) {
            console.log(`scraping page ${page}...`);
            await driver.wait(until.elementLocated(By.css(".quote")), 5000);
            const quotes = await driver.findElements(By.css(".quote"));
            for (let q of quotes) {
                const text = await q.findElement(By.css(".text")).getText();
                const author = await q.findElement(By.css(".author")).getText();
                allQuotes.push({ text, author });
            }
            let nextButtons = await driver.findElements(By.css(".next a"));
            if (nextButtons.length > 0) {
                await nextButtons[0]?.click();
                page++;
            }
            else {
                console.log("Scraping terminé ! ");
                break;
            }
        }
        fs.writeFileSync("quotes.json", JSON.stringify(allQuotes, null, 2), "utf-8");
        console.log(`${allQuotes.length} quotes sauvegardés dans quotes.json ! `);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
    finally {
        if (driver) {
            await driver.quit();
        }
    }
})();
//# sourceMappingURL=scrapper.js.map