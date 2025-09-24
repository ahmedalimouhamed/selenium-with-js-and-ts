const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class ProductPage extends BasePage {
    constructor(driver) {
        super(driver);
        this.elements = {
            productItems: { locator: '.inventory_item', type: 'css' },
            productNames: { locator: '.inventory_item_name', type: 'css' },
            productPrices: { locator: '.inventory_item_price', type: 'css' },
            addToCartButtons: { locator: '.btn_inventory', type: 'css' },
            cartBadge: { locator: '.shopping_cart_badge', type: 'css' },
            sortDropdown: { locator: '.product_sort_container', type: 'css' }
        };
    }

    async getProductCount() {
        const products = await this.driver.findElements(this.getLocator(this.elements.productItems));
        return products.length;
    }

    async getProductNames() {
        const names = [];
        const elements = await this.driver.findElements(this.getLocator(this.elements.productNames));
        for (const el of elements) {
            names.push(await el.getText());
        }
        return names;
    }

    async addProductToCart(index = 0) {
        const buttons = await this.driver.findElements(this.getLocator(this.elements.addToCartButtons));
        if (buttons.length > index) {
            await buttons[index].click();
            return true;
        }
        throw new Error(`Product index ${index} not found`);
    }

    async getCartItemCount() {
        try {
            const badge = await this.driver.findElement(this.getLocator(this.elements.cartBadge));
            return parseInt(await badge.getText());
        } catch (error) {
            return 0;
        }
    }

    async sortProducts(option) {
        const dropdown = await this.driver.findElement(this.getLocator(this.elements.sortDropdown));
        await dropdown.click();
        await this.driver.findElement(By.css(`option[value="${option}"]`)).click();
    }
}

module.exports = ProductPage;