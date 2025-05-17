/**
 * Ultra-minimal test that only verifies URLs are reachable
 * This test ignores page content and visual elements, just checking HTTP status
 */
import { test, expect } from '@playwright/test';

// Just check if URLs return any response (even errors)
const URLS = [
  '/',
  '/gallery',
  '/services',
  '/about',
  '/contact',
  '/booking'
];

for (const url of URLS) {
  test(`URL ${url} returns a response`, async ({ page }) => {
    // Navigate with minimal expectations
    const response = await page.goto(url, { 
      timeout: 30000,
      waitUntil: 'domcontentloaded' // Use minimal wait strategy
    });
    
    // Log the response status
    console.log(`URL ${url} returned status: ${response?.status()}`);
    
    // Take a screenshot regardless of status code
    await page.screenshot({ 
      path: `test-results/url-${url.replace(/\//g, '-') || 'home'}.png`,
      fullPage: false,
      timeout: 5000
    }).catch(e => console.log(`Screenshot failed: ${e.message}`));
    
    // Just verify we got some response, even if it's an error
    expect(response).not.toBeNull();
  });
}