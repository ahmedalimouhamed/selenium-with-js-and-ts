const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testDynamicForm(){
    console.log("Testing dynamic form with hidden elements...\n");

    let driver;

    try{
        const options = new chrome.Options();
        options.addArguments('--no-sandbox');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://demoqa.com/automation-practice-form');

        const waitForVisible = async(selector, timeout=10000) => {
            const element = await driver.wait(until.elementLocated(selector), timeout);
            return await driver.wait(until.elementIsVisible(element), timeout);
        }

        console.log('1. Testing dynamic from fields...');

        await (await waitForVisible(By.id('firstName'))).sendKeys('John');
        await (await waitForVisible(By.id('lastName'))).sendKeys('Doe');

        const emailField = await waitForVisible(By.id('userEmail'));
        await emailField.sendKeys('john.doe@example.com');
        
        const maleRadio = await waitForVisible(By.css('label[for="gender-radio-1"]'));
        await driver.executeScript("arguments[0].click();", maleRadio);
        console.log("Gender selected");

        const mobileField = await waitForVisible(By.id('userNumber'));
        await mobileField.sendKeys('1234567890');
        console.log("Mobile number entered");

        const dobField = await waitForVisible(By.id('dateOfBirthInput'));
        await dobField.click();

        const datepicker = await waitForVisible(By.css('.react-datepicker'));

        const monthSelect = await waitForVisible(By.css('.react-datepicker__month-select'));
        await monthSelect.sendKeys('January');

        const yearSelect = await waitForVisible(By.css('.react-datepicker__year-select'));
        await yearSelect.sendKeys('1990');

        const day = await waitForVisible(By.css('.react-datepicker__day--015'));
        await day.click();
        console.log("Date of birth selected");

        console.log("\n3. Testing autocomplete field...");
        const subjectsInput = await waitForVisible(By.id('subjectsInput'));
        await subjectsInput.sendKeys('Maths');

        await driver.wait(until.elementLocated(By.css('.subjects-auto-complete__menu')), 5000);
        await subjectsInput.sendKeys('Enter');
        console.log('Subject Added');

        const sportsCheckbox = await waitForVisible(By.css('label[for="hobbies-checkbox-1"]'));
        await sportsCheckbox.click();
        console.log('Hobby selected');

        console.log('\n3.Testing file uploed (hidden input)...');
        const fileInput = await driver.findElement(By.id('uploadPicture'));

        const isDisplayed = await fileInput.isDisplayed();
        console.log(`File input visible: ${isDisplayed}`);

        await fileInput.sendKeys(__dirname + '/test-file.txt');
        console.log('File uploaded');

        const addressField = await waitForVisible(By.id('currentAddress'));
        await addressField.sendKeys('123 Test Street, test city');

        console.log("\n4. Testing dynamic dropdowns...");

        await driver.executeScript("arguments[0].scrollIntoView(true);", await driver.findElement(By.id('state')));

        const stateDropdown = await waitForVisible(By.id('state'));
        await driver.executeScript("arguments[0].scrollIntoView(true);", stateDropdown);

        await driver.executeScript("arguments[0].click();", stateDropdown);

        const stateInput = await driver.findElement(By.id('react-select-3-input'));
        await stateInput.sendKeys('NCR');
        await stateInput.sendKeys('\n');
        console.log('State selected');

        const cityDropdown = await waitForVisible(By.id('city'));
        await driver.executeScript('arguments[0].click();', cityDropdown);

        const cityOption = await driver.findElement(By.id('react-select-4-input'));
        await cityOption.sendKeys('Delhi');
        await cityOption.sendKeys('\n');
        console.log('City selected');

        console.log('\n5. Testing from submission...');
        const submitButton = await waitForVisible(By.id('submit'));
        await driver.executeScript('arguments[0].click();', submitButton);

        const modal = await waitForVisible(By.id('example-modal-sizes-title-lg'));
        const modalText = await modal.getText();

        if(modalText === 'Thanks for submitting the form'){
            console.log('Form submitted successfully');

            const submittedData = await driver.findElement(By.css('.table td'));
            for(let i = 0; i < submittedData.length; i += 2){
                const label = await submittedData[i].getText();
                const value = await submittedData[i+1]?.getText();
                console.log(`   ${label}: ${value}`);
            }
        }

        console.log('\nAll dynamic form tests passed!!!');
    }catch(error){
        console.error("Test execution failed:", error);
    }finally{
        if(driver){
            await driver.quit();
        }
    }
}

const fs = require('fs');
if(!fs.existsSync('test-file.txt')){
    fs.writeFileSync('test-file.txt', 'This is a test file');
}

testDynamicForm();
