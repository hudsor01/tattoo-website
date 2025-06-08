import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the admin dashboard using the rewrite URL
    await page.goto('/admin');
  });

  test('should redirect unauthenticated users to unauthorized page', async ({ page }) => {
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Should be redirected since no authentication
    await expect(page).toHaveURL('/unauthorized');
    
    // Check unauthorized page content
    await expect(page.locator('h1')).toContainText('Access Denied');
  });

  test('should allow access for admin users', async ({ page }) => {
    // Mock admin authentication - Better Auth uses session endpoint
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'admin-1',
            email: 'admin@ink37tattoos.com',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User'
          },
          session: {
            id: 'session-1',
            userId: 'admin-1',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      });
    });

    // Navigate to admin dashboard
    await page.goto('/admin');
    
    // Should stay on admin dashboard
    await expect(page).toHaveURL('/admin');
    
    // Check for admin dashboard content
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.getByText('Welcome back! Here\'s what\'s happening at Ink 37.')).toBeVisible();
  });

  test('should block non-admin users', async ({ page }) => {
    // Mock regular user authentication
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-1',
            email: 'user@example.com',
            role: 'user',
            firstName: 'Regular',
            lastName: 'User'
          },
          session: {
            id: 'session-2',
            userId: 'user-1',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      });
    });

    // Try to access admin dashboard
    await page.goto('/admin');
    
    // Wait for redirect
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to unauthorized
    await expect(page).toHaveURL('/unauthorized');
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock authentication error
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin');
    
    // Wait for redirect
    await page.waitForLoadState('networkidle');
    
    // Should redirect to unauthorized on auth error
    await expect(page).toHaveURL('/unauthorized');
  });
});