import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to sign-in page (Clerk)
  await page.goto('/sign-in');
  
  // Wait for Clerk's sign-in form to load
  await page.waitForSelector('input[name="identifier"]', { timeout: 15000 });
  
  // Fill in login credentials using environment variables
  const email = process.env.TEST_ADMIN_EMAIL || 'test-admin@tattoowebsite.com';
  const password = process.env.TEST_ADMIN_PASSWORD || 'TestAdmin123!';
  
  // Fill email/identifier field
  await page.fill('input[name="identifier"]', email);
  
  // Click continue to go to password step
  await page.click('button:has-text("Continue")');
  
  // Wait a moment for the form to transition
  await page.waitForTimeout(2000);
  
  // Wait for password field and ensure it's enabled
  await page.waitForSelector('input[name="password"]:not([disabled])', { timeout: 10000 });
  
  // Fill password field
  await page.fill('input[name="password"]', password);
  
  // Click sign in button
  await page.click('button:has-text("Continue")');
  
  // Wait for successful login and redirect to admin
  await page.waitForURL('/admin', { timeout: 15000 });
  
  // Verify we're logged in by checking for admin content or navigation
  await expect(page.locator('nav, h1, h2, [data-testid="admin-dashboard"], text=Admin')).toBeVisible({ timeout: 10000 });
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});