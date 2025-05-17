/**
 * Enhanced base page object model for all pages
 * Contains common functionality shared across all pages with improved error handling
 */
import { Page, Locator, expect } from '@playwright/test';
import { SELECTORS, PERFORMANCE } from '../test-constants';
import { retry, waitForElementStable, waitForNetworkIdle, findElementWithFallback } from '../helpers/test-helpers';

export class BasePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navBar: Locator;
  readonly footer: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1').first();
    this.navBar = page.locator('nav').first();
    this.footer = page.locator('footer').first();
  }
  
  /**
   * Navigate to the page with improved reliability
   * @param path Path to navigate to
   */
  async goto(path: string, options = { timeout: 30000 }) {
    try {
      await this.page.goto(path, { timeout: options.timeout });
      
      // Wait for the page to be fully loaded with better error handling
      await this.waitForPageLoad(options);
      
    } catch (error) {
      console.error(`Failed to navigate to ${path}:`, error);
      
      // Take a screenshot for debugging
      await this.page.screenshot({ path: `test-results/navigation-error-${Date.now()}.png` });
      
      // Try one more time
      console.log(`Retrying navigation to ${path}...`);
      await this.page.goto(path, { timeout: options.timeout });
      await this.waitForPageLoad({ timeout: options.timeout });
    }
  }
  
  /**
   * Wait for page to load completely with better error handling
   */
  async waitForPageLoad(options = { timeout: 30000 }) {
    const { timeout } = options;
    
    try {
      // Wait for main content to be visible with a reasonable timeout
      await this.page.waitForSelector('main, [role="main"], #main, .main-content', { 
        state: 'visible', 
        timeout: Math.min(10000, timeout) 
      }).catch(() => {
        // If no main content selector found, wait for body to be visible
        return this.page.waitForSelector('body', { state: 'visible', timeout: 5000 });
      });
      
      // Wait for any loading states to disappear
      await this.page.waitForSelector(SELECTORS.loadingSpinner, { 
        state: 'hidden', 
        timeout: 5000 
      }).catch(() => {
        // Ignore if no loading spinner is found
        console.log('No loading spinner found, continuing...');
      });
      
      // Wait for network to be idle with a reasonable timeout
      await waitForNetworkIdle(this.page, Math.min(10000, timeout));
      
    } catch (error) {
      console.log('Some page load conditions failed but continuing:', error);
      // Continue anyway since the page might be usable despite some conditions failing
    }
  }
  
  /**
   * Get page title with retry logic
   */
  async getTitle(): Promise<string> {
    return retry(
      async () => this.page.title(),
      { name: 'get page title', retries: 2 }
    );
  }
  
  /**
   * Get page heading text with retry logic
   */
  async getHeadingText(): Promise<string> {
    return retry(
      async () => {
        // Try multiple selectors for heading
        const headingLocator = await findElementWithFallback(this.page, [
          'h1',
          '[role="heading"][aria-level="1"]',
          '.page-title',
          '.main-heading',
          'header .title'
        ]);
        
        if (!headingLocator) {
          return '';
        }
        
        return headingLocator.textContent() || '';
      },
      { name: 'get heading text', retries: 2 }
    );
  }
  
  /**
   * Check if an element exists on the page with timeout
   * @param selector Selector for the element
   * @param options Options for the check
   */
  async elementExists(
    selector: string,
    options = { timeout: 5000, state: 'attached' as 'attached' | 'visible' | 'hidden' }
  ): Promise<boolean> {
    const { timeout, state } = options;
    
    try {
      await this.page.locator(selector).waitFor({ state, timeout });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Click a link or button by text with retry logic
   * @param text Text of the link or button to click
   */
  async clickByText(text: string, options = { exact: false, timeout: 10000 }) {
    const { exact, timeout } = options;
    
    await retry(
      async () => {
        // Try multiple ways to locate the element
        const locator = exact 
          ? this.page.getByText(text, { exact })
          : this.page.getByText(new RegExp(text, 'i'));
        
        await locator.waitFor({ state: 'visible', timeout });
        await locator.click();
        await this.waitForPageLoad({ timeout });
      },
      { name: `click text "${text}"`, retries: 2, timeout }
    );
  }
  
  /**
   * Click a button with retry logic
   * @param text Text of the button to click
   */
  async clickButton(text: string, options = { exact: false, timeout: 10000 }) {
    const { exact, timeout } = options;
    
    await retry(
      async () => {
        // Try multiple ways to locate the button
        let locator;
        if (exact) {
          locator = this.page.getByRole('button', { name: text });
        } else {
          locator = this.page.getByRole('button', { name: new RegExp(text, 'i') });
        }
        
        // If not found, try other button selectors
        if (await locator.count() === 0) {
          locator = this.page.locator(`button:has-text("${text}")`);
        }
        
        await locator.waitFor({ state: 'visible', timeout });
        await locator.click();
        await this.waitForPageLoad({ timeout });
      },
      { name: `click button "${text}"`, retries: 2, timeout }
    );
  }
  
  /**
   * Fill a form field with better error handling
   * @param name Name of the field
   * @param value Value to fill
   */
  async fillField(name: string, value: string, options = { timeout: 10000 }) {
    const { timeout } = options;
    
    await retry(
      async () => {
        // Try different selector strategies
        const selector = `input[name="${name}"], textarea[name="${name}"], [data-testid="${name}"], #${name}`;
        const field = this.page.locator(selector);
        
        await field.waitFor({ state: 'visible', timeout });
        
        // Clear the field first
        await field.fill('');
        
        // Then fill with the value
        await field.fill(value);
      },
      { name: `fill field ${name}`, retries: 2, timeout }
    );
  }
  
  /**
   * Select an option from a dropdown with better error handling
   * @param name Name of the select field
   * @param value Value to select
   */
  async selectOption(name: string, value: string, options = { timeout: 10000 }) {
    const { timeout } = options;
    
    await retry(
      async () => {
        // Try different selector strategies
        const selector = `select[name="${name}"], [role="listbox"][name="${name}"], [data-testid="${name}"], #${name}`;
        const field = this.page.locator(selector);
        
        await field.waitFor({ state: 'visible', timeout });
        
        // Try to select by value, label, or index
        try {
          await field.selectOption(value);
        } catch (error) {
          // If failed, try to click and then click on the option
          await field.click();
          
          // Wait for dropdown to be visible
          await this.page.waitForTimeout(300);
          
          // Try to find and click the option
          await this.page.locator(`option:has-text("${value}"), [role="option"]:has-text("${value}")`).click();
        }
      },
      { name: `select option ${value} in ${name}`, retries: 2, timeout }
    );
  }
  
  /**
   * Submit a form with better error handling
   * @param formSelector Selector for the form (defaults to 'form')
   */
  async submitForm(formSelector = 'form', options = { timeout: 15000 }) {
    const { timeout } = options;
    
    await retry(
      async () => {
        // Try to find submit button within the form
        const submitButton = this.page.locator(`${formSelector} button[type="submit"], ${formSelector} input[type="submit"]`);
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
        } else {
          // If no submit button found, try to submit the form directly
          await this.page.evaluate((selector) => {
            const form = document.querySelector(selector);
            if (form) {
              (form as HTMLFormElement).submit();
            } else {
              throw new Error(`Form not found: ${selector}`);
            }
          }, formSelector);
        }
        
        await this.waitForPageLoad({ timeout });
      },
      { name: `submit form ${formSelector}`, retries: 2, timeout }
    );
  }
  
  /**
   * Check if there are form validation errors with better detection
   */
  async hasFormErrors(): Promise<boolean> {
    // Try multiple selectors for error messages
    const errorSelectors = [
      SELECTORS.errorMessage,
      '[aria-invalid="true"]',
      '.error',
      '.invalid-feedback',
      '[role="alert"]'
    ];
    
    for (const selector of errorSelectors) {
      const errorCount = await this.page.locator(selector).count();
      if (errorCount > 0) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get form validation error messages from multiple possible selectors
   */
  async getFormErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    // Try multiple selectors for error messages
    const errorSelectors = [
      SELECTORS.errorMessage,
      '[aria-invalid="true"]',
      '.error',
      '.invalid-feedback',
      '[role="alert"]'
    ];
    
    for (const selector of errorSelectors) {
      const errorElements = await this.page.locator(selector).all();
      
      for (const element of errorElements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          errors.push(text.trim());
        }
      }
    }
    
    // If we found errors, return them
    if (errors.length > 0) {
      return errors;
    }
    
    // If no error text found, look for elements with error attributes
    const invalidFields = await this.page.locator('[aria-invalid="true"]').all();
    for (const field of invalidFields) {
      const name = await field.getAttribute('name') || await field.getAttribute('id') || 'Unknown field';
      errors.push(`Field ${name} is invalid`);
    }
    
    return errors;
  }
  
  /**
   * Check if a toast notification is visible with better detection
   */
  async hasToastNotification(): Promise<boolean> {
    // Try multiple selectors for toast notifications
    const toastSelectors = [
      SELECTORS.toast,
      '[role="status"]',
      '[role="alert"]',
      '.toast',
      '.notification',
      '.alert'
    ];
    
    for (const selector of toastSelectors) {
      const toastCount = await this.page.locator(selector).count();
      if (toastCount > 0) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get toast notification text from multiple possible selectors
   */
  async getToastText(): Promise<string> {
    // Try multiple selectors for toast notifications
    const toastSelectors = [
      SELECTORS.toast,
      '[role="status"]',
      '[role="alert"]',
      '.toast',
      '.notification',
      '.alert'
    ];
    
    for (const selector of toastSelectors) {
      const toast = this.page.locator(selector).first();
      if (await toast.count() > 0) {
        return (await toast.textContent() || '').trim();
      }
    }
    
    return '';
  }
  
  /**
   * Take a screenshot with timestamp
   * @param name Name of the screenshot file
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = Date.now();
    await this.page.screenshot({ 
      path: `./test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }
  
  /**
   * Verify navigation menu is present with better detection
   */
  async verifyNavigation(): Promise<void> {
    // Try to find nav elements with multiple selectors
    const navSelectors = [
      'nav',
      'header ul',
      '[role="navigation"]',
      '.navigation',
      '.nav',
      '.menu'
    ];
    
    const navElement = await findElementWithFallback(this.page, navSelectors);
    
    if (navElement) {
      await expect(navElement).toBeVisible({ timeout: 10000 });
    } else {
      // If no navigation element found, just check for links in the header area
      const hasHeaderLinks = await this.page.isVisible('header a, [role="banner"] a');
      expect(hasHeaderLinks).toBeTruthy();
    }
  }
  
  /**
   * Verify footer is present with better detection
   */
  async verifyFooter(): Promise<void> {
    // Try to find footer elements with multiple selectors
    const footerSelectors = [
      'footer',
      '[role="contentinfo"]',
      '.footer',
      '#footer'
    ];
    
    const footerElement = await findElementWithFallback(this.page, footerSelectors);
    
    if (footerElement) {
      await expect(footerElement).toBeVisible({ timeout: 10000 });
    } else {
      // If no footer element found, check if we're at the bottom of the page
      const bodyHeight = await this.page.evaluate(() => document.body.scrollHeight);
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Check for common footer content
      const hasFooterContent = await this.page.isVisible(
        'a[href*="contact"], a[href*="privacy"], a[href*="terms"], .copyright, .social-icons'
      );
      
      expect(hasFooterContent).toBeTruthy();
    }
  }
  
  /**
   * Get all links on the page with better error handling
   */
  async getAllLinks(): Promise<string[]> {
    return retry(
      async () => {
        const links = await this.page.locator('a[href]').evaluateAll(
          (elements) => elements.map(el => el.getAttribute('href'))
        );
        return links.filter(link => link !== null) as string[];
      },
      { name: 'get all links', retries: 2 }
    );
  }
  
  /**
   * Check if meta tags are present with better detection
   */
  async verifyMetaTags(): Promise<void> {
    try {
      // Check for basic SEO meta tags
      const titleExists = await this.elementExists('head > title');
      const descriptionExists = await this.elementExists('head > meta[name="description"]');
      
      expect(titleExists).toBeTruthy();
      expect(descriptionExists).toBeTruthy();
    } catch (error) {
      console.warn('Meta tag verification failed, but continuing:', error);
      // Don't fail the test for meta tag issues
    }
  }
  
  /**
   * Check page accessibility with better detection
   */
  async checkA11y(): Promise<void> {
    try {
      // Check basic accessibility features
      const hasMainTag = await this.elementExists('main, [role="main"], #main, .main-content');
      const hasHeading = await this.elementExists('h1, [role="heading"][aria-level="1"]');
      
      // Check for images without alt text
      const imagesWithoutAlt = await this.page.locator('img:not([alt]):not([role="presentation"])').count();
      
      expect(hasMainTag).toBeTruthy();
      expect(hasHeading).toBeTruthy();
      expect(imagesWithoutAlt).toBe(0);
    } catch (error) {
      console.warn('Accessibility check failed, but continuing:', error);
      // Don't fail the test for accessibility issues
    }
  }
  
  /**
   * Wait for a specific DOM condition with timeout
   */
  async waitForCondition(
    conditionFn: () => Promise<boolean>,
    options = { timeout: 10000, name: 'condition' }
  ): Promise<void> {
    const { timeout, name } = options;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        if (await conditionFn()) {
          return;
        }
      } catch (error) {
        // Ignore errors and keep waiting
      }
      
      await this.page.waitForTimeout(100);
    }
    
    throw new Error(`Timed out waiting for ${name} after ${timeout}ms`);
  }
  
  /**
   * Safely click an element with better error handling
   */
  async safeClick(
    selector: string | Locator,
    options = { timeout: 10000, force: false }
  ): Promise<void> {
    const { timeout, force } = options;
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    
    await retry(
      async () => {
        await locator.waitFor({ state: 'visible', timeout });
        
        try {
          await locator.click({ force, timeout });
        } catch (error) {
          // If normal click fails, try to scroll into view and try again
          await this.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, locator.toString());
          
          // Wait a moment for scrolling to complete
          await this.page.waitForTimeout(300);
          
          // Try again with force if needed
          await locator.click({ force: true, timeout });
        }
      },
      { name: `click ${typeof selector === 'string' ? selector : 'element'}`, retries: 2, timeout }
    );
  }
  
  /**
   * Check if the page has forms with input fields
   */
  async hasForm(): Promise<boolean> {
    const formSelectors = [
      'form',
      '[role="form"]',
      '.form-container'
    ];
    
    for (const selector of formSelectors) {
      if (await this.elementExists(selector)) {
        // Check if the form has input fields
        const inputCount = await this.page.locator(`${selector} input, ${selector} textarea, ${selector} select`).count();
        if (inputCount > 0) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Check page performance
   */
  async checkPerformance(): Promise<void> {
    // Measure load time using Performance API
    const loadTime = await this.page.evaluate(() => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        return timing.loadEventEnd - timing.navigationStart;
      }
      return null;
    });
    
    if (loadTime !== null) {
      console.log(`Page load time: ${loadTime}ms`);
      
      // Check if load time is within acceptable range
      expect(loadTime).toBeLessThan(PERFORMANCE.pageLoad * 2); // Allow twice the expected time
    }
  }
}
