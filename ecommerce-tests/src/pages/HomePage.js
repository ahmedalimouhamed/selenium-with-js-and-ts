const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class HomePage extends BasePage {
    constructor(driver) {
        super(driver);
        this.url = 'https://www.saucedemo.com/';
        
        // Element locators
        this.elements = {
            loginButton: { locator: 'login-button', type: 'id' },
            usernameInput: { locator: 'user-name', type: 'id' },
            passwordInput: { locator: 'password', type: 'id' },
            productsTitle: { locator: '.title', type: 'css' },
            menuButton: { locator: 'react-burger-menu-btn', type: 'id' },
            logoutLink: { locator: 'logout_sidebar_link', type: 'id' },
            errorMessage: { locator: '[data-test="error"]', type: 'css' }
        };
    }

    async login(username, password) {
        await this.type(this.elements.usernameInput, username, 'Username');
        await this.type(this.elements.passwordInput, password, 'Password');
        await this.click(this.elements.loginButton, 'Login Button');
        await this.waitForPageLoad();
    }

    async logout() {
        try {
            await this.click(this.elements.menuButton, 'Menu Button');
            await this.driver.sleep(500); // Small delay for menu animation
            await this.click(this.elements.logoutLink, 'Logout Link');
            await this.waitForPageLoad();
        } catch (error) {
            console.error('Error during logout:', error.message);
            throw error;
        }
    }

    async isLoggedIn() {
        return await this.isElementVisible(this.elements.productsTitle);
    }

    async navigateToHome() {
        await this.navigateTo(this.url);
    }

    async getErrorMessage() {
        try {
            return await this.getText(this.elements.errorMessage, 'Error Message');
        } catch (error) {
            return '';
        }
    }
}

module.exports = HomePage;