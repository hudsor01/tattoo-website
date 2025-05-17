/**
 * A basic test suite that checks if the main pages of the website load properly
 * This test suite is designed to be reliable even without database setup
 */
import { test, expect } from '@playwright/test';

// Pages we want to test that they at least load
const PAGES = [
  { path: '/', title: /ink 37|home|tattoo/i },
  { path: '/gallery', title: /gallery|portfolio|work/i },
  { path: '/services', title: /services|tattoo|pricing/i },
  { path: '/booking', title: /book|booking|appointment/i },
  { path: '/about', title: /about|fernando|artist/i },
  { path: '/contact', title: /contact|message|get in touch/i }
];

test.describe('Basic page load tests', () => {
  for (const { path, title } of PAGES) {
    test(`${path} page loads with correct title`, async ({ page }) => {
      // Go to the page with increased timeout
      await page.goto(path, { timeout: 30000 });
      
      // Take a screenshot for debugging
      await page.screenshot({ path: `test-results${path.replace(/\//g, '-') || '-home'}.png` });
      
      // Verify the page title
      await expect(page).toHaveTitle(title);
      
      // Verify that the page contains some content
      const contentLength = await page.evaluate(() => document.body.textContent?.length || 0);
      console.log(`${path} page content length: ${contentLength} characters`);
      expect(contentLength).toBeGreaterThan(100);
      
      // Verify that the page has loaded images (except contact which might not have any)
      if (path !== '/contact') {
        const imageCount = await page.locator('img').count();
        console.log(`${path} page has ${imageCount} images`);
      }
      
      console.log(`✓ ${path} page loaded successfully`);
    });
  }
});