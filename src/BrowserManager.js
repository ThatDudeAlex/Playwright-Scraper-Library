const { chromium } = require('playwright');

/**
 * Manages browser connections
 * @typedef {Object} BrowserManager
 * @property {import('playwright').Browser} browser
 * @property {import('playwright').BrowserContext} context
 * @property {import('playwright').Page} page
 */
class BrowserManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
  * Launches a new browser instance.
  * @param {import('playwright').LaunchOptions} launchOptions - Browser launch options
  * @param {import('playwright').BrowserContextOptions} contextOptions - Context config options
  * @returns {Promise<import('playwright').Page>} new page on the browser
  */
  async launchBrowser(launchOptions, contextOptions = {}) {
    try {
      this.browser = await chromium.launch(launchOptions);
      this.context = await this.browser.newContext(contextOptions);
      this.page = await this.context.newPage(); 
  
      console.log("Browser Launched");
      return this.page;
    } catch (error) {
      console.error("Error launching browser: ", error);
      throw error;
    }
  }

  /**
   * Connects to an already existing browser over cdp
   * @param {string} endpoint - URL or WebSocket address of the remote debugging port
   * @param {number} [contextIndex=0] - Index of the context to connect to (default: 0)
   * @returns {Promise<import('playwright').Page>} A new page in the connected context
   */
  async connectOverCDP(endpoint, contextIndex = 0) {
    try {
      this.browser = await chromium.connectOverCDP(endpoint);
      this.context = this.browser.contexts()[contextIndex];
      this.page = await this.context.newPage(); 
  
      console.log(`Connected to endpoint: ${endpoint}, context index: ${contextIndex}`);
      return this.page;
    } catch (error) {
      console.error(`Error connecting to endpoint ${endpoint}: `, error);
      throw error;
    }
  }
  
  /**
   * Creates a new browser context if one doesn't exist.
   * If a context already exists, it logs a warning message.
   *
   * @param {import('playwright').BrowserContextOptions} contextOptions - Context configuration options
   * @returns {Promise<import('playwright').BrowserContext>} New or existing browser context
   */
  async newContext(contextOptions) {
    try {
      if (!this.context) {
        this.context = await this.browser.newContext(contextOptions);
        console.log("New Context Created");
      } else {
        console.warn("Current Context needs to close before creating a new one");
      }
      return this.context;
    } catch (error) {
      console.error("Error creating context: ", error);
      throw error;
    }
  }
  
  /**
   * Opens a new page
   * @param {boolean} [isolatePage=false] - Whether to create a new page without replacing `this.page` (default: false)
   * @returns {Promise<import('playwright').Page>} new page on the browser
   */
  async newPage(isolatePage = false) {
    try {
      if (isolatePage) {
        console.log(`Creating new isolated page`);
        return await this.context.newPage();
      }
      this.page = await this.context.newPage();
      console.log("New Page Created");
      return this.page;
    } catch (error) {
      console.error("Error creating new page: ", error);
      throw error;
    }
  }

  /**
   * Terminates the current browser context
   */
  async closeContext() {
    try {
      if (this.context) {
        await this.context.close();
        console.log('Closed Context');
      }
    } catch (error) {
      console.error("Error closing context: ", error);
    }
  }
  
  /**
   * Terminates the browser connection
   */
  async closeBrowser() {
    try {
      if (this.browser) {
        await this.closeContext();
        await this.browser.close();
        console.log('Closed Browser');
      }
    } catch (error) {
      console.error("Error closing browser: ", error);
    }
  }
}

module.exports = { BrowserManager }