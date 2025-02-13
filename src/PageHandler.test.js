const { chromium } = require('playwright');
const { PageHandler } = require('./PageHandler');
const { expect } = require('playwright/test');

const testUrl1 = 'https://www.example.com';
const testUrl2 = 'https://www.google.com';
const timeoutTime = 40000;

let browser;
let context;
let page;
let pageHandler;

beforeEach(async () => {
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage();
  pageHandler = new PageHandler(page);
});

afterEach(async () => {
  await page.close();
  await context.close();
  await browser.close();
  pageHandler = null;
});

describe('goToUrl', () => {
  it('should navigate to the specified URL (example.com)', async () => {
    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    await pageHandler.goToUrl(testUrl1);

    const actualUrl   = new URL(page.url());
    const expectedUrl = new URL(testUrl1);
   
    // Assertions
    expect(actualUrl).toStrictEqual(expectedUrl);
    expect(consoleLogSpy).toHaveBeenCalledWith(`Goto: ${testUrl1}`);

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime); 

  it('should handle invalid URLs', async () => {
    await expect(pageHandler.goToUrl('invalid-url')).rejects.toThrowError(); 
  });
});

describe('goBack', () => {
  it('should navigate to the previous page in history', async () => {
    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Init navigation history
    await pageHandler.goToUrl(testUrl1);
    await pageHandler.goToUrl(testUrl2);
    await pageHandler.goBack();

    const actualUrl   = new URL(page.url());
    const expectedUrl = new URL(testUrl1);

    // Assertions
    expect(expectedUrl).toStrictEqual(actualUrl);
    expect(consoleLogSpy).toHaveBeenCalledWith(`Go Back`);

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime); 
  
  it('throw error when navigation history is empty', async () => {
    expect(pageHandler.goBack()).rejects.toThrowError();
  }, timeoutTime); 
});

describe('goForward', () => {
  it('should navigate to the next page in history', async () => {
    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Init navigation history
    await pageHandler.goToUrl(testUrl1);
    await pageHandler.goToUrl(testUrl2);
    await pageHandler.goBack();
    await pageHandler.goForward();

    const actualUrl   = new URL(page.url());
    const expectedUrl = new URL(testUrl2);

    // Assertions
    expect(expectedUrl).toStrictEqual(actualUrl);
    expect(consoleLogSpy).toHaveBeenCalledWith(`Go Forward`);

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime); 
  
  it('throw error when navigation history is empty', async () => {
    expect(pageHandler.goForward()).rejects.toThrowError();
  }, timeoutTime); 
});

describe('reloadPage', () => {
  it('should reload current page', async () => {
    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    await pageHandler.goToUrl(testUrl1);
    await pageHandler.reloadPage();

    const actualUrl   = new URL(page.url());
    const expectedUrl = new URL(testUrl1);

    // Assertions
    expect(expectedUrl).toStrictEqual(actualUrl);
    expect(consoleLogSpy).toHaveBeenCalledWith(`Reloaded Page`);

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime); 
  
  it('throw error when reloading without being at a url', async () => {
    expect(pageHandler.reloadPage).rejects.toThrowError();
  }, timeoutTime); 
});

describe('getElements', () => {
  it('should retrieve all elements matching the selector (div)', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div><div class="testing"></div></div>');

    const elementsTest1 = await pageHandler.getElements('div');
    const elementsTest2 = await pageHandler.getElements('.testing');

    // Assertions
    expect(elementsTest1.length).toBe(3);
    expect(elementsTest2.length).toBe(1);
  });
  
  it('return 0 when no elements found', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div><div class="testing"></div></div>');

    const elements = await pageHandler.getElements('p');

    // Assertions
    expect(elements.length).toBe(0);
  });
  
  it('throw error when input is invalid', async () => {
    expect(pageHandler.getElements(null)).rejects.toThrowError();
    expect(pageHandler.getElements(undefined)).rejects.toThrowError();
  });
  
});

describe('getElementText', () => {
  it('should retrieve element text with selector', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div class="testing">Item 2</div>');
    
    const got = await pageHandler.getElementText('.testing');

    // Assertions
    expect(got).toBe('Item 2');
  });
  
  it('should retrieve element text with locator', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div class="testing">Item 2</div>');

    const locator = page.locator('.testing')
    const got = await pageHandler.getElementText(locator);

    // Assertions
    expect(got).toBe('Item 2');
  });
  
  it('should return null when element not found', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div class="testing">Item 2</div>');

    let got = await pageHandler.getElementText('.notfound');

    // Assertions
    expect(got).toBe(null);
  }, timeoutTime);
  
  it('should return null when invalid input', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div class="testing">Item 2</div>');

    const got1 = await pageHandler.getElementText(null);
    const got2 = await pageHandler.getElementText(undefined);

    // Assertions
    expect(got1).toBe(null);
    expect(got2).toBe(null);
  });
});

