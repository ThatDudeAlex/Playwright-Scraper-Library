const { chromium } = require('playwright');

/**
 * Handles page interactions such as navigation, and element interactions
 * @typedef {Object} PageHandler
 * @property {import('playwright').Page} page
 */
class PageHandler {
  constructor(page) {
    this.page = page;
  }

  /**
   * Goes to the given `url`
   * @param {string} url 
   * @param {string} [options={waitUntil: 'load'}] - `default: {waitUntil: 'load'} `
   * @param {number} [waitMin=4000]  The minimum wait time in milliseconds
   * @param {number} [waitMax=7000] The maximum wait time in milliseconds
   */
  async goToUrl(url, options = { waitUntil: 'load' }, waitMin=4000, waitMax=7000) {
    try {
      console.log(`Goto: ${url}\n`);
      await this.page.goto(url, options);
      await this.waitForRandomTimeout(waitMin, waitMax);
    } catch (error) {
      console.error(`Error going to url: ${url}, error: ${error}`);
      throw error;
    }
  }
  
  /**
   * Navigate to the previous page in history
   * @param {string} [options={waitUntil: 'load'}] - `default: {waitUntil: 'load'} `
   * @param {number} [waitMin=4000]  The minimum wait time in milliseconds
   * @param {number} [waitMax=7000] The maximum wait time in milliseconds
   */
  async goBack(options = { waitUntil: 'load' }, waitMin=4000, waitMax=7000) {
    try {
      console.log(`Go Back\n`);
      await this.page.goBack(options);
      await this.waitForRandomTimeout(waitMin, waitMax);
    } catch (error) {
      console.error(`Error going back: ${error}`);
      throw error;
    }
  }
  
  /**
   * Navigate to the next page in history
   * @param {string} [options={waitUntil: 'load'}] - `default: {waitUntil: 'load'} `
   * @param {number} [waitMin=4000]  The minimum wait time in milliseconds
   * @param {number} [waitMax=7000] The maximum wait time in milliseconds
   */
  async goForward(options = { waitUntil: 'load' }, waitMin=4000, waitMax=7000) {
    try {
      await this.page.goForward(options);
      await this.waitForRandomTimeout(waitMin, waitMax);
      console.log(`Go Forward`);
    } catch (error) {
      console.error(`Error going forward: ${error}`);
      throw error;
    }
  }
  
  /**
   * Reloads the current page
   * @param {string} [options={waitUntil: 'load'}] - `default: {waitUntil: 'load'} `
   * @param {number} [waitMin=4000]  The minimum wait time in milliseconds
   * @param {number} [waitMax=7000] The maximum wait time in milliseconds
   */
  async reloadPage(options = { waitUntil: 'load' }, waitMin=4000, waitMax=7000) {
    try {
      await this.page.reload(options);
      await this.waitForRandomTimeout(waitMin, waitMax);
      console.log(`Reloaded Page\n`);
    } catch (error) {
      console.error(`Error reloading page: ${error}`);
      throw error;
    }
  }

  /**
   * Makes the scraper wait a random amount of time. By default waits between 5 - 12 seconds
   * @param {number} [waitMin=5000]  The minimum wait time in milliseconds
   * @param {number} [waitMax=12000] The maximum wait time in milliseconds
   */
  async waitForRandomTimeout(waitMin = 5000, waitMax = 12000) {
    const waitTime = Math.floor(Math.random() * (waitMax - waitMin + 1)) + waitMin;
    await this.page.waitForTimeout(waitTime);
  }

  /**
   * Gets all elements elements with the given selector
   * @param {string} selector - CSS selector for elements 
   * @returns {Promise<import('playwright').ElementHandle<HTMLElement>>} A promise that resolves to an array of ElementHandle objects
   */
  async getElements(selector) {
    try {
      return await this.page.locator(selector).all();
    } catch (error) {
      console.error(`Error getting elements with selector ${selector}, error: ${error}`)
      throw error;
    }
  }

