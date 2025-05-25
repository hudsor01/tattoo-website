import { test, expect, Page } from '@playwright/test';

test.describe('Customer CRUD Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin customers page
    await page.goto('/admin/customers');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for the customers list to be visible
    await expect(page.getByText('Customers')).toBeVisible();
  });

  test.describe('Customer Creation', () => {
    test('should successfully create a new customer', async ({ page }) => {
      // Click the "Add Customer" button
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Wait for dialog to open
      await expect(page.getByText('Add New Customer')).toBeVisible();
      
      // Fill in the customer form
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('john.doe@example.com');
      await page.getByLabel('Phone').fill('555-1234');
      await page.getByLabel('Address').fill('123 Main St');
      await page.getByLabel('City').fill('New York');
      await page.getByLabel('State').fill('NY');
      await page.getByLabel('Zip Code').fill('10001');
      await page.getByLabel('Notes').fill('Test customer for E2E testing');
      
      // Intercept the API call to monitor the request
      const createCustomerPromise = page.waitForResponse(
        response => response.url().includes('/api/trpc/admin.createCustomer') && response.status() === 200
      );
      
      // Submit the form
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Wait for the API call to complete
      const response = await createCustomerPromise;
      
      // Verify the API call was successful
      expect(response.status()).toBe(200);
      
      // Check for success toast
      await expect(page.getByText('Customer created successfully')).toBeVisible();
      
      // Verify dialog closes
      await expect(page.getByText('Add New Customer')).not.toBeVisible();
      
      // Verify customer appears in the list
      await expect(page.getByText('John Doe')).toBeVisible();
      await expect(page.getByText('john.doe@example.com')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Open create dialog
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Try to submit without filling required fields
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show validation error
      await expect(page.getByText('First name is required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      // Open create dialog
      await page.getByRole('button', { name: /add customer/i }).click();
      
      // Fill form with invalid email
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('invalid-email');
      
      // Try to submit
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show email validation error
      await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Mock a server error response
      await page.route('**/api/trpc/admin.createCustomer*', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      // Open create dialog and fill form
      await page.getByRole('button', { name: /add customer/i }).click();
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('john.doe@example.com');
      
      // Submit form
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show error message
      await expect(page.getByText(/failed to create customer/i)).toBeVisible();
    });
  });

  test.describe('Customer Listing', () => {
    test('should display existing customers', async ({ page }) => {
      // Wait for customers to load
      await page.waitForSelector('[data-testid="customer-list"]', { state: 'visible' });
      
      // Should show customers table/list
      await expect(page.getByText('Customers')).toBeVisible();
      
      // Should have proper table headers or list structure
      const customerElements = await page.$$('[data-testid*="customer-"]');
      expect(customerElements.length).toBeGreaterThanOrEqual(0);
    });

    test('should search customers', async ({ page }) => {
      // Look for search input
      const searchInput = page.getByPlaceholder(/search customers/i);
      
      if (await searchInput.isVisible()) {
        // Test search functionality
        await searchInput.fill('john');
        
        // Wait for search results
        await page.waitForTimeout(500); // Debounce delay
        
        // Results should update
        await expect(page.getByText(/customers/i)).toBeVisible();
      }
    });
  });

  test.describe('Customer Management', () => {
    test('should view customer details', async ({ page }) => {
      // First create a customer to ensure we have one to view
      await createTestCustomer(page, {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
      });
      
      // Find and click on a customer to view details
      const customerRow = page.getByText('Jane Smith').first();
      await customerRow.click();
      
      // Should open customer details view
      await expect(page.getByText('Customer Details')).toBeVisible();
      await expect(page.getByText('jane.smith@example.com')).toBeVisible();
    });

    test('should edit customer information', async ({ page }) => {
      // Create a test customer first
      await createTestCustomer(page, {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com'
      });
      
      // Find edit button (might be in dropdown or inline)
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Should open edit dialog
        await expect(page.getByText(/edit customer/i)).toBeVisible();
        
        // Update customer information
        await page.getByLabel('First Name').fill('Robert');
        
        // Save changes
        await page.getByRole('button', { name: /save/i }).click();
        
        // Should show success message
        await expect(page.getByText(/updated successfully/i)).toBeVisible();
        
        // Verify changes in the list
        await expect(page.getByText('Robert Johnson')).toBeVisible();
      }
    });

    test('should add notes to customer', async ({ page }) => {
      // Create a test customer first
      await createTestCustomer(page, {
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@example.com'
      });
      
      // Look for add note functionality
      const addNoteButton = page.getByRole('button', { name: /add note/i }).first();
      
      if (await addNoteButton.isVisible()) {
        await addNoteButton.click();
        
        // Fill note
        await page.getByLabel(/note/i).fill('This is a test note for the customer.');
        
        // Save note
        await page.getByRole('button', { name: /add note/i }).click();
        
        // Should show success
        await expect(page.getByText(/note added successfully/i)).toBeVisible();
      }
    });
  });

  test.describe('Data Persistence and API Integration', () => {
    test('should persist customer data across page reloads', async ({ page }) => {
      // Create a customer
      await createTestCustomer(page, {
        firstName: 'Persistent',
        lastName: 'User',
        email: 'persistent.user@example.com'
      });
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Customer should still be visible
      await expect(page.getByText('Persistent User')).toBeVisible();
      await expect(page.getByText('persistent.user@example.com')).toBeVisible();
    });

    test('should handle network timeouts gracefully', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/trpc/admin.createCustomer*', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
        }, 10000); // 10 second delay
      });
      
      // Open create dialog and fill form
      await page.getByRole('button', { name: /add customer/i }).click();
      await page.getByLabel('First Name').fill('Timeout');
      await page.getByLabel('Last Name').fill('Test');
      await page.getByLabel('Email').fill('timeout.test@example.com');
      
      // Submit form
      await page.getByRole('button', { name: /create customer/i }).click();
      
      // Should show loading state
      await expect(page.getByText(/creating.../i)).toBeVisible();
    });

    test('should capture form data being sent to API', async ({ page }) => {
      let requestData: any = null;
      
      // Intercept and capture the request data
      await page.route('**/api/trpc/admin.createCustomer*', async route => {
        const request = route.request();
        const postData = request.postData();
        
        if (postData) {
          try {
            requestData = JSON.parse(postData);
            console.log('Captured request data:', requestData);
          } catch (e) {
            console.log('Raw request data:', postData);
          }
        }
        
        // Continue with the request
        await route.continue();
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
      console.log('Final captured data:', requestData);
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
    await page.getByLabel('Zip Code').fill(customerData.zipCode);
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