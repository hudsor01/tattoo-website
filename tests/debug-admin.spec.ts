import { test } from '@playwright/test';

test.describe('Debug Admin Dashboard', () => {
  test('should inspect what renders on /admin without auth', async ({ page }) => {
    await page.goto('/admin');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Log the current URL
    console.log('Current URL:', page.url());
    
    // Log the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Log any h1 elements
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('H1 elements:', h1Elements);
    
    // Log any error messages
    const errorElements = await page.locator('[data-testid="error"], .error, [class*="error"]').allTextContents();
    console.log('Error elements:', errorElements);
    
    // Log if we're on unauthorized page
    const unauthorizedContent = await page.locator('text=Access Denied').isVisible();
    console.log('Is unauthorized page visible:', unauthorizedContent);
    
    // Log the page HTML (first 1000 chars)
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML (first 1000 chars):', bodyHTML.substring(0, 1000));
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-admin-no-auth.png', fullPage: true });
  });

  test('should inspect what renders on /admin-dashboard directly', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Log the current URL
    console.log('Current URL (direct):', page.url());
    
    // Log the page title
    const title = await page.title();
    console.log('Page title (direct):', title);
    
    // Log any h1 elements
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('H1 elements (direct):', h1Elements);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-admin-dashboard-direct.png', fullPage: true });
  });
});