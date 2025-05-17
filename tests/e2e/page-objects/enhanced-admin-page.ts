import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';

/**
 * Enhanced Admin Page Object for E2E tests
 * Provides comprehensive functionality for testing the admin dashboard
 */
export class EnhancedAdminPage extends BasePage {
  // Navigation elements
  readonly header: Locator;
  readonly sidebar: Locator;
  readonly sidebarLinks: Locator;
  readonly breadcrumbs: Locator;
  readonly userMenu: Locator;
  readonly userMenuDropdown: Locator;
  readonly notificationsButton: Locator;
  readonly notificationsPanel: Locator;
  readonly mobileMenuButton: Locator;

  // Dashboard elements
  readonly pageTitle: Locator;
  readonly dashboardCards: Locator;
  readonly statsCards: Locator;
  readonly charts: Locator;
  readonly recentActivity: Locator;
  readonly todayAppointments: Locator;
  readonly upcomingAppointments: Locator;
  readonly alerts: Locator;
  readonly quickActions: Locator;

  // Search and filter elements
  readonly searchBar: Locator;
  readonly filterDropdown: Locator;
  readonly dateRangePicker: Locator;
  readonly sortOptions: Locator;
  readonly refreshButton: Locator;

  // Table elements
  readonly dataTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly tablePagination: Locator;
  readonly itemsPerPageSelector: Locator;
  readonly tableActionButtons: Locator;

  // Modal elements
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly modalContent: Locator;
  readonly modalClose: Locator;
  readonly modalActionButtons: Locator;

  // Form elements
  readonly formContainer: Locator;
  readonly formFields: Locator;
  readonly formSubmitButton: Locator;
  readonly formCancelButton: Locator;
  readonly formErrorMessages: Locator;
  readonly formSuccessMessage: Locator;

  // Visual testing
  private visualTesting: VisualTesting | null = null;

  constructor(page: Page) {
    super(page);

    // Initialize navigation locators
    this.header = page.locator('header, .app-header');
    this.sidebar = page.locator('aside, .sidebar, nav.admin-nav');
    this.sidebarLinks = page.locator('aside a, .sidebar a, nav.admin-nav a');
    this.breadcrumbs = page.locator('nav[aria-label="Breadcrumb"], .breadcrumbs');
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu');
    this.userMenuDropdown = page.locator('[data-testid="user-menu-dropdown"], .user-menu-dropdown');
    this.notificationsButton = page.locator('[data-testid="notifications-button"], button:has([data-testid="notifications-icon"])');
    this.notificationsPanel = page.locator('[data-testid="notifications-panel"], .notifications-panel');
    this.mobileMenuButton = page.locator('button[aria-label="Toggle menu"], .mobile-menu-button');

    // Initialize dashboard locators
    this.pageTitle = page.locator('h1, .page-title');
    this.dashboardCards = page.locator('.dashboard-card, [data-testid="dashboard-card"]');
    this.statsCards = page.locator('.stats-card, [data-testid="stats-card"]');
    this.charts = page.locator('.chart-container, [data-testid="chart"]');
    this.recentActivity = page.locator('.recent-activity, [data-testid="recent-activity"]');
    this.todayAppointments = page.locator('.today-appointments, [data-testid="today-appointments"]');
    this.upcomingAppointments = page.locator('.upcoming-appointments, [data-testid="upcoming-appointments"]');
    this.alerts = page.locator('.alert, [role="alert"]');
    this.quickActions = page.locator('.quick-actions, [data-testid="quick-actions"]');

    // Initialize search and filter locators
    this.searchBar = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]');
    this.filterDropdown = page.locator('[data-testid="filter-dropdown"], .filter-dropdown');
    this.dateRangePicker = page.locator('.date-range-picker, [data-testid="date-range-picker"]');
    this.sortOptions = page.locator('[data-testid="sort-options"], .sort-options');
    this.refreshButton = page.locator('button:has([data-testid="refresh-icon"]), button[aria-label="Refresh"]');

    // Initialize table locators
    this.dataTable = page.locator('table, [role="table"], [data-testid="data-table"]');
    this.tableHeaders = page.locator('th, [role="columnheader"]');
    this.tableRows = page.locator('tr:not(:first-child), [role="row"]:not(:first-child)');
    this.tablePagination = page.locator('.pagination, [data-testid="pagination"]');
    this.itemsPerPageSelector = page.locator('[data-testid="items-per-page"], .items-per-page-selector');
    this.tableActionButtons = page.locator('tr button, [role="row"] button');

