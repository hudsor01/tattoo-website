import { test, expect } from '@playwright/test';

/**
 * Absolute minimal test to verify that the app loads
 */
test('app loads successfully', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');
  
  // Just verify we get a page with a body
  await expect(page.locator('body')).toBeVisible();
  
  // And that the title includes our site name
  await expect(page).toHaveTitle(/Ink 37/i);
});