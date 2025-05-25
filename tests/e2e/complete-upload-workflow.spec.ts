import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import path from 'path';

test.describe('Complete Upload Workflow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
    await authHelper.mockTRPCCalls();
    
    // Navigate to gallery page
    await page.goto('/admin/gallery');
  });

  test('should complete entire design creation workflow', async ({ page }) => {
    // Step 1: Open create dialog
    await page.click('text=Add Design');
    await expect(page.locator('text=Create Design')).toBeVisible();

    // Step 2: Fill in design details
    await page.fill('input[placeholder="Design name"]', 'Test Tattoo Design');
    await page.fill('textarea[placeholder="Design description"]', 'A beautiful test tattoo design');
    
    // Step 3: Select design type
    await page.click('text=Select type');
    await page.click('text=Traditional');
    
    // Step 4: Select size
    await page.click('text=Select size');
    await page.click('text=Medium (2-4 inches)');

    // Step 5: Mock successful upload
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://example.com/uploaded-design.jpg',
          path: 'tattoos/uploaded-design.jpg'
        })
      });
    });

    // Step 6: Upload image
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    // Wait for upload to complete
    await expect(page.locator('text=Image uploaded successfully')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('img[alt="Uploaded image"]')).toBeVisible();

    // Step 7: Mock design creation
    await page.route('**/api/trpc/gallery.create**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            data: {
              id: '1',
              name: 'Test Tattoo Design',
              description: 'A beautiful test tattoo design',
              fileUrl: 'https://example.com/uploaded-design.jpg',
              designType: 'Traditional',
              size: 'Medium (2-4 inches)',
              isApproved: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      });
    });

    // Step 8: Submit form
    const createButton = page.locator('button:has-text("Create")');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    // Step 9: Verify success
    await expect(page.locator('text=Design created successfully')).toBeVisible({ timeout: 10000 });
    
    // Dialog should close
    await expect(page.locator('text=Create Design')).not.toBeVisible();
  });

  test('should handle upload and creation errors gracefully', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Fill in basic details
    await page.fill('input[placeholder="Design name"]', 'Test Design');
    
    // Mock upload failure
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Server error during upload'
        })
      });
    });

    // Try to upload
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    // Should show error message
    await expect(page.locator('text=Upload failed')).toBeVisible({ timeout: 10000 });
    
    // Create button should remain disabled
    const createButton = page.locator('button:has-text("Create")');
    await expect(createButton).toBeDisabled();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('text=Add Design');
    
    const createButton = page.locator('button:has-text("Create")');
    
    // Initially disabled
    await expect(createButton).toBeDisabled();
    
    // Fill name only
    await page.fill('input[placeholder="Design name"]', 'Test Design');
    await expect(createButton).toBeDisabled();
    
    // Mock successful upload
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://example.com/test.jpg',
          path: 'tattoos/test.jpg'
        })
      });
    });
    
    // Add image
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    await expect(page.locator('text=Image uploaded successfully')).toBeVisible({ timeout: 10000 });
    
    // Now button should be enabled
    await expect(createButton).toBeEnabled();
  });

  test('should allow editing uploaded image', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Mock upload
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://example.com/first-image.jpg',
          path: 'tattoos/first-image.jpg'
        })
      });
    });

    // Upload first image
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    await expect(page.locator('img[alt="Uploaded image"]')).toBeVisible({ timeout: 10000 });
    
    // Replace with new image
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://example.com/second-image.jpg',
          path: 'tattoos/second-image.jpg'
        })
      });
    });
    
    // Click replace option
    await page.click('text=Click to replace image');
    const newFileInput = page.locator('input[type="file"]').last();
    await newFileInput.setInputFiles(testImagePath);
    
    // Should show new upload success
    await expect(page.locator('text=Image uploaded successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should handle network connectivity issues', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Mock network failure
    await page.route('/api/upload', async (route) => {
      await route.abort('failed');
    });

    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    // Should handle network error gracefully
    await expect(page.locator('text=Upload failed')).toBeVisible({ timeout: 10000 });
  });
});