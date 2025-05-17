/**
 * Analytics page object model
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { ROUTES, SELECTORS } from '../test-constants';

export class AnalyticsPage extends BasePage {
  readonly statsCards: Locator;
  readonly dateRangeSelector: Locator;
  readonly tabsList: Locator;
  readonly refreshButton: Locator;
  readonly exportButton: Locator;
  readonly overviewTab: Locator;
  readonly trafficTab: Locator;
  readonly topDesignsTab: Locator;
  readonly bookingFunnelTab: Locator;
  readonly eventLogTab: Locator;
  
  constructor(page: Page) {
    super(page);
    this.statsCards = page.locator('[data-testid="stats-cards"]');
    this.dateRangeSelector = page.locator('[data-testid="date-range-selector"]');
    this.tabsList = page.locator('[role="tablist"]');
    this.refreshButton = page.locator('button:has-text("Refresh")');
    this.exportButton = page.locator('button:has-text("Export")');
    
    // Tabs
    this.overviewTab = page.locator('button[role="tab"]:has-text("Overview")').first();
    this.trafficTab = page.locator('button[role="tab"]:has-text("Traffic")').first();
    this.topDesignsTab = page.locator('button[role="tab"]:has-text("Top Designs")').first();
    this.bookingFunnelTab = page.locator('button[role="tab"]:has-text("Booking Funnel")').first();
    this.eventLogTab = page.locator('button[role="tab"]:has-text("Event Log")').first();
  }
  
  /**
   * Navigate to the analytics dashboard
   */
  async goto() {
    await super.goto('/admin/analytics');
  }
  
  /**
   * Navigate to the live analytics dashboard
   */
  async gotoLive() {
    await super.goto('/admin/analytics/live');
  }
  
  /**
   * Wait for analytics data to load
   */
  async waitForDataLoad() {
    // Check if the page has a loading indicator
    const loadingIndicator = this.page.locator('[data-testid="loading-indicator"]');
    const hasLoadingIndicator = await loadingIndicator.count() > 0;
    
    if (hasLoadingIndicator) {
      // Wait for loading indicator to disappear
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
    } else {
      // If no loading indicator, wait a short time for data to load
      await this.page.waitForTimeout(2000);
    }
  }
  
  /**
   * Get the page view count from the overview tab
   */
  async getPageViewCount(): Promise<number> {
    // Make sure we're on the overview tab
    await this.overviewTab.click();
    await this.waitForDataLoad();
    
    // Try to find the page views stat
    const pageViewsElement = this.page.locator('[data-testid="stat-page-views"]');
    const hasSpecificElement = await pageViewsElement.count() > 0;
    
    if (hasSpecificElement) {
      const pageViewsText = await pageViewsElement.textContent();
      return parseInt(pageViewsText?.replace(/[^0-9]/g, '') || '0', 10);
    }
    
    // Fallback to checking all stats for page views
    const statElements = await this.page.locator('[data-testid^="stat-"]').all();
    
    for (const element of statElements) {
      const labelElement = await element.locator('.stat-label').all();
      if (labelElement.length > 0) {
        const label = await labelElement[0].textContent();
        if (label?.toLowerCase().includes('page') && label?.toLowerCase().includes('view')) {
          const valueElement = await element.locator('.stat-value').all();
          if (valueElement.length > 0) {
            const value = await valueElement[0].textContent();
            return parseInt(value?.replace(/[^0-9]/g, '') || '0', 10);
          }
        }
      }
    }
    
    // If we can't find it, check for any number in a card
    const cards = await this.statsCards.locator('.card').all();
    for (const card of cards) {
      const title = await card.locator('h3, .card-title').textContent();
      if (title?.toLowerCase().includes('page') && title?.toLowerCase().includes('view')) {
        const valueText = await card.locator('text=/[0-9,]+/').textContent();
        if (valueText) {
          return parseInt(valueText.replace(/[^0-9]/g, '') || '0', 10);
        }
      }
    }
    
    // Return 0 if we can't find it
    return 0;
  }
  
  /**
   * Select a date range from the date range picker
   */
  async selectDateRange(option: 'today' | 'last7days' | 'last30days' | 'last90days' | 'custom') {
    // Open date range picker
    await this.dateRangeSelector.click();
    
    // Different options based on the UI implementation
    switch (option) {
      case 'today':
        await this.page.click('button:has-text("Today")');
        break;
      case 'last7days':
        await this.page.click('button:has-text("Last 7 days")');
        break;
      case 'last30days':
        await this.page.click('button:has-text("Last 30 days")');
        break;
      case 'last90days':
        await this.page.click('button:has-text("Last 90 days")');
        break;
      case 'custom':
        // For custom date range, we'll just select a random date
        // This would need to be adjusted based on your date picker component
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        // Format dates as needed for your date picker
        const fromDate = sevenDaysAgo.getDate().toString();
        const toDate = today.getDate().toString();
        
        // Click on from date
        await this.page.click(`button:has-text("${fromDate}")`);
        
        // Click on to date
        await this.page.click(`button:has-text("${toDate}")`);
        
        // Apply the date range
        await this.page.click('button:has-text("Apply")');
        break;
    }
    
    // Wait for date range to be applied
    await this.waitForDataLoad();
  }
  
  /**
   * Get the total events count
   */
  async getTotalEventsCount(): Promise<number> {
    // Make sure we're on the overview tab
    await this.overviewTab.click();
    await this.waitForDataLoad();
    
    // Try to find the total events stat
    const totalEventsElement = this.page.locator('[data-testid="stat-total-events"]');
    const hasSpecificElement = await totalEventsElement.count() > 0;
    
    if (hasSpecificElement) {
      const totalEventsText = await totalEventsElement.textContent();
      return parseInt(totalEventsText?.replace(/[^0-9]/g, '') || '0', 10);
    }
    
    // Fallback to checking all stats for total events
    const statElements = await this.page.locator('[data-testid^="stat-"]').all();
    
    for (const element of statElements) {
      const labelElement = await element.locator('.stat-label').all();
      if (labelElement.length > 0) {
        const label = await labelElement[0].textContent();
        if (label?.toLowerCase().includes('total') && label?.toLowerCase().includes('event')) {
          const valueElement = await element.locator('.stat-value').all();
          if (valueElement.length > 0) {
            const value = await valueElement[0].textContent();
            return parseInt(value?.replace(/[^0-9]/g, '') || '0', 10);
          }
        }
      }
    }
    
    // If we can't find it, check for any number in a card that might be total events
    const cards = await this.statsCards.locator('.card').all();
    for (const card of cards) {
      const title = await card.locator('h3, .card-title').textContent();
      if (title?.toLowerCase().includes('total') && title?.toLowerCase().includes('event')) {
        const valueText = await card.locator('text=/[0-9,]+/').textContent();
        if (valueText) {
          return parseInt(valueText.replace(/[^0-9]/g, '') || '0', 10);
        }
      }
    }
    
    // Return 0 if we can't find it
    return 0;
  }
  
  /**
   * Get the top designs data
   */
  async getTopDesigns() {
    // Navigate to top designs tab
    await this.topDesignsTab.click();
    await this.waitForDataLoad();
    
    // Get top designs table
    const topDesignsTable = this.page.locator('[data-testid="top-designs-table"]');
    const rows = await topDesignsTable.locator('tbody tr').all();
    
    const topDesigns = [];
    
    for (const row of rows) {
      const cells = await row.locator('td').all();
      
      // Skip if we don't have enough cells
      if (cells.length < 3) continue;
      
      // Extract data from cells
      const designName = await cells[0].textContent();
      const views = await cells[1].textContent();
      const interactions = await cells[2].textContent();
      
      topDesigns.push({
        name: designName?.trim(),
        views: parseInt(views?.replace(/[^0-9]/g, '') || '0', 10),
        interactions: parseInt(interactions?.replace(/[^0-9]/g, '') || '0', 10),
      });
    }
    
    return topDesigns;
  }
  
  /**
   * Get booking funnel data
   */
  async getBookingFunnelData() {
    // Navigate to booking funnel tab
    await this.bookingFunnelTab.click();
    await this.waitForDataLoad();
    
    // Get funnel stats
    const completionRateElement = this.page.locator('[data-testid="completion-rate"]');
    const abandonmentRateElement = this.page.locator('[data-testid="abandonment-rate"]');
    const totalBookingsElement = this.page.locator('[data-testid="total-bookings"]');
    
    const completionRate = await completionRateElement.count() > 0 
      ? parseFloat((await completionRateElement.textContent() || '0').replace(/[^0-9.]/g, ''))
      : 0;
      
    const abandonmentRate = await abandonmentRateElement.count() > 0
      ? parseFloat((await abandonmentRateElement.textContent() || '0').replace(/[^0-9.]/g, ''))
      : 0;
      
    const totalBookings = await totalBookingsElement.count() > 0
      ? parseInt((await totalBookingsElement.textContent() || '0').replace(/[^0-9]/g, ''))
      : 0;
    
    // Get funnel steps data
    const funnelStepsTable = this.page.locator('[data-testid="funnel-steps-table"]');
    const rows = await funnelStepsTable.locator('tbody tr').all();
    
    const funnelSteps = [];
    
    for (const row of rows) {
      const cells = await row.locator('td').all();
      
      // Skip if we don't have enough cells
      if (cells.length < 3) continue;
      
      // Extract data from cells
      const stepName = await cells[0].textContent();
      const conversionRate = await cells[1].textContent();
      const avgTime = await cells[2].textContent();
      
      funnelSteps.push({
        step: stepName?.trim(),
        conversionRate: parseFloat(conversionRate?.replace(/[^0-9.]/g, '') || '0'),
        averageTime: avgTime?.trim(),
      });
    }
    
    return {
      stats: {
        completionRate,
        abandonmentRate,
        totalBookings,
      },
      steps: funnelSteps,
    };
  }
  
  /**
   * Connect to live analytics stream
   */
  async connectToLiveStream() {
    await this.gotoLive();
    
    // Check connection status
    const connectionStatus = this.page.locator('[data-testid="connection-status"]');
    const statusText = await connectionStatus.textContent();
    
    // If disconnected, connect
    if (statusText?.includes('Disconnected')) {
      await this.page.click('button:has-text("Connect")');
      
      // Wait for connection
      await expect(connectionStatus).toContainText('Connected', { timeout: 5000 });
    }
    
    // Verify connected
    await expect(connectionStatus).toContainText('Connected');
  }
  
  /**
   * Disconnect from live analytics stream
   */
  async disconnectFromLiveStream() {
    await this.gotoLive();
    
    // Check connection status
    const connectionStatus = this.page.locator('[data-testid="connection-status"]');
    const statusText = await connectionStatus.textContent();
    
    // If connected, disconnect
    if (statusText?.includes('Connected')) {
      await this.page.click('button:has-text("Disconnect")');
      
      // Wait for disconnection
      await expect(connectionStatus).toContainText('Disconnected', { timeout: 5000 });
    }
    
    // Verify disconnected
    await expect(connectionStatus).toContainText('Disconnected');
  }
  
  /**
   * Get live event counts
   */
  async getLiveEventCounts() {
    await this.gotoLive();
    
    // Make sure we're connected
    await this.connectToLiveStream();
    
    // Get event counts
    const totalEventsElement = this.page.locator('text=/Total Events/i').first();
    const pageViewsElement = this.page.locator('text=/Page Views/i').first();
    const conversionsElement = this.page.locator('text=/Conversions/i').first();
    const errorsElement = this.page.locator('text=/Errors/i').first();
    
    // Extract numeric values
    const totalEvents = await totalEventsElement.count() > 0
      ? parseInt((await totalEventsElement.locator('xpath=../..').locator('text=/[0-9,]+/').textContent() || '0').replace(/[^0-9]/g, ''))
      : 0;
      
    const pageViews = await pageViewsElement.count() > 0
      ? parseInt((await pageViewsElement.locator('xpath=../..').locator('text=/[0-9,]+/').textContent() || '0').replace(/[^0-9]/g, ''))
      : 0;
      
    const conversions = await conversionsElement.count() > 0
      ? parseInt((await conversionsElement.locator('xpath=../..').locator('text=/[0-9,]+/').textContent() || '0').replace(/[^0-9]/g, ''))
      : 0;
      
    const errors = await errorsElement.count() > 0
      ? parseInt((await errorsElement.locator('xpath=../..').locator('text=/[0-9,]+/').textContent() || '0').replace(/[^0-9]/g, ''))
      : 0;
    
    return {
      totalEvents,
      pageViews,
      conversions,
      errors,
    };
  }
  
  /**
   * Clear live events
   */
  async clearLiveEvents() {
    await this.gotoLive();
    
    // Make sure we're connected
    await this.connectToLiveStream();
    
    // Click clear events button
    await this.page.click('button:has-text("Clear Events")');
    
    // Wait for events to clear
    await this.page.waitForTimeout(1000);
  }
}
