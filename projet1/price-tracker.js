async function priceTracker(){
    const products = [
        {
            name: 'iphone 15',
            url: "https://amazon.fr/iphone-15",
            targetPrice: 800
        },
        {
            name: 'Macbook Pro',
            url: "https://amazon.fr/macbook-pro",
            targetPrice: 2000
        }
    ];

    while(true){
        for(const product of products){
            const driver = await createStealthDriver();

            try{
                await driver.get(product.url);

                const priceText = await driver.findElement(By.css('.a-price-whole')).getText();
                const currentPrice = parseFloat(priceText.replace('€', '').trim());
                console.log(`${product.name} : ${currentPrice}€`);

                if(currentPrice <= product.targetPrice){
                    sendEmail(
                        `Alerte prix! ${product.name} à ${currentPrice}€`,
                        `Lien : ${product.url}`
                    );

                    console.log('Alerte prix envoyée');
                }
            }catch(e){
                console.log(e);
                throw e;
            }finally{
                if(driver){
                    await driver.quit();
                }
            }

            await delay(5000)
        }

        await delay(3600000)
    }
}