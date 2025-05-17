import { test, expect } from '@playwright/test';

/**
 * Quick minimal test that should always pass
 * This test only checks if the homepage loads
 */
test.describe('Smoke Test', () => {
  test('should load the homepage correctly', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Simple check for page title
    const title = await page.title();
    expect(title).toContain('Ink 37');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Verify basic elements are present
    const header = page.locator('header');
    const footer = page.locator('footer');
    
    // These checks are very basic and should pass even if styling is off
    await expect(header).toBeVisible();
    await expect(footer).toBeVisible();
    
    // Take a screenshot for visual reference
    await page.screenshot({ path: 'test-results/homepage.png' });
    
    // Test passed if we reached this point
    console.log('Homepage loaded successfully');
  });
});