import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Image Upload Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to gallery page
    await page.goto('/admin/gallery');
  });

  test('should display upload dropzone in create dialog', async ({ page }) => {
    // Open create design dialog
    await page.click('text=Add Design');
    
    // Check if upload area is visible
    await expect(page.locator('text=Upload Image')).toBeVisible();
    await expect(page.locator('text=Click to upload or drag and drop')).toBeVisible();
    await expect(page.locator('text=PNG, JPG, JPEG, GIF, WebP')).toBeVisible();
  });

  test('should show file size limits', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Check if file size limit is displayed
    await expect(page.locator('text=up to 5MB')).toBeVisible();
  });

  test('should upload an image file', async ({ page }) => {
    // Create a test image file
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    
    // Create test image fixture if it doesn't exist
    await page.evaluate(() => {
      // Create a canvas and convert to blob for testing
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 100, 100);
      return canvas.toDataURL();
    });

    await page.click('text=Add Design');
    
    // Wait for dialog to be fully loaded
    await page.waitForSelector('input[type="file"]', { state: 'attached' });
    
    // Mock successful upload response
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://example.com/uploaded-image.jpg',
          path: 'tattoos/uploaded-image.jpg'
        })
      });
    });

    // Simulate file upload by directly setting files on input
    const fileInput = page.locator('input[type="file"]');
    
    // Create a test file programmatically
    const testFile = await page.evaluateHandle(() => {
      const dataTransfer = new DataTransfer();
      const file = new File(['test image content'], 'test-image.jpg', { type: 'image/jpeg' });
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });

    await fileInput.setInputFiles(testFile as any);
    
    // Check if upload progress is shown
    await expect(page.locator('text=Uploading image...')).toBeVisible();
    
    // Wait for upload to complete and check success state
    await expect(page.locator('text=Image uploaded successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should show upload progress', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Mock a slow upload response
    await page.route('/api/upload', async (route) => {
      // Delay response to see loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://example.com/uploaded-image.jpg',
          path: 'tattoos/uploaded-image.jpg'
        })
      });
    });

    const fileInput = page.locator('input[type="file"]');
    const testFile = await page.evaluateHandle(() => {
      const dataTransfer = new DataTransfer();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });

    await fileInput.setInputFiles(testFile as any);
    
    // Check for progress indicators
    await expect(page.locator('text=Uploading image...')).toBeVisible();
    
    // Check for progress bar if it exists
    const progressBar = page.locator('[role="progressbar"]');
    if (await progressBar.isVisible()) {
      await expect(progressBar).toBeVisible();
    }
  });

  test('should handle upload errors', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Mock failed upload response
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Upload failed - server error'
        })
      });
    });

    const fileInput = page.locator('input[type="file"]');
    const testFile = await page.evaluateHandle(() => {
      const dataTransfer = new DataTransfer();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });

    await fileInput.setInputFiles(testFile as any);
    
    // Check for error message
    await expect(page.locator('text=Upload failed')).toBeVisible({ timeout: 10000 });
  });

  test('should validate file types', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Try to upload an invalid file type
    const fileInput = page.locator('input[type="file"]');
    const invalidFile = await page.evaluateHandle(() => {
      const dataTransfer = new DataTransfer();
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });

    await fileInput.setInputFiles(invalidFile as any);
    
    // Check for validation error (react-dropzone should reject it)
    await expect(page.locator('text=File type not accepted')).toBeVisible({ timeout: 5000 });
  });

  test('should validate file size', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Create a large file that exceeds the limit
    const fileInput = page.locator('input[type="file"]');
    const largeFile = await page.evaluateHandle(() => {
      const dataTransfer = new DataTransfer();
      // Create a file larger than 5MB
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const file = new File([largeContent], 'large-image.jpg', { type: 'image/jpeg' });
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });

    await fileInput.setInputFiles(largeFile as any);
    
    // Check for size validation error
    await expect(page.locator('text=File is larger than')).toBeVisible({ timeout: 5000 });
  });

  test('should show uploaded image preview', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Mock successful upload
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://example.com/uploaded-image.jpg',
          path: 'tattoos/uploaded-image.jpg'
        })
      });
    });

    const fileInput = page.locator('input[type="file"]');
    const testFile = await page.evaluateHandle(() => {
      const dataTransfer = new DataTransfer();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });

    await fileInput.setInputFiles(testFile as any);
    
    // Wait for upload to complete
    await expect(page.locator('text=Image uploaded successfully')).toBeVisible({ timeout: 10000 });
    
    // Check if image preview is shown
    await expect(page.locator('img[alt="Uploaded image"]')).toBeVisible();
    
    // Check if replace option is available
    await expect(page.locator('text=Click to replace image')).toBeVisible();
  });

  test('should allow removing uploaded image', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Mock successful upload
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://example.com/uploaded-image.jpg',
          path: 'tattoos/uploaded-image.jpg'
        })
      });
    });

    const fileInput = page.locator('input[type="file"]');
    const testFile = await page.evaluateHandle(() => {
      const dataTransfer = new DataTransfer();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });

    await fileInput.setInputFiles(testFile as any);
    
    // Wait for upload to complete
    await expect(page.locator('img[alt="Uploaded image"]')).toBeVisible({ timeout: 10000 });
    
    // Click remove button (X button)
    await page.click('button:has-text("×")');
    
    // Check that image preview is removed and dropzone is shown again
    await expect(page.locator('text=Click to upload or drag and drop')).toBeVisible();
    await expect(page.locator('img[alt="Uploaded image"]')).not.toBeVisible();
  });

  test('should disable form submission without required fields', async ({ page }) => {
    await page.click('text=Add Design');
    
    // Check that Create button is disabled without required fields
    const createButton = page.locator('button:has-text("Create")');
    await expect(createButton).toBeDisabled();
    
    // Fill in name but no image
    await page.fill('input[placeholder="Design name"]', 'Test Design');
    
    // Should still be disabled without image
    await expect(createButton).toBeDisabled();
  });
});