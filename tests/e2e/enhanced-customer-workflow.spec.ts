import { test, expect, Page } from '@playwright/test';

test.describe('Enhanced Customer Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin customers page
    await page.goto('/admin/customers');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for the customers list to be visible
    await expect(page.getByText('Customers')).toBeVisible();
  });

  test.describe('Customer Creation - Comprehensive Testing', () => {
    test('should create customer with all fields filled', async ({ page }) => {
      // Click the "Add Customer" button
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Wait for dialog to open
      await expect(page.getByText('Add New Customer')).toBeVisible();
      
      // Fill in all form fields
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('john.doe@test.com');
      await page.getByLabel('Phone').fill('(555) 123-4567');
      await page.getByLabel('Address').fill('123 Main Street');
      await page.getByLabel('City').fill('Dallas');
      await page.getByLabel('State').fill('TX');
      await page.getByLabel('ZIP').fill('75201');
      await page.getByLabel('Notes').fill('Test customer created via E2E test');
      
      // Intercept the API call
      const createCustomerPromise = page.waitForResponse(
        response => response.url().includes('/api/admin/customers') && 
                   response.request().method() === 'POST' &&
                   response.status() === 201
      );
      
      // Submit the form
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Wait for the API call to complete
      const response = await createCustomerPromise;
      
      // Verify the API call was successful
      expect(response.status()).toBe(201);
      
      // Check for success toast
      await expect(page.getByText('Customer created successfully')).toBeVisible();
      
      // Verify dialog closes
      await expect(page.getByText('Add New Customer')).not.toBeVisible();
      
      // Verify customer appears in the list
      await expect(page.getByText('John Doe')).toBeVisible();
      await expect(page.getByText('john.doe@test.com')).toBeVisible();
      
      // Verify customer count updated
      await expect(page.getByText(/Manage your customer database \(\d+ total\)/)).toBeVisible();
    });

    test('should create customer with only required fields', async ({ page }) => {
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Fill only required fields
      await page.getByLabel('First Name').fill('Jane');
      await page.getByLabel('Last Name').fill('Smith');
      await page.getByLabel('Email').fill('jane.smith@test.com');
      
      // Submit the form
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Check for success
      await expect(page.getByText('Customer created successfully')).toBeVisible();
      await expect(page.getByText('Jane Smith')).toBeVisible();
    });

    test('should validate required field - First Name', async ({ page }) => {
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Fill last name and email but not first name
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('test@example.com');
      
      // Try to submit
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show validation error
      await expect(page.getByText('First name is required')).toBeVisible();
      
      // Dialog should remain open
      await expect(page.getByText('Add New Customer')).toBeVisible();
    });

    test('should validate required field - Last Name', async ({ page }) => {
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Fill first name and email but not last name
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Email').fill('test@example.com');
      
      // Try to submit
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show validation error
      await expect(page.getByText('Last name is required')).toBeVisible();
    });

    test('should validate required field - Email', async ({ page }) => {
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Fill names but not email
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      
      // Try to submit
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show validation error
      await expect(page.getByText('Email is required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Fill form with invalid email
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('invalid-email-format');
      
      // Try to submit
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show email validation error
      await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    });

    test('should handle server error gracefully', async ({ page }) => {
      // Mock a server error response
      await page.route('**/api/admin/customers', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal server error' })
          });
        } else {
          route.continue();
        }
      });
      
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Fill valid form data
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('john.doe@test.com');
      
      // Submit form
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show error message
      await expect(page.getByText(/HTTP 500: Failed to create customer/)).toBeVisible();
    });

    test('should handle duplicate email error', async ({ page }) => {
      // Mock a conflict response
      await page.route('**/api/admin/customers', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'A client with this email already exists' })
          });
        } else {
          route.continue();
        }
      });
      
      await page.getByRole('button', { name: /add customer/i }).click();
      
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('existing@test.com');
      
      await page.getByRole('button', { name: /create customer/i }).click();
      
      await expect(page.getByText('A client with this email already exists')).toBeVisible();
    });

    test('should show loading state during creation', async ({ page }) => {
      // Mock a delayed response
      await page.route('**/api/admin/customers', async route => {
        if (route.request().method() === 'POST') {
          // Delay the response
          await page.waitForTimeout(1000);
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'test-id',
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          });
        } else {
          route.continue();
        }
      });
      
      await page.getByRole('button', { name: /add customer/i }).click();
      
      await page.getByLabel('First Name').fill('Test');
      await page.getByLabel('Last Name').fill('User');
      await page.getByLabel('Email').fill('test@example.com');
      
      // Submit form and immediately check for loading state
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show loading state
      await expect(page.getByText('Creating...')).toBeVisible();
      
      // Button should be disabled
      await expect(page.getByRole('button', { name: /creating/i })).toBeDisabled();
      
      // Eventually should succeed
      await expect(page.getByText('Customer created successfully')).toBeVisible();
    });

    test('should reset form after successful creation', async ({ page }) => {
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Fill form
      await page.getByLabel('First Name').fill('Reset');
      await page.getByLabel('Last Name').fill('Test');
      await page.getByLabel('Email').fill('reset@test.com');
      await page.getByLabel('Phone').fill('555-0000');
      
      // Submit
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Wait for success
      await expect(page.getByText('Customer created successfully')).toBeVisible();
      
      // Open dialog again
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Form should be reset
      await expect(page.getByLabel('First Name')).toHaveValue('');
      await expect(page.getByLabel('Last Name')).toHaveValue('');
      await expect(page.getByLabel('Email')).toHaveValue('');
      await expect(page.getByLabel('Phone')).toHaveValue('');
    });
  });

  test.describe('Customer Search and Filtering', () => {
    test.beforeEach(async ({ page }) => {
      // Create test customers first
      await createTestCustomer(page, {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@test.com',
        phone: '555-1111'
      });
      
      await createTestCustomer(page, {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@test.com',
        phone: '555-2222'
      });
      
      await createTestCustomer(page, {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.brown@test.com',
        phone: '555-3333'
      });
    });

    test('should search customers by first name', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search customers...');
      
      await searchInput.fill('Alice');
      
      // Should show only Alice
      await expect(page.getByText('Alice Johnson')).toBeVisible();
      await expect(page.getByText('Bob Smith')).not.toBeVisible();
      await expect(page.getByText('Charlie Brown')).not.toBeVisible();
    });

    test('should search customers by last name', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search customers...');
      
      await searchInput.fill('Smith');
      
      await expect(page.getByText('Bob Smith')).toBeVisible();
      await expect(page.getByText('Alice Johnson')).not.toBeVisible();
      await expect(page.getByText('Charlie Brown')).not.toBeVisible();
    });

    test('should search customers by email', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search customers...');
      
      await searchInput.fill('charlie.brown');
      
      await expect(page.getByText('Charlie Brown')).toBeVisible();
      await expect(page.getByText('Alice Johnson')).not.toBeVisible();
      await expect(page.getByText('Bob Smith')).not.toBeVisible();
    });

    test('should handle case-insensitive search', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search customers...');
      
      await searchInput.fill('ALICE');
      
      await expect(page.getByText('Alice Johnson')).toBeVisible();
    });

    test('should show no results message for invalid search', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search customers...');
      
      await searchInput.fill('nonexistent');
      
      await expect(page.getByText('No results found')).toBeVisible();
      await expect(page.getByText('No customers match "nonexistent"')).toBeVisible();
    });

    test('should clear search results when input is cleared', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search customers...');
      
      // Search first
      await searchInput.fill('Alice');
      await expect(page.getByText('Alice Johnson')).toBeVisible();
      await expect(page.getByText('Bob Smith')).not.toBeVisible();
      
      // Clear search
      await searchInput.clear();
      
      // Should show all customers
      await expect(page.getByText('Alice Johnson')).toBeVisible();
      await expect(page.getByText('Bob Smith')).toBeVisible();
      await expect(page.getByText('Charlie Brown')).toBeVisible();
    });
  });

  test.describe('Customer Details and Management', () => {
    test.beforeEach(async ({ page }) => {
      // Create a test customer for viewing
      await createTestCustomer(page, {
        firstName: 'Detail',
        lastName: 'Test',
        email: 'detail.test@example.com',
        phone: '555-4444',
        address: '456 Test Street',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        notes: 'This is a test customer for detail viewing'
      });
    });

    test('should view customer details', async ({ page }) => {
      // Find the customer and click view button
      const customerCard = page.locator('[role="button"]').filter({ hasText: 'Detail Test' }).first();
      await customerCard.locator('button').last().click();
      
      // Should open customer details dialog
      await expect(page.getByText('Customer Details')).toBeVisible();
      await expect(page.getByText('Detail Test')).toBeVisible();
      await expect(page.getByText('detail.test@example.com')).toBeVisible();
      await expect(page.getByText('555-4444')).toBeVisible();
      await expect(page.getByText('456 Test Street')).toBeVisible();
      await expect(page.getByText('Austin, TX, 78701')).toBeVisible();
      await expect(page.getByText('This is a test customer for detail viewing')).toBeVisible();
    });

    test('should show customer initials avatar', async ({ page }) => {
      // Customer avatars should show initials
      await expect(page.getByText('DT')).toBeVisible(); // Detail Test initials
    });

    test('should display customer creation date', async ({ page }) => {
      // Should show creation date in the customer card
      const customerCard = page.locator('text=Detail Test').locator('..');
      await expect(customerCard.getByText(/Jan \d+, 2024/)).toBeVisible();
    });
  });

  test.describe('Data Persistence and API Integration', () => {
    test('should persist customer data across page reloads', async ({ page }) => {
      // Create a customer
      await createTestCustomer(page, {
        firstName: 'Persistent',
        lastName: 'User',
        email: 'persistent@test.com'
      });
      
      // Verify customer is visible
      await expect(page.getByText('Persistent User')).toBeVisible();
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Customer should still be visible
      await expect(page.getByText('Persistent User')).toBeVisible();
      await expect(page.getByText('persistent@test.com')).toBeVisible();
    });

    test('should capture and validate API request data', async ({ page }) => {
      let requestData: any = null;
      
      // Intercept and capture the request data
      await page.route('**/api/admin/customers', async route => {
        if (route.request().method() === 'POST') {
          const request = route.request();
          const postData = request.postData();
          
          if (postData) {
            try {
              requestData = JSON.parse(postData);
            } catch (e) {
              console.log('Failed to parse request data:', postData);
            }
          }
          
          // Continue with the request
          await route.continue();
        } else {
          await route.continue();
        }
      });
      
      // Create a customer
      await createTestCustomer(page, {
        firstName: 'API',
        lastName: 'Test',
        email: 'api.test@example.com',
        phone: '555-0123'
      });
      
      // Verify the request data structure
      expect(requestData).toBeTruthy();
      expect(requestData.name).toBe('API Test');
      expect(requestData.email).toBe('api.test@example.com');
      expect(requestData.phone).toBe('555-0123');
    });

    test('should handle network connectivity issues', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/admin/customers', route => {
        if (route.request().method() === 'POST') {
          route.abort();
        } else {
          route.continue();
        }
      });
      
      await page.getByRole('button', { name: /add customer/i }).click();
      
      await page.getByLabel('First Name').fill('Network');
      await page.getByLabel('Last Name').fill('Test');
      await page.getByLabel('Email').fill('network@test.com');
      
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show appropriate error message
      await expect(page.getByText(/Failed to create customer/)).toBeVisible();
    });

    test('should handle concurrent customer creation', async ({ page, context }) => {
      // Open a second page
      const page2 = await context.newPage();
      await page2.goto('/admin/customers');
      await page2.waitForLoadState('networkidle');

      // Create customers simultaneously from both pages
      const createPromise1 = createTestCustomer(page, {
        firstName: 'Concurrent1',
        lastName: 'Test',
        email: 'concurrent1@test.com'
      });

      const createPromise2 = createTestCustomer(page2, {
        firstName: 'Concurrent2',
        lastName: 'Test',
        email: 'concurrent2@test.com'
      });

      await Promise.all([createPromise1, createPromise2]);

      // Both customers should be created successfully
      await expect(page.getByText('Concurrent1 Test')).toBeVisible();
      await expect(page2.getByText('Concurrent2 Test')).toBeVisible();

      await page2.close();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle empty response gracefully', async ({ page }) => {
      await page.route('**/api/admin/customers', route => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ clients: [] })
          });
        } else {
          route.continue();
        }
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('No customers found')).toBeVisible();
      await expect(page.getByText('Get started by adding your first customer.')).toBeVisible();
    });

    test('should handle malformed API response', async ({ page }) => {
      await page.route('**/api/admin/customers', route => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: 'invalid json'
          });
        } else {
          route.continue();
        }
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Error Loading Customers')).toBeVisible();
    });

    test('should handle extremely long customer names', async ({ page }) => {
      const longFirstName = 'A'.repeat(100);
      const longLastName = 'B'.repeat(100);
      
      await createTestCustomer(page, {
        firstName: longFirstName,
        lastName: longLastName,
        email: 'long.name@test.com'
      });

      // Should truncate or handle long names gracefully
      await expect(page.getByText(longFirstName)).toBeVisible();
    });

    test('should handle special characters in names', async ({ page }) => {
      await createTestCustomer(page, {
        firstName: 'José',
        lastName: "O'Connor-Smith",
        email: 'jose.oconnor@test.com'
      });

      await expect(page.getByText("José O'Connor-Smith")).toBeVisible();
    });
  });
});

