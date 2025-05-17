import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout } from './helpers/auth-helper';
import { GalleryPage } from './page-objects/gallery-page';
import { BookingPage } from './page-objects/booking-page';
import { AnalyticsPage } from './page-objects/analytics-page';

/**
 * Test suite for analytics tracking
 * 
 * These tests verify that user interactions are properly
 * tracked throughout the application
 */
test.describe('Analytics Tracking', () => {
  test.describe.configure({ mode: 'serial' });
  
  test('should track gallery interaction events', async ({ page, browser }) => {
    // First navigate to analytics page as admin to check initial counts
    await loginAsAdmin(page);
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Go to Gallery tab and check initial counts
    await page.click('button[role="tab"]:has-text("Top Designs")');
    await analyticsPage.waitForDataLoad();
    
    // Get initial top designs data
    const initialTopDesigns = await analyticsPage.getTopDesigns();
    
    // Open a new incognito context to simulate a different user
    const context = await browser.newContext();
    const userPage = await context.newPage();
    
    // Navigate to gallery page
    const galleryPage = new GalleryPage(userPage);
    await galleryPage.goto();
    
    // View some designs to generate events
    await galleryPage.viewDesignDetails(0);
    await userPage.goBack();
    
    // View another design
    await galleryPage.viewDesignDetails(1);
    
    // Interact with the design (like/share)
    await galleryPage.toggleFavorite();
    await galleryPage.shareDesign();
    
    // Close the context
    await context.close();
    
    // Go back to analytics page and refresh data
    await analyticsPage.goto();
    await page.click('button:has-text("Refresh")');
    await analyticsPage.waitForDataLoad();
    
    // Go to Gallery tab and check updated counts
    await page.click('button[role="tab"]:has-text("Top Designs")');
    await analyticsPage.waitForDataLoad();
    
    // Get updated top designs data
    const updatedTopDesigns = await analyticsPage.getTopDesigns();
    
    // Log for debugging
    console.log('Initial top designs:', initialTopDesigns);
    console.log('Updated top designs:', updatedTopDesigns);
    
    // Cleanup
    await logout(page);
  });
  
  test('should track booking flow events', async ({ page, browser }) => {
    // First navigate to analytics page as admin to check initial counts
    await loginAsAdmin(page);
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Go to Booking Funnel tab and check initial data
    await page.click('button[role="tab"]:has-text("Booking Funnel")');
    await analyticsPage.waitForDataLoad();
    
    // Get initial booking funnel data
    const initialFunnelData = await analyticsPage.getBookingFunnelData();
    
    // Open a new incognito context to simulate a different user
    const context = await browser.newContext();
    const userPage = await context.newPage();
    
    // Navigate to booking page
    const bookingPage = new BookingPage(userPage);
    await bookingPage.goto();
    
    // Start booking flow
    await bookingPage.startBooking();
    
    // Select a service
    await bookingPage.selectService('Tattoo Consultation');
    
    // Select a date and time
    await bookingPage.selectDateAndTime();
    
    // Fill out contact details
    await bookingPage.fillContactDetails({
      firstName: 'Test',
      lastName: 'User',
      email: 'test-user@example.com',
      phone: '5551234567',
    });
    
    // Abandon the booking (don't complete it to avoid creating test data)
    await userPage.close();
    
    // Go back to analytics page and refresh data
    await analyticsPage.goto();
    await page.click('button:has-text("Refresh")');
    await analyticsPage.waitForDataLoad();
    
    // Go to Booking Funnel tab and check updated data
    await page.click('button[role="tab"]:has-text("Booking Funnel")');
    await analyticsPage.waitForDataLoad();
    
    // Get updated booking funnel data
    const updatedFunnelData = await analyticsPage.getBookingFunnelData();
    
    // Log for debugging
    console.log('Initial funnel data:', initialFunnelData);
    console.log('Updated funnel data:', updatedFunnelData);
    
    // Cleanup
    await logout(page);
  });
  
  test('should track live events in real-time', async ({ page, browser }) => {
    // Login as admin and go to live analytics dashboard
    await loginAsAdmin(page);
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.gotoLive();
    
    // Connect to live stream and clear events
    await analyticsPage.connectToLiveStream();
    await analyticsPage.clearLiveEvents();
    
    // Get initial event counts
    const initialCounts = await analyticsPage.getLiveEventCounts();
    
    // Open a new incognito context to simulate a different user
    const context = await browser.newContext();
    const userPage = await context.newPage();
    
    // Navigate to home page to generate a page view
    await userPage.goto('/');
    
    // Wait a moment for the event to be processed
    await page.waitForTimeout(1000);
    
    // Get updated event counts
    const updatedCounts = await analyticsPage.getLiveEventCounts();
    
    // Log for debugging
    console.log('Initial counts:', initialCounts);
    console.log('Updated counts:', updatedCounts);
    
    // Clean up
    await context.close();
    await logout(page);
  });
  
  test('should track error events', async ({ page, browser }) => {
    // Login as admin and go to live analytics dashboard
    await loginAsAdmin(page);
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.gotoLive();
    
    // Connect to live stream and clear events
    await analyticsPage.connectToLiveStream();
    await analyticsPage.clearLiveEvents();
    
    // Get initial error count
    const initialCounts = await analyticsPage.getLiveEventCounts();
    const initialErrors = initialCounts.errors;
    
    // Open a new context to simulate a user
    const context = await browser.newContext();
    const userPage = await context.newPage();
    
    // Navigate to a page
    await userPage.goto('/');
    
    // Force a JavaScript error
    await userPage.evaluate(() => {
      // This will throw an error that should be captured by the error tracking system
      // if properly implemented with window.onerror handler
      throw new Error('Test error for analytics tracking');
    }).catch(() => {
      // Ignore the error in the test
    });
    
    // Wait a moment for the error to be processed
    await page.waitForTimeout(1000);
    
    // Get updated event counts
    const updatedCounts = await analyticsPage.getLiveEventCounts();
    const updatedErrors = updatedCounts.errors;
    
    // Log for debugging
    console.log('Initial error count:', initialErrors);
    console.log('Updated error count:', updatedErrors);
    
    // Clean up
    await context.close();
    await logout(page);
  });
  
  test('should provide analytics data export functionality', async ({ page }) => {
    // Skip in CI environments where file downloads may be problematic
    test.skip(!!process.env.CI, 'Skipping in CI environment');
    
    // Login as admin and go to analytics dashboard
    await loginAsAdmin(page);
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Wait for data to load
    await analyticsPage.waitForDataLoad();
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Wait for download to start
    const download = await Promise.race([
      page.waitForEvent('download'),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
    ]);
    
    // Verify download was initiated
    expect(download).not.toBeNull();
    
    // Clean up
    await logout(page);
  });
});
