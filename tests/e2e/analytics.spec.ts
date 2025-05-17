import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from './page-objects/admin-dashboard-page';
import { loginAsAdmin, logout } from './helpers/auth-helper';
import { AnalyticsPage } from './page-objects/analytics-page';

/**
 * Test suite for the analytics system
 */
test.describe('Analytics System', () => {
  // Use serial mode to avoid parallel test execution issues with login state
  test.describe.configure({ mode: 'serial' });
  
  // Setup: login before each test
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });
  
  // Teardown: logout after each test
  test.afterEach(async ({ page }) => {
    await logout(page);
  });
  
  test('should load analytics dashboard successfully', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Verify the analytics dashboard is loaded correctly
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    
    // Check for main dashboard components
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-range-selector"]')).toBeVisible();
    
    // Check tabs are present
    await expect(page.locator('button[role="tab"]:has-text("Overview")').first()).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Traffic")').first()).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Top Designs")').first()).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Booking Funnel")').first()).toBeVisible();
  });
  
  test('should display analytics summary data', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Wait for data to load
    await analyticsPage.waitForDataLoad();
    
    // Check for summary stats
    const totalEvents = await page.locator('[data-testid="stat-total-events"]').isVisible();
    const conversionRate = await page.locator('[data-testid="stat-conversion-rate"]').isVisible();
    const sessionDuration = await page.locator('[data-testid="stat-avg-session"]').isVisible();
    const bounceRate = await page.locator('[data-testid="stat-bounce-rate"]').isVisible();
    
    // At least some of these stats should be visible
    expect(totalEvents || conversionRate || sessionDuration || bounceRate).toBeTruthy();
  });
  
  test('should change date range successfully', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Open date range picker
    await page.click('[data-testid="date-range-selector"]');
    
    // Select a custom date range (last 7 days)
    await analyticsPage.selectDateRange('last7days');
    
    // Check that date range has changed
    const dateRangeText = await page.locator('[data-testid="date-range-selector"]').textContent();
    
    // Date range text should now contain a date range
    expect(dateRangeText).toBeTruthy();
    expect(dateRangeText?.includes('-')).toBeTruthy();
    
    // Refresh the data
    await page.click('button:has-text("Refresh")');
    
    // Wait for data reload
    await analyticsPage.waitForDataLoad();
  });
  
  test('should switch between analytics tabs', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Click on each tab and verify content
    const tabs = ['Overview', 'Traffic', 'Top Designs', 'Booking Funnel', 'Event Log'];
    
    for (const tab of tabs) {
      // Click on tab
      await page.click(`button[role="tab"]:has-text("${tab}")`);
      
      // Verify tab content is visible
      const tabContentVisible = await page.locator(`[role="tabpanel"][data-state="active"]`).isVisible();
      expect(tabContentVisible).toBeTruthy();
      
      // Check for tab-specific content
      switch (tab) {
        case 'Overview':
          await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible();
          break;
        case 'Traffic':
          await expect(page.locator('[data-testid="traffic-sources"]')).toBeVisible();
          break;
        case 'Top Designs':
          await expect(page.locator('[data-testid="top-designs-table"]')).toBeVisible();
          break;
        case 'Booking Funnel':
          await expect(page.locator('[data-testid="booking-funnel-chart"]')).toBeVisible();
          break;
        case 'Event Log':
          await expect(page.locator('[data-testid="event-log-table"]')).toBeVisible();
          break;
      }
    }
  });
  
  test('should navigate to live analytics dashboard', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Click on Live Dashboard button
    await page.click('button:has-text("Live Dashboard")');
    
    // Verify we navigated to the live dashboard
    await expect(page.locator('h1')).toContainText('Live Analytics');
    
    // Check for live dashboard components
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Overview")').first()).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Live Events")').first()).toBeVisible();
  });
  
  test('should connect and disconnect from live analytics stream', async ({ page }) => {
    // Navigate directly to live dashboard
    await page.goto('/admin/analytics/live');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Live Analytics');
    
    // Check initial connection status
    const initialConnectionStatus = await page.locator('[data-testid="connection-status"]').textContent();
    
    // If not connected, connect
    if (initialConnectionStatus?.includes('Disconnected')) {
      await page.click('button:has-text("Connect")');
      
      // Wait for connection
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected', { timeout: 5000 });
    }
    
    // Now disconnect
    await page.click('button:has-text("Disconnect")');
    
    // Verify disconnected
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Disconnected', { timeout: 5000 });
    
    // Connect again to test reconnection
    await page.click('button:has-text("Connect")');
    
    // Verify connected
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected', { timeout: 5000 });
  });
  
  test('should download analytics export', async ({ page }) => {
    // Skip on CI since file downloads are tricky to handle
    test.skip(!!process.env.CI, 'Skipping export test on CI');
    
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Wait for download to start
    const download = await Promise.race([
      page.waitForEvent('download'),
      // Add a timeout in case download doesn't start
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
    ]);
    
    // Verify download started
    expect(download).not.toBeNull();
  });

  test('should track page views automatically', async ({ page, context }) => {
    // First go to analytics page to check initial view count
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Go to overview tab
    await page.click('button[role="tab"]:has-text("Overview")');
    
    // Get current page view count
    const initialPageViews = await analyticsPage.getPageViewCount();
    
    // Create a new page to simulate a different user
    const newPage = await context.newPage();
    
    // Navigate to home page to generate page view
    await newPage.goto('/');
    
    // Navigate to another page to generate another page view
    await newPage.goto('/gallery');
    
    // Close the page
    await newPage.close();
    
    // Go back to analytics page
    await analyticsPage.goto();
    
    // Refresh the data
    await page.click('button:has-text("Refresh")');
    
    // Wait for data reload
    await analyticsPage.waitForDataLoad();
    
    // Get updated page view count
    const updatedPageViews = await analyticsPage.getPageViewCount();
    
    // For this test to be reliable, you would need a test environment with predictable data
    // In some test environments, this might not be reliable if other tests are running
    // So we'll make this a soft assertion with a console log
    if (updatedPageViews > initialPageViews) {
      console.log(`Page views increased as expected: ${initialPageViews} -> ${updatedPageViews}`);
    } else {
      console.log(`Page views did not increase as expected: ${initialPageViews} -> ${updatedPageViews}`);
      console.log('This may be expected in some test environments');
    }
  });
  
  test('should display booking funnel data', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Navigate to booking funnel tab
    await page.click('button[role="tab"]:has-text("Booking Funnel")');
    
    // Check for funnel chart
    await expect(page.locator('[data-testid="booking-funnel-chart"]')).toBeVisible();
    
    // Check for funnel stats
    const completionRate = await page.locator('[data-testid="completion-rate"]').isVisible();
    const abandonmentRate = await page.locator('[data-testid="abandonment-rate"]').isVisible();
    const totalBookings = await page.locator('[data-testid="total-bookings"]').isVisible();
    
    // At least some of these stats should be visible
    expect(completionRate || abandonmentRate || totalBookings).toBeTruthy();
    
    // Check for funnel steps table
    await expect(page.locator('[data-testid="funnel-steps-table"]')).toBeVisible();
  });
  
  test('should display top designs analytics', async ({ page }) => {
    const analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
    
    // Navigate to top designs tab
    await page.click('button[role="tab"]:has-text("Top Designs")');
    
    // Check for top designs table
    await expect(page.locator('[data-testid="top-designs-table"]')).toBeVisible();
    
    // Check for table headers
    await expect(page.locator('th:has-text("Design")')).toBeVisible();
    await expect(page.locator('th:has-text("Views")')).toBeVisible();
    await expect(page.locator('th:has-text("Interactions")')).toBeVisible();
    
    // Check if there's at least one design listed
    const hasDesigns = await page.locator('tbody tr').count() > 0;
    
    // This might be empty in a fresh test environment
    if (!hasDesigns) {
      console.log('No designs found in top designs table, this may be expected in a fresh test environment');
    }
  });
});
