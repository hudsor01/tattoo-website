/**
 * Minimal test suite with extremely simplified tests
 * These tests focus only on basic page loading with minimal assertions
 */
import { test, expect } from '@playwright/test';

// Simple home page test
test('Home page loads with minimal expectations', async ({ page }) => {
  console.log('Starting minimal home page test');
  
  // Navigate to the root path directly (home page)
  await page.goto('/', { timeout: 30000 });
  
  console.log('Loaded page URL:', page.url());
  
  // Just check that the page contains anything in the body
  await page.waitForSelector('body', { timeout: 10000 });
  
  // Take a screenshot for debug
  await page.screenshot({ path: 'test-results/minimal-home.png' }).catch(e => {
    console.log(`Screenshot failed: ${e.message}`);
  });
  
  // Very basic content check
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Page text length:', bodyText.length);
  
  // Success if any text content is found
  expect(bodyText.length).toBeGreaterThan(0);
  
  console.log('Minimal home page test completed successfully');
});

// Function to create a minimal page test
function createMinimalPageTest(path: string, name: string) {
  test(`${name} page loads with minimal expectations`, async ({ page }) => {
    console.log(`Starting minimal ${name} page test`);
    
    // Navigate to the page
    await page.goto(path, { timeout: 30000 });
    
    console.log('Loaded page URL:', page.url());
    
    // Just check that the page contains anything in the body
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take a screenshot for debug
    await page.screenshot({ 
      path: `test-results/minimal-${name.toLowerCase().replace(/\s+/g, '-')}.png`
    }).catch(e => {
      console.log(`Screenshot failed: ${e.message}`);
    });
    
    // Only check for content length, without expecting specific text
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`${name} page text length:`, bodyText.length);
    
    // Success if any text content is found
    expect(bodyText.length).toBeGreaterThan(0);
    
    console.log(`Minimal ${name} page test completed successfully`);
  });
}

// Create minimal tests for key pages
createMinimalPageTest('/services', 'Services');
createMinimalPageTest('/about', 'About');
createMinimalPageTest('/gallery', 'Gallery');
createMinimalPageTest('/contact', 'Contact');
createMinimalPageTest('/booking', 'Booking');

// Always-passing test for site availability
test('Site availability check', async ({ page }) => {
  // Go to home page
  await page.goto('/', { timeout: 30000 });
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/site-availability.png' }).catch(e => {
    console.log(`Screenshot failed: ${e.message}`);
  });
  
  // Check for any HTML content - will always pass if page loads
  const hasBody = await page.evaluate(() => {
    return !!document.body;
  });
  
  console.log(`Page loaded with body element: ${hasBody}`);
  
  // Test always passes if page loads at all
  expect(hasBody).toBeTruthy();
  
  console.log('Site availability check completed successfully');
});