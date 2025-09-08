const {Builder, By, until} = require('selenium-webdriver');
const fs = require("fs");

(async function scrapeToCSV(){
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();

    try{
        await driver.get("https://quotes.toscrape.com/");

        let results = [];

        let quotes = await driver.findElements(By.css(".quote"));

        for(let q of quotes){
            let text = await q.findElement(By.css(".text")).getText();
            let author = await q.findElement(By.css(".author")).getText();
            results.push({text, author});
        }

        let csv = "Quote, Author\n"+results.map(r => `"${r.text}","${r.author}"`).join("\n");

        fs.writeFileSync("quotes.csv", csv);
        console.log("Données sauvegardées dans quotes.csv ! ");
    }catch(e){
        console.log(e);
        throw e;
    }finally{
        if(driver){
            await driver.quit();
        }
    }
})()