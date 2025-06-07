import { test, expect } from '@playwright/test';

test.describe('Admin Appointments Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.route('/api/auth/**', async route => {
      if (route.request().url().includes('session')) {
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
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock appointments API
    await page.route('/api/admin/appointments', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1-555-0123',
            preferredDate: '2024-01-15T10:00:00Z',
            tattooType: 'Traditional',
            status: 'pending',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1-555-0124',
            preferredDate: '2024-01-20T14:00:00Z',
            tattooType: 'Realism',
            status: 'confirmed',
            createdAt: '2024-01-02T10:00:00Z',
            updatedAt: '2024-01-02T10:00:00Z'
          }
        ])
      });
    });
  });

  test('should display appointments page with header', async ({ page }) => {
    await page.goto('/admin-dashboard/appointments');
    
    // Check page header
    await expect(page.locator('h1')).toContainText('Appointments');
    await expect(page.getByText('Manage customer bookings and appointments')).toBeVisible();
    
    // Check for "New Appointment" button
    await expect(page.getByRole('button', { name: /new appointment/i })).toBeVisible();
  });

  test('should display appointments list', async ({ page }) => {
    await page.goto('/admin-dashboard/appointments');
    
    // Wait for appointments to load
    await expect(page.getByText('Recent Bookings')).toBeVisible();
    await expect(page.getByText('Latest booking requests from customers')).toBeVisible();
    
    // Check for appointment items
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('jane.smith@example.com')).toBeVisible();
    await expect(page.getByText('Traditional')).toBeVisible();
    await expect(page.getByText('Realism')).toBeVisible();
    
    // Check status badges
    await expect(page.getByText('pending')).toBeVisible();
    await expect(page.getByText('confirmed')).toBeVisible();
  });

  test('should handle empty appointments list', async ({ page }) => {
    // Mock empty appointments response
    await page.route('/api/admin/appointments', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/admin-dashboard/appointments');
    
    // Should show empty state
    await expect(page.getByText('No appointments yet')).toBeVisible();
    await expect(page.getByText('New booking requests will appear here')).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Mock slow API response
    await page.route('/api/admin/appointments', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/admin-dashboard/appointments');
    
    // Should show loading animation
    await expect(page.getByText('Loading appointments...').or(page.locator('.animate-pulse'))).toBeVisible();
  });

  test('should handle API errors', async ({ page }) => {
    // Mock API error
    await page.route('/api/admin/appointments', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin-dashboard/appointments');
    
    // Should show error message
    await expect(page.getByText('Failed to load appointments')).toBeVisible();
  });

  test('should have functional appointment actions', async ({ page }) => {
    await page.goto('/admin-dashboard/appointments');
    
    // Wait for appointments to load
    await expect(page.getByText('John Doe')).toBeVisible();
    
    // Check for action buttons (eye icon for view)
    const viewButtons = page.locator('button[title="View details"]').or(page.locator('button:has(svg)'));
    await expect(viewButtons.first()).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/admin-dashboard/appointments');
    
    // Page should still be functional on mobile
    await expect(page.locator('h1')).toContainText('Appointments');
    await expect(page.getByText('John Doe')).toBeVisible();
  });

  test('should maintain sidebar navigation', async ({ page }) => {
    await page.goto('/admin-dashboard/appointments');
    
    // Should have sidebar present
    const sidebar = page.locator('[data-testid="sidebar"]').or(page.locator('nav')).or(page.locator('.sidebar'));
    if (await sidebar.first().isVisible()) {
      // Should be able to navigate back to dashboard
      const dashboardLink = page.getByRole('link', { name: /dashboard/i });
      if (await dashboardLink.isVisible()) {
        await dashboardLink.click();
        await expect(page).toHaveURL('/admin-dashboard');
      }
    }
  });
});