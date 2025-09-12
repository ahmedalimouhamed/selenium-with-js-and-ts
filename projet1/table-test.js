const {Builder, By, until} = require('selenium-webdriver');

(
    async function testTables(){
        let driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();

        try{
            await driver.get('https://the-internet.herokuapp.com/tables');

            const table = await driver.findElement(By.id('table1'));
            const rows =await table.findElements(By.css('tbody tr'));

            console.log(`Nombre de lignes : ${rows.length}`);

            for(let i = 0; i < rows.length; i++){
                const cells = await rows[i].findElements(By.css('td'));
                const nom = await cells[0].getText();
                const prenom = await cells[1].getText();
                const email = await cells[2].getText();

                console.log(`Ligne ${ i + 1 } : ${nom} ${prenom} - ${email}`);
            }

            const sortButton = await driver.findElement(By.xpath('//span[text()="Last Name"]/..'));
            await sortButton.click();
            console.log('tableau trié par nom');

            await driver.sleep(2000);

            await driver.takeScreenshot().then(image => {
                require('fs').writeFileSync('table-sorted.png', image, 'base64');
                console.log('Capture d\'écran sauvegardée !')
            })
            
        }catch(e){
            console.log(e);
            throw e;
        }finally{
            if(driver){
                await driver.quit();
            }
        }
    }
)()