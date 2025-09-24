const HomePage = require('../../src/pages/HomePage');
const ProductPage = require('../../src/pages/ProductPage');
const testData = require('../../config/testData.json'); 
const DriverManager = require('../../src/core/DriverManager');   

async function runSmokeTests(){
    console.log('Running smoke tests...');
    let passes = 0;
    let failures = 0;

    try {
        // Initialize driver
        await DriverManager.createDriver('chrome');
        const driver = DriverManager.getDriver();
        
        // Initialize page objects with the driver
        const homePage = new HomePage(driver);
        const productPage = new ProductPage(driver);

        // Test 1: Navigate to home page
        console.log('Test 1: Navigate to home page');
        try {
            await homePage.navigateToHome();
            console.log('✓ Successfully navigated to home page');
            passes++;
        } catch (error) {
            console.error('✗ Failed to navigate to home page:', error.message);
            failures++;
        }

        // Test 2: Login with valid credentials
        console.log('\nTest 2: Login with valid credentials');
        try {
            await homePage.login(
                testData.users.standard.username,
                testData.users.standard.password
            );
            const isLoggedIn = await homePage.isLoggedIn();
            if (isLoggedIn) {
                console.log('✓ Successfully logged in');
                passes++;
            } else {
                throw new Error('Login verification failed');
            }
        } catch (error) {
            console.error('✗ Login test failed:', error.message);
            failures++;
        }

        console.log('3. view products list')
        try{
            const productCount = await productPage.getProductCount();
            if(productCount > 0){
                console.log('✓ Successfully viewed products list');
                passes++;
            }else{
                throw new Error('Product list is empty');
            }
        }catch(error){
            console.error('✗ Failed to view products list:', error.message);
            failures++;
        }

        console.log('4. logout from application')
        try{
            await homePage.logout();
            const isLoggedOut = await homePage.isElementVisible(homePage.loginButton);
            if(isLoggedOut){
                console.log('✓ Successfully logged out');
                passes++;
            }else{
                throw new Error('Logout verification failed');
            }
        }catch(error){
            console.error('✗ Failed to logout from application:', error.message);
            failures++;
        }

    } catch (error) {
        console.error('Test execution error:', error);
        failures++;
    } finally {
        // Clean up
        await DriverManager.quitDriver();
        console.log(`\nTest Results: ${passes} passed, ${failures} failed`);
    }
}

runSmokeTests();