describe('getElementAttribute', () => {
  it('should retrieve element href attribute with selector', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div><a class="testing" href="https://www.example.com">Item 2</a></div>');

    const got = await pageHandler.getElementAttribute('.testing', 'href');

    // Assertions
    expect(got).toBe(testUrl1);
  });
  
  it('should retrieve element href attribute with locator', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div><a class="testing" href="https://www.example.com">Item 2</a></div>');

    const locator = page.locator('.testing')
    const got = await pageHandler.getElementAttribute(locator, 'href');

    // Assertions
    expect(got).toBe(testUrl1);
  });
  
  it('should retrieve element src attribute with selector', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div class="testing">Item 2 <img src="example.jpg">></div>');

    const got = await pageHandler.getElementAttribute('.testing img', 'src');

    // Assertions
    expect(got).toBe('example.jpg');
  });
  
  it('should retrieve element src attribute with locator', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div class="testing">Item 2 <img src="example.jpg">></div>');

    const locator = page.locator('.testing img')
    const got = await pageHandler.getElementAttribute(locator, 'src');

    // Assertions
    expect(got).toBe('example.jpg');
  });
  
  it('throw error when DOM has not content', async () => {
    expect(pageHandler.getElementAttribute('a', 'href')).rejects.toThrowError();
  });
  
  it('throw error when inputs are invalid', async () => {
    // Init DOM
    await page.setContent('<div>Item 1</div><div class="testing">Item 2 <img src="example.jpg">></div>');

    // Assertions
    expect(pageHandler.getElementAttribute('.testing a', 'href')).rejects.toThrowError();
    expect(pageHandler.getElementAttribute('.testfail img', 'src')).rejects.toThrowError();
  });
  
});

