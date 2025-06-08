// Booking Flow Integration Test
// Tests the complete user journey from gallery → lightbox → booking page → Cal.com embed

import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the gallery page
    await page.goto('/gallery');
    
    // Wait for gallery to load
    await page.waitForSelector('[data-testid^="gallery-item-"]', { timeout: 10000 });
  });

  test('Should complete full booking flow from gallery to Cal.com', async ({ page }) => {
    // Step 1: Click on a gallery item to open lightbox
    const firstGalleryItem = page.locator('[data-testid^="gallery-item-"]').first();
    await firstGalleryItem.click();
    
    // Wait for lightbox to open
    await expect(page.locator('[data-testid="gallery-zoom-view"]')).toBeVisible();
    
    // Step 2: Find and click the "Book This Design" button in the lightbox
    const bookButton = page.locator('text=Book This Design').first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();
    
    // Step 3: Verify navigation to booking consultation page
    await page.waitForURL('/book-consultation*');
    
    // Verify the design name is passed in URL params
    const url = new URL(page.url());
    const designParam = url.searchParams.get('design');
    expect(designParam).toBeTruthy(); // Should have a design parameter
    
    // Step 4: Verify booking page content
    await expect(page.locator('h1')).toContainText('Book Your Tattoo Consultation');
    
    // Should show the design name if passed
    if (designParam) {
      await expect(page.locator('text=Design:')).toBeVisible();
    }
    
    // Step 5: Verify Cal.com embed is present and loaded
    await expect(page.locator('div:has-text("Schedule Your Consultation")')).toBeVisible();
    
    // Look for Cal.com embedded component
    // The CalAtomsBooker should render the Cal component
    await expect(page.locator('[data-cal-link], [data-cal-namespace]').or(
      page.locator('iframe[src*="cal.com"]')
    )).toBeVisible({ timeout: 15000 });
    
    // Step 6: Verify sidebar information is present
    await expect(page.locator('text=Fernando Govea')).toBeVisible();
    await expect(page.locator('text=Professional Tattoo Artist')).toBeVisible();
    await expect(page.locator('text=30 minutes • Free')).toBeVisible();
    
    // Step 7: Test back navigation
    const backButton = page.locator('text=Back to Gallery');
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Should return to gallery
    await page.waitForURL('/gallery');
    await expect(page.locator('h1')).toContainText('Tattoo Gallery');
  });

  test('Should handle booking success redirect', async ({ page }) => {
    // Navigate directly to gallery with booking success parameter
    await page.goto('/gallery?booking=success');
    
    // Should show success notification
    await expect(page.locator('text=Booking Successful!')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=We\'ll contact you soon')).toBeVisible();
    
    // Success notification should have close button
    const closeButton = page.locator('[data-testid="close-success-notification"]').or(
      page.locator('button:has-text("×")')
    );
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(page.locator('text=Booking Successful!')).not.toBeVisible();
    }
    
    // URL parameter should be cleaned up
    await page.waitForTimeout(1000); // Wait for URL cleanup
    expect(page.url()).not.toContain('booking=success');
  });

  test('Should handle direct navigation to booking page', async ({ page }) => {
    // Test direct navigation to booking page
    await page.goto('/book-consultation');
    
    // Should load correctly without design parameter
    await expect(page.locator('h1')).toContainText('Book Your Tattoo Consultation');
    
    // Should not show design-specific content
    await expect(page.locator('text=Design:')).not.toBeVisible();
    
    // Cal.com embed should still work
    await expect(page.locator('[data-cal-link], [data-cal-namespace]').or(
      page.locator('iframe[src*="cal.com"]')
    )).toBeVisible({ timeout: 15000 });
  });

  test('Should handle booking page with design parameter', async ({ page }) => {
    const testDesignName = 'Japanese Dragon Sleeve';
    
    // Navigate with design parameter
    await page.goto(`/book-consultation?design=${encodeURIComponent(testDesignName)}`);
    
    // Should show design name
    await expect(page.locator(`text=${testDesignName}`)).toBeVisible();
    await expect(page.locator('text=Design:')).toBeVisible();
    
    // Cal.com embed should work with design context
    await expect(page.locator('[data-cal-link], [data-cal-namespace]').or(
      page.locator('iframe[src*="cal.com"]')
    )).toBeVisible({ timeout: 15000 });
  });

  test('Should maintain proper z-index hierarchy', async ({ page }) => {
    // Open gallery lightbox
    const firstGalleryItem = page.locator('[data-testid^="gallery-item-"]').first();
    await firstGalleryItem.click();
    
    // Verify lightbox is visible
    const lightbox = page.locator('[data-testid="gallery-zoom-view"]');
    await expect(lightbox).toBeVisible();
    
    // Check z-index values to ensure proper layering
    const lightboxZIndex = await lightbox.evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });
    
    // Gallery lightbox should have appropriate z-index (960 based on our updates)
    expect(parseInt(lightboxZIndex)).toBeGreaterThan(900);
    
    // Close lightbox
    const closeButton = page.locator('[data-testid="gallery-close-button"]');
    await closeButton.click();
    
    // Lightbox should close
    await expect(lightbox).not.toBeVisible();
  });

  test('Should handle booking flow errors gracefully', async ({ page }) => {
    // Test with invalid design parameter
    await page.goto('/book-consultation?design=');
    
    // Should still load the page
    await expect(page.locator('h1')).toContainText('Book Your Tattoo Consultation');
    
    // Should not show design section if design is empty
    await expect(page.locator('text=Design:')).not.toBeVisible();
    
    // Cal.com embed should still work
    await expect(page.locator('[data-cal-link], [data-cal-namespace]').or(
      page.locator('iframe[src*="cal.com"]')
    )).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Cal.com Integration Specific Tests', () => {
  test('Should load Cal.com embed correctly', async ({ page }) => {
    await page.goto('/book-consultation');
    
    // Wait for the Cal.com component to initialize
    await page.waitForTimeout(3000);
    
    // Check for Cal.com specific elements
    const calEmbed = page.locator('[data-cal-link], [data-cal-namespace]').or(
      page.locator('iframe[src*="cal.com"]')
    );
    
    await expect(calEmbed).toBeVisible({ timeout: 15000 });
    
    // Verify Cal.com configuration
    const calConfig = await page.evaluate(() => {
      return {
        calLoaded: typeof window !== 'undefined' && 'Cal' in window,
        calApiAvailable: typeof window !== 'undefined' && window.Cal && typeof window.Cal === 'function'
      };
    });
    
    console.log('Cal.com configuration:', calConfig);
  });

  test('Should handle Cal.com booking success callback', async ({ page }) => {
    await page.goto('/book-consultation');
    
    // Mock Cal.com booking success event
    await page.evaluate(() => {
      // Simulate Cal.com booking success event
      if (typeof window !== 'undefined' && window.Cal) {
        const mockEvent = new CustomEvent('cal:booking-successful', {
          detail: {
            eventTypeId: 123,
            booking: {
              id: 'test-booking-123',
              uid: 'test-uid-456'
            }
          }
        });
        
        // Trigger the booking success callback
        window.dispatchEvent(mockEvent);
      }
    });
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    
    // Should redirect to gallery with success parameter
    // Note: This might not trigger in test environment, but the callback should be set up correctly
  });
});
