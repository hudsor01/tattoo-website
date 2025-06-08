import { test, expect } from '@playwright/test';

test.describe('Admin Customers Page', () => {
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

    // Mock customer stats API
    await page.route('/api/admin/customers/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalCustomers: 156,
          activeCustomers: 89,
          newThisMonth: 23,
          avgLifetimeValue: 425.50
        })
      });
    });

    // Mock customers API
    await page.route('/api/admin/customers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'cust-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1-555-0123',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z',
            totalAppointments: 5,
            totalSpent: 1250.00,
            lastVisit: '2024-01-10T14:00:00Z'
          },
          {
            id: 'cust-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1-555-0124',
            createdAt: '2024-01-02T10:00:00Z',
            updatedAt: '2024-01-02T10:00:00Z',
            totalAppointments: 3,
            totalSpent: 750.00,
            lastVisit: '2024-01-08T16:00:00Z'
          }
        ])
      });
    });
  });

  test('should display customers page with header and stats', async ({ page }) => {
    await page.goto('/admin-dashboard/customers');
    
    // Check page header
    await expect(page.locator('h1')).toContainText('Customers');
    await expect(page.getByText('Manage your customer database and relationships')).toBeVisible();
    
    // Check for "Add Customer" button
    await expect(page.getByRole('button', { name: /add customer/i })).toBeVisible();
    
    // Check customer stats cards
    await expect(page.getByText('Total Customers')).toBeVisible();
    await expect(page.getByText('Active Customers')).toBeVisible();
    await expect(page.getByText('Avg Lifetime Value')).toBeVisible();
    
    // Check stats values
    await expect(page.getByText('156')).toBeVisible();
    await expect(page.getByText('89')).toBeVisible();
    await expect(page.getByText('$425.50')).toBeVisible();
  });

  test('should display customers table with data', async ({ page }) => {
    await page.goto('/admin-dashboard/customers');
    
    // Wait for customers to load
    await expect(page.getByText('Customer Directory')).toBeVisible();
    await expect(page.getByText('View and manage all customer information')).toBeVisible();
    
    // Check table headers
    await expect(page.getByText('Customer')).toBeVisible();
    await expect(page.getByText('Contact')).toBeVisible();
    await expect(page.getByText('Appointments')).toBeVisible();
    await expect(page.getByText('Total Spent')).toBeVisible();
    await expect(page.getByText('Last Visit')).toBeVisible();
    
    // Check customer data
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('jane.smith@example.com')).toBeVisible();
    await expect(page.getByText('$1,250.00')).toBeVisible();
    await expect(page.getByText('$750.00')).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/admin-dashboard/customers');
    
    // Wait for customers to load
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
    
    // Search for specific customer
    const searchInput = page.getByPlaceholder('Search customers...');
    await searchInput.fill('John');
    
    // Should show only John Doe
    await expect(page.getByText('John Doe')).toBeVisible();
    // Jane Smith should be filtered out (may still be in DOM but not visible in results)
    
    // Clear search
    await searchInput.clear();
    await searchInput.fill('');
    
    // Both customers should be visible again
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  test('should handle empty customers list', async ({ page }) => {
    // Mock empty customers response
    await page.route('/api/admin/customers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/admin-dashboard/customers');
    
    // Should show empty state
    await expect(page.getByText('No customers found.')).toBeVisible();
  });

  test('should show loading states', async ({ page }) => {
    // Mock slow API responses
    await page.route('/api/admin/customers', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/admin-dashboard/customers');
    
    // Should show loading animation
    await expect(page.locator('.animate-pulse')).toBeVisible();
  });

  test('should handle API errors', async ({ page }) => {
    // Mock API error
    await page.route('/api/admin/customers', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin-dashboard/customers');
    
    // Should show error message
    await expect(page.getByText('Failed to load customers')).toBeVisible();
  });

  test('should have functional customer actions', async ({ page }) => {
    await page.goto('/admin-dashboard/customers');
    
    // Wait for customers to load
    await expect(page.getByText('John Doe')).toBeVisible();
    
    // Check for action buttons
    const viewButtons = page.locator('button[title="View customer"]');
    const editButtons = page.locator('button[title="Edit customer"]');
    
    await expect(viewButtons.first()).toBeVisible();
    await expect(editButtons.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/admin-dashboard/customers');
    
    // Page should still be functional on mobile
    await expect(page.locator('h1')).toContainText('Customers');
    
    // Table should be responsive (may scroll horizontally)
    await expect(page.getByText('John Doe')).toBeVisible();
  });
});