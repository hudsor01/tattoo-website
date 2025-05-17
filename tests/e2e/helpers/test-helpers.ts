/**
 * Test helper functions for improving test reliability
 */
import { Page, Locator, expect, TestInfo } from '@playwright/test';
import { PERFORMANCE } from '../test-constants';

/**
 * Wait for element to be stable (not moving/changing)
 * Useful for waiting for animations to complete
 */
export async function waitForElementStable(locator: Locator, timeout = 5000): Promise<void> {
  const startTime = Date.now();
  let lastRect = await locator.boundingBox();
  
  while (Date.now() - startTime < timeout) {
    // Small delay between checks
    await new Promise(r => setTimeout(r, 100));
    
    // Get current position
    const currentRect = await locator.boundingBox();
    
    // Skip if element is not visible
    if (!currentRect || !lastRect) continue;
    
    // Check if position has stabilized
    if (
      Math.abs(currentRect.x - lastRect.x) < 2 &&
      Math.abs(currentRect.y - lastRect.y) < 2 &&
      Math.abs(currentRect.width - lastRect.width) < 2 &&
      Math.abs(currentRect.height - lastRect.height) < 2
    ) {
      return; // Element is stable
    }
    
    lastRect = currentRect;
  }
  
  throw new Error(`Element did not stabilize within ${timeout}ms`);
}

/**
 * Retry an operation until it succeeds or timeout is reached
 * @param operation Function to retry
 * @param options Retry options
 */
export async function retry<T>(
  operation: () => Promise<T>,
  {
    retries = 3,
    delay = 1000,
    timeout = 10000,
    name = 'operation'
  }: {
    retries?: number;
    delay?: number;
    timeout?: number;
    name?: string;
  } = {}
): Promise<T> {
  const startTime = Date.now();
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Timed out after ${timeout}ms while retrying ${name}`);
      }
      
      return await operation();
    } catch (error) {
      console.log(`Attempt ${attempt}/${retries} for ${name} failed: ${error}`);
      lastError = error as Error;
      
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  
  throw new Error(`Failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Wait for network to be idle with better error handling
 */
export async function waitForNetworkIdle(page: Page, timeout = 10000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (error) {
    console.log('Network did not become idle, continuing anyway:', error);
    // Continue anyway, as sometimes the network never becomes completely idle
  }
}

/**
 * Fill a form field with retry logic
 */
export async function fillFieldWithRetry(page: Page, selector: string, value: string): Promise<void> {
  await retry(
    async () => {
      const field = page.locator(selector);
      await field.waitFor({ state: 'visible', timeout: 5000 });
      await field.fill(''); // Clear first
      await field.fill(value);
      
      // Verify the value was set correctly
      const actualValue = await field.inputValue();
      if (actualValue !== value) {
        throw new Error(`Field value is "${actualValue}", expected "${value}"`);
      }
    },
    { name: `fill field ${selector}` }
  );
}

/**
 * Click with retry logic
 */
export async function clickWithRetry(
  page: Page,
  selector: string,
  options: { force?: boolean; timeout?: number } = {}
): Promise<void> {
  const { force = false, timeout = 5000 } = options;
  
  await retry(
    async () => {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible', timeout });
      await element.click({ force });
    },
    { name: `click ${selector}` }
  );
}

/**
 * Check if element exists, wait for it to be visible or hidden
 */
export async function elementExists(
  page: Page, 
  selector: string, 
  options: { state?: 'visible' | 'hidden' | 'attached'; timeout?: number } = {}
): Promise<boolean> {
  const { state = 'attached', timeout = 5000 } = options;
  
  try {
    await page.locator(selector).waitFor({ state, timeout });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Find element using multiple possible selectors
 * Useful when elements might be identified in different ways
 */
export async function findElementWithFallback(
  page: Page,
  selectors: string[],
  options: { state?: 'visible' | 'hidden' | 'attached'; timeout?: number } = {}
): Promise<Locator | null> {
  const { state = 'visible', timeout = 5000 } = options;
  
  for (const selector of selectors) {
    const locator = page.locator(selector);
    try {
      await locator.waitFor({ state, timeout: Math.min(timeout, 2000) });
      return locator; // Return the first matching locator
    } catch (error) {
      // Try the next selector
      continue;
    }
  }
  
  return null; // No matching element found
}

/**
 * Take named screenshot with test info
 */
export async function takeNamedScreenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await page.screenshot({ 
    path: `${testInfo.outputPath('screenshots')}/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Log performance metrics
 */
export async function logPerformance(page: Page, operation: string): Promise<void> {
  const timing = await page.evaluate(() => {
    return JSON.stringify(window.performance.timing);
  });
  
  console.log(`Performance timing for ${operation}:`, timing);
}

/**
 * Check if element contains text with retry
 */
export async function expectTextWithRetry(
  locator: Locator,
  text: string | RegExp,
  options: { timeout?: number; retries?: number } = {}
): Promise<void> {
  const { timeout = 5000, retries = 3 } = options;
  
  await retry(
    async () => {
      await expect(locator).toContainText(text, { timeout });
    },
    { name: `expect text ${text}`, retries, timeout }
  );
}

/**
 * Wait for a specific condition with timeout
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  {
    timeout = 10000,
    interval = 100,
    name = 'condition'
  }: {
    timeout?: number;
    interval?: number;
    name?: string;
  } = {}
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      if (await condition()) {
        return;
      }
    } catch (error) {
      // Ignore errors and continue waiting
    }
    
    await new Promise(r => setTimeout(r, interval));
  }
  
  throw new Error(`Timed out waiting for ${name} after ${timeout}ms`);
}

/**
 * Get all text content from the page that matches a pattern
 * Useful for debugging when elements can't be found
 */
export async function findAllTextInPage(page: Page, pattern: RegExp): Promise<string[]> {
  return page.evaluate((patternString) => {
    const pattern = new RegExp(patternString);
    const results: string[] = [];
    
    // Walk the DOM tree and find text nodes
    function walkTree(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() || '';
        if (text && pattern.test(text)) {
          results.push(text);
        }
      } else {
        for (const child of Array.from(node.childNodes)) {
          walkTree(child);
        }
      }
    }
    
    walkTree(document.body);
    return results;
  }, pattern.source);
}

/**
 * Safe navigation that handles errors and retries
 */
export async function safeNavigate(page: Page, url: string, options: { timeout?: number; retries?: number } = {}): Promise<void> {
  const { timeout = 30000, retries = 2 } = options;
  
  await retry(
    async () => {
      try {
        await page.goto(url, { timeout });
        await waitForNetworkIdle(page, Math.min(timeout, 10000));
      } catch (error) {
        console.error(`Navigation to ${url} failed, retrying:`, error);
        throw error;
      }
    },
    { name: `navigate to ${url}`, retries, timeout }
  );
}
