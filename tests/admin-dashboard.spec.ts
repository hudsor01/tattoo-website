import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication for all tests
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

    // Mock dashboard stats API
    await page.route('/api/admin/analytics/dashboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalAppointments: 156,
          appointmentsThisMonth: 23,
          totalCustomers: 89,
          newCustomersThisMonth: 12,
          totalRevenue: 15420,
          revenueThisMonth: 3240,
          averageTicket: 173,
          growthRate: 12.5
        })
      });
    });

    // Mock recent activity API
    await page.route('/api/admin/analytics/activity', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'booking',
            title: 'New appointment booked',
            description: 'John Doe scheduled a consultation for Jan 15',
            timestamp: new Date().toISOString(),
            user: { name: 'John Doe', email: 'john@example.com' }
          },
          {
            id: '2',
            type: 'payment',
            title: 'Payment received',
            description: '$250 payment for sleeve tattoo',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: { name: 'Jane Smith', email: 'jane@example.com' }
          }
        ])
      });
    });
  });

  test('should display dashboard with key metrics', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Check page title and description
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.getByText('Welcome back! Here\'s what\'s happening at Ink 37.')).toBeVisible();
    
    // Check for stats cards
    await expect(page.getByText('Total Appointments')).toBeVisible();
    await expect(page.getByText('Total Customers')).toBeVisible();
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Growth Rate')).toBeVisible();
    
    // Check for stats values
    await expect(page.getByText('156')).toBeVisible(); // Total appointments
    await expect(page.getByText('89')).toBeVisible(); // Total customers
    await expect(page.getByText('$15,420')).toBeVisible(); // Total revenue
    await expect(page.getByText('+12.5%')).toBeVisible(); // Growth rate
  });

  test('should display recent activity', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Check recent activity section
    await expect(page.getByText('Recent Activity')).toBeVisible();
    await expect(page.getByText('Latest bookings, payments, and system activity')).toBeVisible();
    
    // Check for activity items
    await expect(page.getByText('New appointment booked')).toBeVisible();
    await expect(page.getByText('Payment received')).toBeVisible();
    await expect(page.getByText('John Doe scheduled a consultation')).toBeVisible();
    await expect(page.getByText('$250 payment for sleeve tattoo')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Check quick actions section
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByText('Common admin tasks and shortcuts')).toBeVisible();
    
    // Check for action buttons
    await expect(page.getByText('New Appointment')).toBeVisible();
    await expect(page.getByText('Add Customer')).toBeVisible();
    await expect(page.getByText('Upload Gallery')).toBeVisible();
    await expect(page.getByText('View Analytics')).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    await page.goto('/admin-dashboard');
    
    // Check if sidebar is present
    await expect(page.locator('[data-testid="sidebar"]').or(page.locator('.sidebar')).or(page.locator('nav'))).toBeVisible();
    
    // Test navigation links if present
    const appointmentsLink = page.getByRole('link', { name: /appointments/i });
    const customersLink = page.getByRole('link', { name: /customers/i });
    
    if (await appointmentsLink.isVisible()) {
      await appointmentsLink.click();
      await expect(page).toHaveURL('/admin-dashboard/appointments');
      await expect(page.locator('h1')).toContainText('Appointments');
    }
    
    if (await customersLink.isVisible()) {
      await customersLink.click();
      await expect(page).toHaveURL('/admin-dashboard/customers');
      await expect(page.locator('h1')).toContainText('Customers');
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('/api/admin/analytics/dashboard', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalAppointments: 156,
          appointmentsThisMonth: 23,
          totalCustomers: 89,
          newCustomersThisMonth: 12,
          totalRevenue: 15420,
          revenueThisMonth: 3240,
          averageTicket: 173,
          growthRate: 12.5
        })
      });
    });

    await page.goto('/admin-dashboard');
    
    // Should show loading skeletons
    await expect(page.locator('.animate-pulse')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/admin/analytics/dashboard', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin-dashboard');
    
    // Should show error message or default values
    await expect(page.getByText('Failed to load stats').or(page.getByText('0'))).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/admin-dashboard');
    
    // Check that content is still visible and accessible
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Stats cards should stack on mobile
    const statsCards = page.locator('[data-testid="stats-card"]').or(page.locator('.grid')).first();
    if (await statsCards.isVisible()) {
      const boundingBox = await statsCards.boundingBox();
      expect(boundingBox?.width).toBeLessThan(400);
    }
  });
});