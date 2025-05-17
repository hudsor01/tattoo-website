import { test, expect } from '@playwright/test';

// Basic site functionality test
test('should navigate to main pages and verify critical elements', async ({ page }) => {
  // Visit the homepage
  await test.step('Visit homepage', async () => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Tattoo/);
    
    // Check for critical elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: /gallery|about|contact/i })).toBeVisible();
  });

  // Visit the gallery page
  await test.step('Navigate to gallery', async () => {
    await page.getByRole('link', { name: /gallery/i }).click();
    await expect(page).toHaveURL(/.*gallery/);
    
    // Check for gallery elements
    await expect(page.getByRole('heading')).toBeVisible();
  });

  // Visit the contact page
  await test.step('Navigate to contact', async () => {
    await page.getByRole('link', { name: /contact/i }).click();
    await expect(page).toHaveURL(/.*contact/);
    
    // Check for contact form
    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  // Visit the booking page
  await test.step('Navigate to booking', async () => {
    await page.getByRole('link', { name: /booking/i }).click();
    await expect(page).toHaveURL(/.*booking/);
    
    // Check for booking form elements
    await expect(page.getByText(/book.*consultation/i)).toBeVisible();
  });
});