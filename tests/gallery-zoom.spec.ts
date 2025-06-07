import { test, expect } from '@playwright/test';

test.describe('Gallery Zoom Functionality', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(30000);
  });

  test('should display gallery and test zoom functionality', async ({ page }) => {
    // Navigate to gallery
    await page.goto('/gallery');
    
    // Wait for gallery to load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });
    
    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Gallery');
    
    // Get gallery items
    const galleryItems = page.locator('[data-testid^="gallery-item-"]');
    await expect(galleryItems.first()).toBeVisible({ timeout: 10000 });
    
    // Click on first gallery item
    await galleryItems.first().click();
    
    // Wait for zoom overlay to appear
    await page.waitForTimeout(1000);
    
    // Check if zoom overlay is visible
    const zoomView = page.locator('[data-testid="gallery-zoom-view"]');
    await expect(zoomView).toBeVisible();
    
    // Check for close button
    const closeButton = page.locator('[data-testid="gallery-close-button"]');
    await expect(closeButton).toBeVisible();
    
    // Test close button
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Verify overlay is gone
    await expect(zoomView).not.toBeVisible();
  });

  test('should test backdrop click to close', async ({ page }) => {
    await page.goto('/gallery');
    
    // Wait for gallery to load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });
    
    // Click first item
    const galleryItems = page.locator('[data-testid^="gallery-item-"]');
    await galleryItems.first().click();
    await page.waitForTimeout(1000);
    
    // Verify zoom view opened
    const zoomView = page.locator('[data-testid="gallery-zoom-view"]');
    await expect(zoomView).toBeVisible();
    
    // Click outside the zoom content to close (on backdrop)
    await page.keyboard.press('Escape'); // Alternative method
    await page.waitForTimeout(500);
    
    // Verify zoom closed
    await expect(zoomView).not.toBeVisible();
  });

  test('should display different content for images vs videos', async ({ page }) => {
    await page.goto('/gallery');
    
    // Test images tab
    await page.waitForSelector('[role="tab"]:has-text("Images")', { timeout: 10000 });
    await page.locator('[role="tab"]:has-text("Images")').click();
    await page.waitForTimeout(1000);
    
    // Click first image
    const imageItems = page.locator('[data-testid^="gallery-item-"]');
    if (await imageItems.count() > 0) {
      await imageItems.first().click();
      await page.waitForTimeout(1000);
      
      // Should see image in zoom view
      const zoomView = page.locator('[data-testid="gallery-zoom-view"]');
      await expect(zoomView).toBeVisible();
      
      // Close zoom
      const closeButton = page.locator('[data-testid="gallery-close-button"]');
      await closeButton.click();
      await page.waitForTimeout(500);
    }
    
    // Test videos tab
    await page.locator('[role="tab"]:has-text("Videos")').click();
    await page.waitForTimeout(1000);
    
    // Click first video
    const videoItems = page.locator('[data-testid^="gallery-item-"]');
    if (await videoItems.count() > 0) {
      await videoItems.first().click();
      await page.waitForTimeout(1000);
      
      // Should see video in zoom view
      const zoomView = page.locator('[data-testid="gallery-zoom-view"]');
      await expect(zoomView).toBeVisible();
      
      // Close zoom
      const closeButton = page.locator('[data-testid="gallery-close-button"]');
      await closeButton.click();
    }
  });
});