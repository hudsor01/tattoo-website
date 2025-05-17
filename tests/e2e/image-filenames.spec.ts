import { test, expect } from '@playwright/test';

// Make this simple test just check that the website loads correctly
test.describe('Basic Functionality Tests', () => {
  test('website loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for a reasonable amount of time for content to load
    await page.waitForTimeout(2000);
    
    // Make sure the page title is non-empty
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Verify that the page loaded (by checking for basic HTML elements)
    const bodyExists = await page.$('body');
    expect(bodyExists).not.toBeNull();
    
    console.log(`Page loaded with title: ${title}`);
  });
});