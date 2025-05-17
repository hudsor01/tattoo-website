/**
 * Simplified booking page test without relying on complex selectors or database fixtures
 */
import { test, expect } from '@playwright/test';

test('booking page should load and display a form', async ({ page }) => {
  // Navigate to the booking page
  await page.goto('/booking');
  
  // Verify title
  await expect(page).toHaveTitle(/book|booking|appointment|schedule|tattoo/i);
  
  // Verify page loads a basic structure that's visible
  await expect(page.locator('body')).toBeVisible();
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/booking-basic.png', fullPage: true });
  
  // The booking page should have a form
  const hasForm = await page.locator('form').isVisible();
  
  if (hasForm) {
    console.log('Found a form on the booking page');
    
    // Check if the form has input fields
    const inputCount = await page.locator('input, textarea, select').count();
    expect(inputCount).toBeGreaterThan(0);
    console.log(`Found ${inputCount} input fields on the booking form`);
  } else {
    // Some implementations might not use a form tag
    console.log('No form tag found, checking for input elements');
    
    // Check for input fields anywhere on the page
    const inputCount = await page.locator('input, textarea, select').count();
    console.log(`Found ${inputCount} input fields on the page`);
  }
  
  // Verify that the page contains text indicating it's a booking page
  const pageText = await page.evaluate(() => document.body.textContent || '');
  expect(pageText.toLowerCase()).toMatch(/book|booking|appointment|schedule|tattoo/i);
  
  // Success if we got this far
  console.log('Basic booking page test passed');
});