  /**
   * Returns the text contents of the element found with `selectorOrLocator`
   * @param {string|import('playwright').Locator} selectorOrLocator - Either a CSS selector or a Locator
   * @returns {string} the element text contents
   */
  async getElementText(selectorOrLocator) {
    try {
      if (typeof selectorOrLocator === 'string') {
        return await this.page.locator(selectorOrLocator).textContent();
      }
      return await selectorOrLocator.textContent();
     } catch (error) {
         console.error(`Error getting element text with selector ${selectorOrLocator}: ${error}`);
         return null;
     }
  }
  
  /**
   * Returns the href of `element`
   * @param {import('playwright').Locator | import('playwright').ElementHandle} selectorOrLocator
   * @param {string} attributeName - attribute name
   * @returns {Promise<any>} The element attribute value
   */
  async getElementAttribute(selectorOrLocator, attributeName) { 
    try {
      return await selectorOrLocator.getAttribute(attributeName);
    } catch (error) {
      console.error(`Error getting element attribute: ${attributeName}`);
      throw error;
    }
  }

  /**
   * Clicks the element given in `selectorOrLocator` and waits before next action
   * @param {string|import('playwright').Locator} selectorOrLocator - Either a CSS selector or a Locator
   * @param {number} [waitMin=3000]  The minimum wait time in milliseconds
   * @param {number} [waitMax=7000] The maximum wait time in milliseconds
   */
  async clickAndWait(selectorOrLocator, waitMin=3000, waitMax=7000) {
    try {
      if (typeof selectorOrLocator === 'string') {
        await this.page.locator(selectorOrLocator).click();
      } else {
        await selectorOrLocator.click();
      }

      await this.waitForRandomTimeout(waitMin, waitMax);
      console.log('Clicked element');
    } catch (error) {
      console.error(`Error clicking element: ${error}`);
      throw error;
    }
  }
  
  /**
   * Sets a value to the `selectorOrLocator` input element.  
   * Returns boolean if element was succesfully filled element
   * @param {string|import('playwright').Locator} selectorOrLocator - Either a CSS selector or a Locator
   * @param {string} text - Input text
   * @param {number} [waitMin=3000] The minimum wait time in milliseconds
   * @param {number} [waitMax=8000] The maximum wait time in milliseconds
   * @param {boolean} [throwOnError=true] - Whether to throw an error if the element is not an input element or if another error occurs (default: true)
   * @returns {boolean} `true` if filled, `false` if `throwOnError=false`
   */
  async typeText(selectorOrLocator, text, waitMin=3000, waitMax=8000, throwOnError=true) {
    if (typeof selectorOrLocator === 'string') {
      selectorOrLocator = this.page.locator(selectorOrLocator);
    }

    try {
      await selectorOrLocator.fill(text);
      await this.waitForRandomTimeout(waitMin, waitMax);
      console.log(`Filled input element with: ${text}`)

      return true;
    } catch (error) {
      if (throwOnError) {
        console.error(`Error filling element: ${error}`);
        throw error;
      }
      console.warn(`Warning: Could not fill element (likely not an input element): ${error.message}`);
      return false;
    }
  }

  /**
   * Clicks the first element with the given text, and waits before the next action
   * @param {string} selector - CSS selector for element
   * @param {string} elementText - Text content the element should have
   * @param {number} [waitMin=3000]  The minimum wait time in milliseconds
   * @param {number} [waitMax=7000] The maximum wait time in milliseconds
   */
  async clickElemenWithText(selector, elementText, waitMin=3000, waitMax=7000) {
    try {
      await this.page.locator(selector, { hasText: elementText }).click();
      await this.waitForRandomTimeout(waitMin, waitMax);
      console.log(`Clicked element with text: ${elementText}`);
    } catch (error) {
      console.error(`Error clicking element with text: ${elementText}, error: ${elementText}`);
      throw error;
    }
  }

}

module.exports = { PageHandler }