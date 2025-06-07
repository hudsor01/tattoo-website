import { test, expect } from '@playwright/test';

test.describe('Gallery Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
  });

  test('should load gallery page with all content', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Tattoo Gallery');
    
    // Check that hero section is present
    await expect(page.locator('h1')).toHaveText('Tattoo Gallery');
    await expect(page.locator('p')).toContainText('Browse our collection of custom tattoo designs');
  });

  test('should display all gallery items without filtering system', async ({ page }) => {
    // Wait for gallery grid to load
    await page.waitForSelector('[class*="grid"]');
    
    // Should NOT have any filter elements (RED circles - removed)
    await expect(page.locator('text=Filter Gallery')).toHaveCount(0);
    await expect(page.locator('input[placeholder*="Search"]')).toHaveCount(0);
    await expect(page.locator('button:has-text("All Styles")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Traditional")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Realism")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Japanese")')).toHaveCount(0);
    await expect(page.locator('[role="tablist"]')).toHaveCount(0);
    
    // Should display all gallery items (16 total: 9 images + 7 videos)
    const galleryItems = page.locator('[class*="grid"] > div');
    await expect(galleryItems).toHaveCount(16);
    
    // Check that both images and videos are present
    const images = page.locator('img[src*="/images/"]');
    await expect(images).toHaveCount(9);
    
    const videos = page.locator('video[src*="/videos/"]');
    await expect(videos).toHaveCount(7);
    
    // Should NOT have "No Designs Found" message
    await expect(page.locator('text=No Designs Found')).toHaveCount(0);
    await expect(page.locator('text=Try adjusting your search criteria')).toHaveCount(0);
  });

  test('should verify all expected images are present', async ({ page }) => {
    // Wait for images to load
    await page.waitForSelector('img[src*="/images/"]');
    
    // Check all expected image files are present
    const expectedImages = [
      '/images/japanese.jpg',
      '/images/traditional.jpg', 
      '/images/realism.jpg',
      '/images/cover-ups.jpg',
      '/images/custom-designs.jpg',
      '/images/christ-crosses.jpg',
      '/images/dragonballz-left-arm.jpg',
      '/images/leg-piece.jpg',
      '/images/praying-nun-left-arm.jpg'
    ];
    
    for (const imageSrc of expectedImages) {
      await expect(page.locator(`img[src="${imageSrc}"]`)).toBeVisible();
    }
  });

  test('should verify all expected videos are present', async ({ page }) => {
    // Wait for videos to load
    await page.waitForSelector('video[src*="/videos/"]');
    
    // Check all expected video files are present
    const expectedVideos = [
      '/videos/christ-crosses-left-arm-sleeve.mov',
      '/videos/christ-crosses-right-arm.mov',
      '/videos/clock-lion-left-arm.mov',
      '/videos/clock-roses.mov',
      '/videos/dragonballz-left-arm.mov',
      '/videos/praying-hands-left-arm.mov',
      '/videos/praying-nun.mov'
    ];
    
    for (const videoSrc of expectedVideos) {
      await expect(page.locator(`video[src="${videoSrc}"]`)).toBeVisible();
    }
  });

  test('should have centered navigation links in navbar', async ({ page }) => {
    // Check that navigation is using centered layout
    const nav = page.locator('nav[class*="flex-1"]');
    await expect(nav).toBeVisible();
    
    // Verify navigation links are present and visible
    const navLinks = ['Home', 'Services', 'Gallery', 'About', 'Contact', 'Book Now'];
    for (const linkText of navLinks) {
      await expect(page.locator(`nav a:has-text("${linkText}")`, )).toBeVisible();
    }
    
    // Check that navigation has proper flex centering classes
    await expect(nav).toHaveClass(/justify-center/);
    await expect(nav).toHaveClass(/flex-1/);
  });

  test('should use logo image instead of text', async ({ page }) => {
    // Should have logo image (BLUE circle - enhancement)
    const logoImage = page.locator('img[src="/logo.png"]');
    await expect(logoImage).toBeVisible();
    await expect(logoImage).toHaveAttribute('alt', 'Logo');
    
    // Should NOT have text logo "Ink 37 Tattoos" (RED circle - removed)
    await expect(page.locator('text=Ink 37 Tattoos')).toHaveCount(0);
  });

  test('should have interactive gallery items with hover effects', async ({ page }) => {
    // Wait for gallery to load
    await page.waitForSelector('[class*="grid"] > div');
    
    // Test first gallery item hover
    const firstItem = page.locator('[class*="grid"] > div').first();
    await expect(firstItem).toBeVisible();
    
    // Hover over first item to check hover effects
    await firstItem.hover();
    
    // Should be able to click on gallery items (not filtering them)
    await expect(firstItem).toBeVisible();
  });

  test('should have proper video controls', async ({ page }) => {
    // Wait for videos to load
    await page.waitForSelector('video');
    
    // Check that videos have controls
    const firstVideo = page.locator('video').first();
    await expect(firstVideo).toHaveAttribute('controls');
    await expect(firstVideo).toHaveAttribute('preload', 'metadata');
  });

  test('Book Now CTA workflow should work', async ({ page }) => {
    // Click Book Now button in navigation
    await page.click('a:has-text("Book Now")');
    
    // Should navigate to booking page
    await expect(page).toHaveURL('/booking');
    
    // Verify booking page loads (basic check)
    await page.waitForLoadState('networkidle');
    
    // Should not show error page
    await expect(page.locator('text=Error')).toHaveCount(0);
    await expect(page.locator('text=404')).toHaveCount(0);
  });

  test('should have responsive gallery grid', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForSelector('[class*="grid"]');
    
    const galleryGrid = page.locator('[class*="grid"]').first();
    await expect(galleryGrid).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForSelector('[class*="grid"]');
    
    // Gallery should still be visible and usable on mobile
    await expect(galleryGrid).toBeVisible();
    
    // All items should still be present
    const galleryItems = page.locator('[class*="grid"] > div');
    await expect(galleryItems).toHaveCount(16);
  });

  test('should load gallery without errors in console', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload page to capture any errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors (optional)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('DEPRECATED')
    );
    
    // Should have no critical console errors
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper SEO metadata', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Gallery.*Ink 37 Tattoos/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /tattoo gallery/i);
  });
});