    // Initialize modal locators
    this.modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]');
    this.modalTitle = page.locator('[role="dialog"] h2, .modal-title, [data-testid="modal-title"]');
    this.modalContent = page.locator('[role="dialog"] .content, .modal-content, [data-testid="modal-content"]');
    this.modalClose = page.locator('[role="dialog"] button[aria-label="Close"], .modal-close, [data-testid="modal-close"]');
    this.modalActionButtons = page.locator('[role="dialog"] .actions button, .modal-actions button, [data-testid="modal-actions"] button');

    // Initialize form locators
    this.formContainer = page.locator('form, [role="form"], .form-container');
    this.formFields = page.locator('form input, form select, form textarea, [role="form"] input, [role="form"] select, [role="form"] textarea');
    this.formSubmitButton = page.locator('form button[type="submit"], [role="form"] button[type="submit"], button:has-text("Save"), button:has-text("Submit")');
    this.formCancelButton = page.locator('form button[type="button"]:has-text("Cancel"), [role="form"] button:has-text("Cancel")');
    this.formErrorMessages = page.locator('form [role="alert"], [role="form"] [role="alert"], .error-message, .form-error');
    this.formSuccessMessage = page.locator('[role="status"], .success-message, .form-success');
  }

  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedAdminPage {
    this.visualTesting = visualTesting;
    return this;
  }

  /**
   * Navigate to admin dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/admin');
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_dashboard_initial');
    }
  }

  /**
   * Navigate to a specific admin section
   * @param section Section name to navigate to
   */
  async navigateToSection(section: string): Promise<void> {
    // Find section link in sidebar
    const sectionLink = this.sidebarLinks.filter({ hasText: section }).first();

    // Click on section link
    await sectionLink.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`admin_${section.toLowerCase()}_section`);
    }
  }

  /**
   * Verify that the admin dashboard is loaded correctly
   */
  async verifyAdminDashboard(): Promise<void> {
    // Verify key elements are visible
    await expect(this.header).toBeVisible();
    await expect(this.sidebar).toBeVisible();
    await expect(this.pageTitle).toBeVisible();

    // Verify at least one dashboard card is visible
    const hasCards = await this.dashboardCards.count() > 0;
    expect(hasCards).toBe(true, 'Dashboard should display at least one card');

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_dashboard_verification');
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<Record<string, string>> {
    const stats: Record<string, string> = {};

    // Get stats from dashboard cards
    const statsCards = await this.statsCards.all();
    for (const card of statsCards) {
      const titleElement = await card.locator('h3, .card-title').first();
      const valueElement = await card.locator('.value, .card-value').first();

      if (titleElement && valueElement) {
        const title = await titleElement.textContent() || '';
        const value = await valueElement.textContent() || '';
        stats[title.trim()] = value.trim();
      }
    }

    return stats;
  }

  /**
   * Search for items in the admin panel
   * @param searchTerm Term to search for
   */
  async search(searchTerm: string): Promise<void> {
    // Check if search bar exists
    if (await this.searchBar.count() > 0) {
      // Clear existing search
      await this.searchBar.fill('');

      // Enter search term
      await this.searchBar.fill(searchTerm);

      // Press Enter to search
      await this.searchBar.press('Enter');

      // Wait for search results
      await this.page.waitForTimeout(1000);

      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`admin_search_${searchTerm.toLowerCase()}`);
      }
    } else {
      console.warn('Search bar not found in admin panel');
    }
  }

  /**
   * Apply a filter on the admin panel
   * @param filterName Name of the filter to apply
   * @param filterValue Value to filter by
   */
  async applyFilter(filterName: string, filterValue: string): Promise<void> {
    // Click on filter dropdown
    await this.filterDropdown.click();

    // Select specified filter
    const filterOption = this.page.locator(`[data-value="${filterValue}"], :text("${filterValue}")`).first();
    await filterOption.click();

    // Wait for filter to apply
    await this.page.waitForTimeout(1000);

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`admin_filter_${filterName}_${filterValue}`);
    }
  }

  /**
   * Select a date range
   * @param startDate Start date in YYYY-MM-DD format
   * @param endDate End date in YYYY-MM-DD format
   */
  async selectDateRange(startDate: string, endDate: string): Promise<void> {
    // Click on date range picker to open it
    await this.dateRangePicker.click();

    // Enter start date
    const startDateInput = this.page.locator('[placeholder="Start date"], input[name="startDate"]').first();
    await startDateInput.fill(startDate);

    // Enter end date
    const endDateInput = this.page.locator('[placeholder="End date"], input[name="endDate"]').first();
    await endDateInput.fill(endDate);

    // Click apply button
    await this.page.locator('button:has-text("Apply")').click();

    // Wait for data to update
    await this.page.waitForTimeout(1000);

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`admin_date_range_${startDate}_${endDate}`);
    }
  }

  /**
   * Get the total number of rows in the data table
   */
  async getTableRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * Get table headers
   */
  async getTableHeaders(): Promise<string[]> {
    const headers: string[] = [];

    const headerElements = await this.tableHeaders.all();
    for (const header of headerElements) {
      const text = await header.textContent();
      if (text) {
        headers.push(text.trim());
      }
    }

    return headers;
  }

  /**
   * Get data from a specific table row
   * @param rowIndex Index of the row to get data from (0-based)
   */
  async getRowData(rowIndex: number): Promise<Record<string, string>> {
    const rowData: Record<string, string> = {};

    // Get headers for column names
    const headers = await this.getTableHeaders();

    // Get cells in the specified row
    const row = this.tableRows.nth(rowIndex);
    const cells = await row.locator('td, [role="cell"]').all();

    // Map cell values to headers
    for (let i = 0; i < Math.min(headers.length, cells.length); i++) {
      const text = await cells[i].textContent();
      rowData[headers[i]] = text ? text.trim() : '';
    }

    return rowData;
  }

  /**
   * Click on an action button for a specific row
   * @param rowIndex Index of the row (0-based)
   * @param actionName Name or text of the action button (e.g., "Edit", "Delete")
   */
  async clickRowAction(rowIndex: number, actionName: string): Promise<void> {
    // Get row by index
    const row = this.tableRows.nth(rowIndex);

    // Find and click action button
    const actionButton = row.locator(`button:has-text("${actionName}"), button[aria-label="${actionName}"]`).first();
    await actionButton.click();

    // Wait for action to complete (modal to appear or page to change)
    await this.page.waitForTimeout(500);

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`admin_row_${rowIndex}_${actionName.toLowerCase()}`);
    }
  }

  /**
   * Create a new item (customer, service, appointment, etc.)
   */
  async clickCreateNew(): Promise<void> {
    // Look for create new button with various common patterns
    const createButton = this.page.locator('button:has-text("Create"), button:has-text("Add New"), button:has-text("New")').first();
    
    // Click create button
    await createButton.click();
    
    // Wait for modal or form to appear
    await this.page.waitForTimeout(500);
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_create_new_form');
    }
  }

  /**
   * Fill a form field
   * @param fieldName Name of the field
   * @param value Value to fill
   */
  async fillFormField(fieldName: string, value: string): Promise<void> {
    // Try different selector strategies to find the field
    const fieldSelectors = [
      `input[name="${fieldName}"]`,
      `textarea[name="${fieldName}"]`,
      `select[name="${fieldName}"]`,
      `input[id="${fieldName}"]`,
      `textarea[id="${fieldName}"]`,
      `select[id="${fieldName}"]`,
      `[data-testid="${fieldName}"]`,
      `label:has-text("${fieldName}") + input`,
      `label:has-text("${fieldName}") + textarea`,
      `label:has-text("${fieldName}") + select`,
    ];

    // Try each selector until a field is found
    let field = null;
    for (const selector of fieldSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        field = element;
        break;
      }
    }

    if (!field) {
      throw new Error(`Form field "${fieldName}" not found`);
    }

    // Fill the field based on its type
    const tagName = await field.evaluate(el => el.tagName.toLowerCase());
    
    if (tagName === 'select') {
      // Select option from dropdown
      await field.selectOption(value);
    } else if (tagName === 'textarea') {
      // Fill textarea
      await field.fill(value);
    } else {
      // Check input type
      const inputType = await field.getAttribute('type');
      
      if (inputType === 'checkbox') {
        // Toggle checkbox based on value
        const isChecked = await field.isChecked();
        if ((value === 'true' && !isChecked) || (value === 'false' && isChecked)) {
          await field.click();
        }
      } else if (inputType === 'radio') {
        // Select radio button
        await this.page.locator(`input[name="${fieldName}"][value="${value}"]`).click();
      } else if (inputType === 'date') {
        // Fill date input
        await field.fill(value);
      } else {
        // Fill regular input
        await field.fill(value);
      }
    }
  }

  /**
   * Submit form
   */
  async submitForm(): Promise<void> {
    // Take screenshot before submission if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_before_form_submit');
    }

    // Click submit button
    await this.formSubmitButton.click();

    // Wait for submission to complete
    await this.page.waitForTimeout(1000);

    // Take screenshot after submission if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_after_form_submit');
    }
  }

  /**
   * Check if form submission was successful
   */
  async isFormSubmissionSuccessful(): Promise<boolean> {
    try {
      // Check for success message
      await this.formSuccessMessage.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      // Check if there are form errors
      const hasErrors = await this.formErrorMessages.count() > 0;
      return !hasErrors;
    }
  }

  /**
   * Get form error messages
   */
  async getFormErrors(): Promise<string[]> {
    const errors: string[] = [];

    const errorElements = await this.formErrorMessages.all();
    for (const errorElement of errorElements) {
      const text = await errorElement.textContent();
      if (text) {
        errors.push(text.trim());
      }
    }

    return errors;
  }

  /**
   * Close modal if open
   */
  async closeModal(): Promise<void> {
    // Check if modal is visible
    if (await this.modal.isVisible()) {
      // Click close button
      await this.modalClose.click();

      // Wait for modal to close
      await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
    }
  }

  /**
   * Log out from admin dashboard
   */
  async logout(): Promise<void> {
    // Click on user menu to open dropdown
    await this.userMenu.click();

    // Wait for dropdown to appear
    await this.userMenuDropdown.waitFor({ state: 'visible' });

    // Click on logout button
    await this.page.locator('text=Logout, text=Sign Out').click();

    // Wait for logout to complete
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_after_logout');
    }
  }

  /**
   * Check for notifications
   */
  async checkNotifications(): Promise<string[]> {
    const notifications: string[] = [];

    // Click notifications button
    await this.notificationsButton.click();

    // Wait for notifications panel to appear
    await this.notificationsPanel.waitFor({ state: 'visible' });

    // Get notification items
    const notificationItems = this.notificationsPanel.locator('.notification-item, [data-testid="notification-item"]');
    const count = await notificationItems.count();

    // Extract notification text
    for (let i = 0; i < count; i++) {
      const text = await notificationItems.nth(i).textContent();
      if (text) {
        notifications.push(text.trim());
      }
    }

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_notifications_panel');
    }

    // Close notifications panel
    await this.page.keyboard.press('Escape');

    return notifications;
  }

  /**
   * Get chart data (approximate values from UI)
   * @param chartIndex Index of chart to get data from (0-based)
   */
  async getChartData(chartIndex: number = 0): Promise<Record<string, unknown>> {
    // Get chart element
    const chartElement = this.charts.nth(chartIndex);

    // Check if chart exists
    if (await chartElement.count() === 0) {
      throw new Error(`Chart with index ${chartIndex} not found`);
    }

    // Extract chart data using chart attributes and accessible elements
    // This is a simple approximation - actual data extraction would depend on the charting library used
    const chartData: Record<string, unknown> = {
      title: await chartElement.locator('h3, .chart-title').textContent() || 'Unknown Chart',
      hasLegend: await chartElement.locator('.legend, [role="legend"]').count() > 0,
      hasTooltip: await chartElement.locator('.tooltip, [role="tooltip"]').count() > 0,
    };

    // Take screenshot of the chart for visual testing
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`admin_chart_${chartIndex}`, chartElement);
    }

    return chartData;
  }

  /**
   * Test pagination
   */
  async testPagination(): Promise<void> {
    // Check if pagination exists
    if (await this.tablePagination.count() === 0) {
      console.log('Pagination not found, skipping pagination test');
      return;
    }

    // Get next page button
    const nextButton = this.tablePagination.locator('button[aria-label="Next page"], button:has-text("Next")');

    // Check if next button is enabled
    if (await nextButton.isEnabled()) {
      // Get data from first page
      const firstPageRows = await this.getTableRowCount();

      // Take screenshot of first page if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot('admin_pagination_page1');
      }

      // Click next page
      await nextButton.click();
      await this.page.waitForTimeout(1000);

      // Take screenshot of second page if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot('admin_pagination_page2');
      }

      // Get data from second page
      const secondPageRows = await this.getTableRowCount();

      // Log results
      console.log(`Pagination test: First page had ${firstPageRows} rows, second page has ${secondPageRows} rows`);

      // Go back to first page
      const prevButton = this.tablePagination.locator('button[aria-label="Previous page"], button:has-text("Previous")');
      await prevButton.click();
      await this.page.waitForTimeout(1000);
    } else {
      console.log('Next page button is disabled, pagination has only one page');
    }
  }

  /**
   * Check responsive layout of admin dashboard
   */
  async checkResponsiveness(): Promise<void> {
    // Test desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_desktop');
    }
    
    // Test tablet
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_tablet');
    }
    
    // Test mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    
    // Wait for mobile menu button to appear
    await this.mobileMenuButton.waitFor({ state: 'visible' });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_mobile');
    }
    
    // Click mobile menu button to open sidebar
    await this.mobileMenuButton.click();
    
    // Take screenshot with sidebar open if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_mobile_sidebar_open');
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    await this.page.reload();
  }
}