describe('click', () => {
  it('should click element with selector', async () => {
    // Init DOM
    await page.setContent('<div><button id="one">one</button><button id="two">two</button></div>');

    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Click the element
    await pageHandler.click('#two');

    // Assertions
    expect(consoleLogSpy).toHaveBeenCalledWith('Clicked element');

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime);
  
  it('should click element with locator', async () => {
    // Init DOM
    await page.setContent('<div><button id="one">one</button><button id="two">two</button></div>');
    const locator = page.locator('#two');

    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Click the element
    await pageHandler.click(locator);

    // Assertions
    expect(consoleLogSpy).toHaveBeenCalledWith('Clicked element');

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime);
  
  it('should click element with min/max wait time passed', async () => {
    // Init DOM
    await page.setContent('<div><button id="one">one</button><button id="two">two</button></div>');

    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Click the element
    await pageHandler.click('#two', 500, 2000);

    // Assertions
    expect(consoleLogSpy).toHaveBeenCalledWith('Clicked element');

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  });
  
  it('should click element with min/max wait time passed', async () => {
    // Init DOM
    await page.setContent('<div><button id="one">one</button><button id="two">two</button></div>');

    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Click the element
    await pageHandler.click('#two', 500, 2000);

    // Assertions
    expect(consoleLogSpy).toHaveBeenCalledWith('Clicked element');

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  });


  it('throw error when inputs are invalid', async () => {
    // Init DOM
    await page.setContent('<div><button id="one">one</button><button id="two">two</button></div>');
    // Assertions
    expect(pageHandler.getElementAttribute('#three')).rejects.toThrowError();
    expect(pageHandler.getElementAttribute(null)).rejects.toThrowError();
    expect(pageHandler.getElementAttribute(undefined)).rejects.toThrowError();
  });
  
});

describe('typeText', () => {
  it('should fill input/textarea elements with selector', async () => {
    const ID1     = 'one';
    const ID1_TXT = 'testing1';
    const ID2     = 'two';
    const ID2_TXT = 'testing2';

    // Init DOM
    await page.setContent(`<input id="${ID1}"/> <textarea id="${ID2}"></textarea>`);
    
    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    const got1    = await pageHandler.typeText(`#${ID1}`, `${ID1_TXT}`);
    const got1Txt = await page.locator(`#${ID1}`).inputValue(); 

    const got2    = await pageHandler.typeText(`#${ID2}`, `${ID2_TXT}`);
    const got2Txt = await page.locator(`#${ID2}`).inputValue(); 

    // Assertions
    expect(got1).toBe(true);
    expect(got1Txt).toBe(ID1_TXT);
    expect(got2).toBe(true);
    expect(got2Txt).toBe(ID2_TXT);

    expect(consoleLogSpy).toHaveBeenCalledWith(`Filled input element with: ${ID1_TXT}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(`Filled input element with: ${ID2_TXT}`);

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime);
  
  it('should fill input/textarea elements with locator', async () => {
    const ID1     = 'one';
    const ID1_TXT = 'testing1';
    const ID2     = 'two';
    const ID2_TXT = 'testing2';

    // Init DOM
    await page.setContent(`<input id="${ID1}"/> <textarea id="${ID2}"></textarea>`);
    const locator1 = page.locator(`#${ID1}`);
    const locator2 = page.locator(`#${ID2}`);

    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    const got1    = await pageHandler.typeText(locator1, `${ID1_TXT}`);
    const got1Txt = await locator1.inputValue(); 

    const got2    = await pageHandler.typeText(locator2, `${ID2_TXT}`);
    const got2Txt = await locator2.inputValue(); 

    // Assertions
    expect(got1).toBe(true);
    expect(got1Txt).toBe(ID1_TXT);
    expect(got2).toBe(true);
    expect(got2Txt).toBe(ID2_TXT);


    expect(consoleLogSpy).toHaveBeenCalledWith(`Filled input element with: ${ID1_TXT}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(`Filled input element with: ${ID2_TXT}`);

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime);

  it('throw error when inputs are invalid', async () => {
    // Init DOM
    await page.setContent(`<p class="test"></p>`);

    // Assertions
    expect(pageHandler.typeText('#three')).rejects.toThrowError();
    expect(pageHandler.typeText(null)).rejects.toThrowError();
    expect(pageHandler.typeText(undefined)).rejects.toThrowError();
  }, timeoutTime);
});

describe('clickElemenWithText', () => {
  it('should click button with text', async () => {
    // Init DOM
    await page.setContent('<button>Run 1</button>');

    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    await pageHandler.clickElemenWithText('button', 'Run 1');
    
    // Assertions
    expect(consoleLogSpy).toHaveBeenCalledWith('Clicked element with text: Run 1');

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime);
  
  it('should click correct element if 2+ have the same text', async () => {
    // Init DOM
    await page.setContent('<button>Run 1</button> <button class="test">Run 1</button>');

    // Spy on the console.log to check for the log message
    const consoleLogSpy = jest.spyOn(console, 'log');

    await pageHandler.clickElemenWithText('.test', 'Run 1');
    
    // Assertions
    expect(consoleLogSpy).toHaveBeenCalledWith('Clicked element with text: Run 1');

    // Restore the original console.log
    consoleLogSpy.mockRestore();
  }, timeoutTime);

  it('throw error when inputs are invalid', async () => {
    // Init DOM
    await page.setContent(`<button class="test">Run 1</button>`);

    // Assertions
    expect(pageHandler.clickElemenWithText('.test', 'Run 2')).rejects.toThrowError();
    expect(pageHandler.clickElemenWithText(null, 'Run 2')).rejects.toThrowError();
    expect(pageHandler.clickElemenWithText(undefined, 'Run 2')).rejects.toThrowError();
  }, timeoutTime);
  
  
});