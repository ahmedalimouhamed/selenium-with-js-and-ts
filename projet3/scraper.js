import { Builder, By, until, WebDriver } from "selenium-webdriver";
import fs from "fs";
async function scrapeCategory(driver, categoryUrl, categoryName) {
    let products = [];
    let page = 1;
    await driver.get(categoryUrl);
    while (true) {
        console.log(`[${categoryName}] Page ${page}`);
        await driver.wait(until.elementLocated(By.css(".product_pod")), 5000);
        const items = await driver.findElements(By.css(".product_pod"));
        for (let item of items) {
            const title = await item.findElement(By.css("h3 a")).getAttribute("title");
            const price = await item.findElement(By.css(".price_color")).getText();
            products.push({ title, price, category: categoryName });
        }
        let nextBtns = await driver.findElements(By.css(".next a"));
        if (nextBtns.length > 0) {
            await nextBtns[0]?.click();
            page++;
        }
        else {
            break;
        }
    }
    return products;
}
(async function scrapeEcommerce() {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
    let allProducts = [];
    try {
        await driver.get("https://books.toscrape.com/");
        const categories = [
            { name: "Travel", url: "https://books.toscrape.com/catalogue/category/books/travel_2/index.html" },
            { name: "Mystery", url: "https://books.toscrape.com/catalogue/category/books/mystery_3/index.html" },
            { name: "Historical Fiction", url: "https://books.toscrape.com/catalogue/category/books/historical-fiction_4/index.html" }
        ];
        for (let cat of categories) {
            let products = await scrapeCategory(driver, cat.url, cat.name);
            allProducts.push(...products);
        }
        fs.writeFileSync("products.json", JSON.stringify(allProducts, null, 2), "utf-8");
        console.log(`${allProducts.length} produits sauvegardés dans products.json ! `);
        let csv = "Title,Price,Category\n" +
            allProducts.map(p => `"${p.title.replace(/"/g, '""')}","${p.price}","${p.category}"`).join("\n");
        fs.writeFileSync("products.csv", csv, "utf-8");
        console.log(`${allProducts.length} produits sauvegardés dans products.csv ! `);
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
//# sourceMappingURL=scraper.js.map