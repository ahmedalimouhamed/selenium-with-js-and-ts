const HomePage = require('../pages/HomePage');
const ProductPage = require('../pages/ProductPage');
const testData = require('../config/testData.json');

describe('Regression Tests - E-commerce Website', () => {
    let homePage;
    let productPage;

    beforeEach(async() => {
        homePage = new HomePage();
        productPage = new ProductPage();

        await DriverManager.createDriver('chrome');
        await homePage.navigateToHome();
        await homePage.login(
            testData.users.standard.username,
            testData.users.standard.password
        );
    });

    afterEach(async() => {
        await homePage.logout();
        await DriverManager.quitDriver();
    });

    test('TC101 - Sort products by price low to high', async() => {
        await productPage.sortProducts('lohi');
        const prices = await productPage.getProductPrices();

        const sortedPrices = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sortedPrices);
    });

    test('TC102 - Sort products by price high to low', async() => {
        await productPage.sortProducts('hilo');
        const prices = await productPage.getProductPrices();

        const sortedPrices = [...prices].sort((a, b) => b - a);
        expect(prices).toEqual(sortedPrices);
    });

    test('TC103 - Sort products by name A to Z', async() => {
        await productPage.sortProducts('az');
        const names = await productPage.getProductNames();

        const sortedNames = [...names].sort();
        expect(names).toEqual(sortedNames);
    });

    test('TC104 - Sort products by name Z to A', async() => {
        await productPage.sortProducts('za');
        const names = await productPage.getProductNames();

        const sortedNames = [...names].sort().reverse();
        expect(names).toEqual(sortedNames);
    });

    test('TC105 - Add multiple products to cart', async() => {
        const productsToAdd = 3;
        let initialCartCount = await productPage.getCartItemCount();
        
        for(let i = 0; i < productsToAdd; i++){
            await productPage.addProductToCart(i);
        }

        const finalCartCount = await productPage.getCartItemCount();
        expect(finalCartCount).toBe(initialCartCount + productsToAdd);
    });

    test('TC106 - Remove product from cart', async() => {
        await productPage.addProductToCart(0);
        const countAfterAdd = await productPage.getCartItemCount();

        await productPage.removeProductFromCart(0);
        const countAfterRemove = await productPage.getCartItemCount();
        expect(countAfterRemove).toBe(countAfterAdd - 1);
    });

    test('TC107 - login wit invalid credentials', async() => {
        await homePage.logout();

        await homePage.login('invalid_user', 'wrong_password');
        const errorMessage = await homePage.getErrorMessage();
        expect(errorMessage).toContain('Username and password do not match');
    });

    test('TC108 - login with locked out user', async() => {
        await homePage.logout();

        await homePage.login(
            testData.users.locked.username,
            testData.users.locked.password
        );
        const errorMessage = await homePage.getErrorMessage();
        expect(errorMessage).toContain('Sorry, this user has been locked out');
    });

})