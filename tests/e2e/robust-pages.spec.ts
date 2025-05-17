/**
 * Robust tests for basic page functionality that will work
 * regardless of database setup or internal implementation details
 */
import { test, expect } from '@playwright/test';

// Pages to test with minimal expectations
const TEST_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/gallery', name: 'Gallery' },
  { path: '/services', name: 'Services' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/booking', name: 'Booking' },
];

for (const { path, name } of TEST_PAGES) {
  test(`${name} page loads and has content`, async ({ page }) => {
    // Navigate directly to the page
    await page.goto(path, { timeout: 60000 });
    
    console.log(`Loaded ${name} page URL:`, page.url());
    
    // Wait for body to be available
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: `test-results/${name.toLowerCase()}-page.png`, fullPage: true });
    
    // Check for basic content
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`${name} page text length:`, bodyText.length);
    
    // Success if any text content is found
    expect(bodyText.length).toBeGreaterThan(0);
    
    // Check if page contains any images
    const imageCount = await page.locator('img').count();
    console.log(`${name} page has ${imageCount} images`);
    
    // Check if page contains any links
    const linkCount = await page.locator('a').count();
    console.log(`${name} page has ${linkCount} links`);
  });
}

// Test that navigation between pages works
test('navigation between pages works', async ({ page }) => {
  // Start at home page
  await page.goto('/', { timeout: 60000 });
  await page.waitForSelector('body', { timeout: 30000 });
  
  // Find all navigation links
  const navLinks = await page.evaluate(() => {
    // Find links in common navigation areas
    const links = Array.from(document.querySelectorAll('nav a, header a'));
    
    // Get the internal (non-external) links
    return links
      .map(link => link.getAttribute('href'))
      .filter(href => href && !href.startsWith('http') && !href.startsWith('#'))
      .slice(0, 3); // Limit to first 3 links to keep test fast
  });
  
  console.log('Found navigation links:', navLinks);
  
  // Test each navigation link
  for (const href of navLinks) {
    console.log(`Testing navigation to ${href}`);
    
    // Click the link
    await page.click(`a[href="${href}"]`);
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Verify we navigated to the expected page
    expect(page.url()).toContain(href);
    
    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }
});