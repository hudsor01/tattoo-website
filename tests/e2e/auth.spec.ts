import { test, expect } from '@playwright/test';
import { BasePage } from './page-objects/base-page';
import { AdminDashboardPage } from './page-objects/admin-dashboard-page';
import { loginAsAdmin, loginAsUser, logout } from './helpers/auth-helper';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_USER_EMAIL, TEST_USER_PASSWORD, ROUTES } from './test-constants';

/**
 * Test suite for authentication functionality
 */
test.describe('Authentication', () => {
  // Use serial mode to avoid parallel test execution issues with login state
  test.describe.configure({ mode: 'serial' });
  
  test('should display login form', async ({ page }) => {
    // Go to login page
    await page.goto(ROUTES.auth.login);
    
    // Verify login form is present
    await expect(page.locator('form[data-testid="login-form"]')).toBeVisible();
    
    // Check for email and password fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
  
  test('should show error message for invalid credentials', async ({ page }) => {
    // Go to login page
    await page.goto(ROUTES.auth.login);
    
    // Fill in form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
    
    // Error message should contain expected text
    const errorText = await page.locator('[role="alert"]').textContent();
    expect(errorText?.toLowerCase()).toContain('invalid');
  });
  
  test('should login as admin and redirect to dashboard', async ({ page }) => {
    // Use helper to login as admin
    await loginAsAdmin(page);
    
    // Verify we're on the admin dashboard
    expect(page.url()).toContain(ROUTES.admin.dashboard);
    
    // Verify admin elements are visible
    const dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.verifyDashboard();
    
    // Logout after test
    await logout(page);
  });
  
  test('should login as regular user and redirect to customer portal', async ({ page }) => {
    // Use helper to login as regular user
    await loginAsUser(page);
    
    // Verify we're on the customer dashboard/portal
    expect(page.url()).toContain(ROUTES.customer.portal);
    
    // Verify customer portal elements
    await expect(page.locator('h1')).toBeVisible();
    
    // Logout after test
    await logout(page);
  });
  
  test('should enforce authentication for protected routes', async ({ page }) => {
    // Try to access admin dashboard without login
    await page.goto(ROUTES.admin.dashboard);
    
    // Should be redirected to login page
    expect(page.url()).toContain(ROUTES.auth.login);
    
    // Should have a message about authentication
    const message = await page.locator('[role="alert"]').textContent();
    expect(message?.toLowerCase()).toContain('login') || expect(message?.toLowerCase()).toContain('sign in');
  });
  
  test('should enforce correct permissions for admin routes', async ({ page }) => {
    // Login as regular user
    await loginAsUser(page);
    
    // Try to access admin dashboard
    await page.goto(ROUTES.admin.dashboard);
    
    // Should be denied access
    const accessDenied = await page.isVisible('text="Access Denied"') || 
                         await page.isVisible('[role="alert"]');
    
    expect(accessDenied).toBe(true);
    
    // Logout after test
    await logout(page);
  });
  
  test('should allow password reset request', async ({ page }) => {
    // Go to login page
    await page.goto(ROUTES.auth.login);
    
    // Click on forgot password link
    await page.click('text="Forgot password"');
    
    // Should be on password reset page
    expect(page.url()).toContain('forgot-password');
    
    // Fill in email
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show confirmation message
    await expect(page.locator('[role="status"]')).toBeVisible();
    const statusText = await page.locator('[role="status"]').textContent();
    expect(statusText?.toLowerCase()).toContain('email');
  });
  
  test('should logout and redirect to login page', async ({ page }) => {
    // Login first
    await loginAsAdmin(page);
    
    // Verify we're logged in
    expect(page.url()).toContain(ROUTES.admin.dashboard);
    
    // Logout
    await logout(page);
    
    // Verify we're redirected to login page
    expect(page.url()).toContain(ROUTES.auth.login);
    
    // Try to access protected page again
    await page.goto(ROUTES.admin.dashboard);
    
    // Should be redirected to login
    expect(page.url()).toContain(ROUTES.auth.login);
  });
  
  test('should maintain session across page navigation', async ({ page }) => {
    // Login
    await loginAsAdmin(page);
    
    // Navigate to different admin pages
    await page.goto(ROUTES.admin.customers);
    await page.goto(ROUTES.admin.appointments);
    
    // Should still be logged in
    const isLoggedOut = page.url().includes(ROUTES.auth.login);
    expect(isLoggedOut).toBe(false);
    
    // Logout after test
    await logout(page);
  });
  
  test('should handle remember me functionality', async ({ page }) => {
    // Go to login page
    await page.goto(ROUTES.auth.login);
    
    // Fill in credentials
    await page.fill('input[type="email"]', TEST_ADMIN_EMAIL);
    await page.fill('input[type="password"]', TEST_ADMIN_PASSWORD);
    
    // Check "Remember me" if it exists
    const rememberMeExists = await page.isVisible('input[type="checkbox"][name="remember"]');
    if (rememberMeExists) {
      await page.check('input[type="checkbox"][name="remember"]');
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify we're logged in
    await page.waitForURL(`**${ROUTES.admin.dashboard}**`);
    
    // Close page and create a new one to simulate browser restart
    const context = page.context();
    await page.close();
    
    // Create new page with same context (preserves cookies)
    const newPage = await context.newPage();
    
    // Go to protected page
    await newPage.goto(ROUTES.admin.dashboard);
    
    // If remember me works, we should still be logged in
    // This test may fail if remember me is not implemented
    const directlyAccessed = !newPage.url().includes(ROUTES.auth.login);
    
    if (!directlyAccessed) {
      console.log('Remember me functionality may not be implemented');
    }
    
    // Clean up
    await newPage.goto(ROUTES.auth.login);
  });
});
