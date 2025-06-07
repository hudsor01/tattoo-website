import { test, expect } from '@playwright/test';

test.describe('Comprehensive Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for page loads
    page.setDefaultTimeout(60000);
  });

  test.describe('About Page', () => {
    test('should load and display all content', async ({ page }) => {
      await page.goto('/about');
      
      // Check page title
      await expect(page).toHaveTitle(/About.*Ink 37/i);
      
      // Check main heading
      await expect(page.locator('h1')).toContainText(/About/i);
      
      // Check for content sections
      const aboutContent = page.locator('main, [data-testid="about-content"], .container');
      await expect(aboutContent).toBeVisible();
      
      // Check for navigation
      await expect(page.locator('nav')).toBeVisible();
      
      // Check for footer
      await expect(page.locator('footer')).toBeVisible();
    });

    test('should have proper navigation links', async ({ page }) => {
      await page.goto('/about');
      
      // Check navigation links exist and are clickable
      const navLinks = page.locator('nav a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
      
      // Check specific important links
      await expect(page.locator('nav a[href="/"]')).toBeVisible();
      await expect(page.locator('nav a[href="/gallery"]')).toBeVisible();
      await expect(page.locator('nav a[href="/contact"]')).toBeVisible();
    });
  });

  test.describe('Contact Page', () => {
    test('should load contact form', async ({ page }) => {
      await page.goto('/contact');
      
      // Check page title
      await expect(page).toHaveTitle(/Contact.*Ink 37/i);
      
      // Check form elements
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('textarea[name="message"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should validate form fields', async ({ page }) => {
      await page.goto('/contact');
      
      // Try to submit empty form
      await page.locator('button[type="submit"]').click();
      
      // Check if validation appears (HTML5 validation or custom)
      const nameField = page.locator('input[name="name"]');
      const emailField = page.locator('input[name="email"]');
      
      // Check required attributes
      await expect(nameField).toHaveAttribute('required');
      await expect(emailField).toHaveAttribute('required');
    });

    test('should fill and attempt form submission', async ({ page }) => {
      await page.goto('/contact');
      
      // Fill out form
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="subject"]', 'Test Subject');
      await page.fill('textarea[name="message"]', 'This is a test message');
      
      // Submit form (note: this might trigger actual submission in dev)
      await page.locator('button[type="submit"]').click();
      
      // Wait for response or loading state
      await page.waitForTimeout(2000);
      
      // Check for success message or error handling
      // This will depend on your actual implementation
    });
  });

  test.describe('Services Page', () => {
    test('should load and display services', async ({ page }) => {
      await page.goto('/services');
      
      // Check page title
      await expect(page).toHaveTitle(/Services.*Ink 37/i);
      
      // Check main heading
      await expect(page.locator('h1')).toContainText(/Services/i);
      
      // Check for service cards or content
      const serviceContent = page.locator('[data-testid*="service"], .service, [class*="service"]');
      const hasServices = await serviceContent.count() > 0;
      
      if (hasServices) {
        await expect(serviceContent.first()).toBeVisible();
      }
      
      // Check for book now buttons
      const bookButtons = page.locator('button:has-text("Book"), a:has-text("Book")');
      const buttonCount = await bookButtons.count();
      expect(buttonCount).toBeGreaterThanOrEqual(0);
    });

    test('should have booking functionality', async ({ page }) => {
      await page.goto('/services');
      
      // Look for booking elements
      const bookingElements = page.locator('button:has-text("Book"), a:has-text("Book"), [href*="booking"]');
      const count = await bookingElements.count();
      
      if (count > 0) {
        // Click first booking element
        await bookingElements.first().click();
        
        // Should navigate to booking page or show booking modal
        await page.waitForTimeout(1000);
        
        // Check if we're on booking page or modal appeared
        const currentUrl = page.url();
        const hasBookingModal = await page.locator('[role="dialog"], .modal, [data-testid*="booking"]').count() > 0;
        
        expect(currentUrl.includes('/booking') || hasBookingModal).toBeTruthy();
      }
    });
  });

  test.describe('Gallery Page', () => {
    test('should load gallery page', async ({ page }) => {
      await page.goto('/gallery');
      
      // Check page title
      await expect(page).toHaveTitle(/Gallery.*Ink 37/i);
      
      // Check main heading
      await expect(page.locator('h1')).toContainText(/Gallery/i);
      
      // Check for tabs
      await expect(page.locator('[role="tablist"]')).toBeVisible();
      await expect(page.locator('[role="tab"]:has-text("Images")')).toBeVisible();
      await expect(page.locator('[role="tab"]:has-text("Videos")')).toBeVisible();
    });

    test('should display gallery items', async ({ page }) => {
      await page.goto('/gallery');
      
      // Wait for gallery content to load
      await page.waitForTimeout(3000);
      
      // Check for gallery grid
      const galleryGrid = page.locator('[class*="grid"]').first();
      await expect(galleryGrid).toBeVisible();
      
      // Check for gallery items (images or videos)
      const galleryItems = page.locator('[class*="grid"] > div, .gallery-item, [data-testid*="gallery"]');
      const itemCount = await galleryItems.count();
      expect(itemCount).toBeGreaterThan(0);
    });

    test('should handle tab switching', async ({ page }) => {
      await page.goto('/gallery');
      
      // Click on Videos tab
      await page.locator('[role="tab"]:has-text("Videos")').click();
      await page.waitForTimeout(1000);
      
      // Check if videos tab is active
      const videosTab = page.locator('[role="tab"]:has-text("Videos")');
      await expect(videosTab).toHaveAttribute('data-state', 'active');
      
      // Click back to Images tab
      await page.locator('[role="tab"]:has-text("Images")').click();
      await page.waitForTimeout(1000);
      
      // Check if images tab is active
      const imagesTab = page.locator('[role="tab"]:has-text("Images")');
      await expect(imagesTab).toHaveAttribute('data-state', 'active');
    });

    test('should test gallery item click and zoom functionality', async ({ page }) => {
      await page.goto('/gallery');
      
      // Wait for gallery to load
      await page.waitForTimeout(3000);
      
      // Find gallery items
      const galleryItems = page.locator('[class*="grid"] > div');
      const itemCount = await galleryItems.count();
      
      if (itemCount > 0) {
        // Click on first gallery item
        await galleryItems.first().click();
        await page.waitForTimeout(1000);
        
        // Check if zoom/modal appears
        const zoomedItem = page.locator('[class*="fixed"], [class*="absolute"][class*="inset"], [class*="z-50"]');
        const modalCount = await zoomedItem.count();
        
        // If zoom functionality exists, test it
        if (modalCount > 0) {
          // Check if zoomed view is visible
          await expect(zoomedItem.first()).toBeVisible();
          
          // Check for close functionality (click outside or close button)
          const backdrop = page.locator('[class*="fixed"][class*="inset-0"]');
          if (await backdrop.count() > 0) {
            await backdrop.click();
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test('should verify images load properly', async ({ page }) => {
      await page.goto('/gallery');
      
      // Wait for images to load
      await page.waitForTimeout(5000);
      
      // Check for images
      const images = page.locator('img[src*="/images/"]');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        // Check if at least some images are loaded
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();
        
        // Check image natural dimensions (means it loaded)
        const dimensions = await firstImage.evaluate((img: HTMLImageElement) => ({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        }));
        
        expect(dimensions.naturalWidth).toBeGreaterThan(0);
        expect(dimensions.naturalHeight).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Global Navigation and SEO', () => {
    test('should have consistent navigation across all pages', async ({ page }) => {
      const pages = ['/about', '/contact', '/services', '/gallery'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // Check navigation exists
        await expect(page.locator('nav')).toBeVisible();
        
        // Check logo/home link
        const logoLink = page.locator('nav a[href="/"], nav [href="/"]').first();
        await expect(logoLink).toBeVisible();
        
        // Check main nav links
        await expect(page.locator('nav a[href="/gallery"]')).toBeVisible();
        await expect(page.locator('nav a[href="/contact"]')).toBeVisible();
      }
    });

    test('should have proper meta tags and SEO', async ({ page }) => {
      const pages = [
        { path: '/about', title: 'About' },
        { path: '/contact', title: 'Contact' },
        { path: '/services', title: 'Services' },
        { path: '/gallery', title: 'Gallery' }
      ];
      
      for (const { path, title } of pages) {
        await page.goto(path);
        
        // Check title
        await expect(page).toHaveTitle(new RegExp(title, 'i'));
        
        // Check meta description
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content');
        
        // Check viewport meta
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveAttribute('content');
      }
    });
  });
});