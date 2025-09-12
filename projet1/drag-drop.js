const {Builder, By, until} = require('selenium-webdriver');

(async function testDragDrop() {
    let driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    
    try {
        await driver.get('https://the-internet.herokuapp.com/drag_and_drop');
        
        const source = await driver.findElement(By.id('column-a'));
        const target = await driver.findElement(By.id('column-b'));

        console.log('Avant drag and drop:');
        console.log('Colonne A :', await source.getText());
        console.log('Colonne B :', await target.getText());

        // Attendre que la page soit complètement chargée
        await driver.sleep(5000);

        // Utiliser JavaScript natif pour le drag and drop
        const jsCode = `
            function createEvent(type) {
                var event = document.createEvent('CustomEvent');
                event.initCustomEvent(type, true, true, null);
                event.dataTransfer = {
                    data: {},
                    setData: function(key, value) {
                        this.data[key] = value;
                    },
                    getData: function(key) {
                        return this.data[key];
                    }
                };
                return event;
            }

            function dispatchEvent(element, event, transferData) {
                if (transferData !== undefined) {
                    event.dataTransfer = transferData;
                }
                if (element.dispatchEvent) {
                    element.dispatchEvent(event);
                } else if (element.fireEvent) {
                    element.fireEvent('on' + event.type, event);
                }
            }

            var source = arguments[0];
            var target = arguments[1];
            
            var dragStartEvent = createEvent('dragstart');
            dispatchEvent(source, dragStartEvent);
            
            var dropEvent = createEvent('drop');
            dispatchEvent(target, dropEvent, dragStartEvent.dataTransfer);
            
            var dragEndEvent = createEvent('dragend');
            dispatchEvent(source, dragEndEvent, dragStartEvent.dataTransfer);
        `;
        
        await driver.executeScript(jsCode, source, target);
        console.log('Drag and drop effectué');

        await driver.sleep(2000);

        console.log('Après drag and drop:');
        console.log('Colonne A :', await source.getText());
        console.log('Colonne B :', await target.getText());
        
    } catch(error) {
        console.error('Une erreur est survenue :', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
})();