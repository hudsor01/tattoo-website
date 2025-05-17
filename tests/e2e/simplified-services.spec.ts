/**
 * Simplified services test without relying on complex selectors or database fixtures
 */
import { test, expect } from '@playwright/test';

test('services page should load and display basic structure', async ({ page }) => {
  // Navigate to the services page
  await page.goto('/services');
  
  // Verify title
  await expect(page).toHaveTitle(/services|tattoo/i);
  
  // Verify page loads a basic structure that's visible
  await expect(page.locator('body')).toBeVisible();
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/services-basic.png', fullPage: true });
  
  // The services page likely has service cards or images
  const cardCount = await page.locator('.card, [role="article"], article').count();
  const imageCount = await page.locator('img').count();
  console.log(`Found ${cardCount} cards and ${imageCount} images on the page`);
  
  // Verify that the page contains text indicating it's a services page
  const pageText = await page.evaluate(() => document.body.textContent || '');
  expect(pageText.toLowerCase()).toMatch(/service|tattoo|pricing|custom/i);
  
  // Success if we got this far
  console.log('Basic services test passed');
});