// Helper function to create a test customer
async function createTestCustomer(page: Page, customerData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}) {
  // Click the "Add Customer" button
  await page.getByRole('button', { name: /add customer/i }).click();
  
  // Wait for dialog to open
  await expect(page.getByText('Add New Customer')).toBeVisible();
  
  // Fill in the customer form
  await page.getByLabel('First Name').fill(customerData.firstName);
  await page.getByLabel('Last Name').fill(customerData.lastName);
  await page.getByLabel('Email').fill(customerData.email);
  
  if (customerData.phone) {
    await page.getByLabel('Phone').fill(customerData.phone);
  }
  
  if (customerData.address) {
    await page.getByLabel('Address').fill(customerData.address);
  }
  
  if (customerData.city) {
    await page.getByLabel('City').fill(customerData.city);
  }
  
  if (customerData.state) {
    await page.getByLabel('State').fill(customerData.state);
  }
  
  if (customerData.zipCode) {
    await page.getByLabel('ZIP').fill(customerData.zipCode);
  }
  
  if (customerData.notes) {
    await page.getByLabel('Notes').fill(customerData.notes);
  }
  
  // Submit the form
  await page.getByRole('button', { name: /create customer/i }).click();
  
  // Wait for success
  await expect(page.getByText('Customer created successfully')).toBeVisible();
  
  // Wait for dialog to close
  await expect(page.getByText('Add New Customer')).not.toBeVisible();
}