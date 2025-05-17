/**
 * Admin Dashboard page object model
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { ROUTES, SELECTORS } from '../test-constants';

export class AdminDashboardPage extends BasePage {
  readonly sideNav: Locator;
  readonly dashboardCards: Locator;
  readonly statsSection: Locator;
  readonly upcomingAppointmentsSection: Locator;
  readonly recentBookingsSection: Locator;
  readonly customerListSection: Locator;
  readonly searchInput: Locator;
  
  constructor(page: Page) {
    super(page);
    this.sideNav = page.locator('[data-testid="admin-sidebar"]');
    this.dashboardCards = page.locator('[data-testid="dashboard-card"]');
    this.statsSection = page.locator('[data-testid="stats-section"]');
    this.upcomingAppointmentsSection = page.locator('[data-testid="upcoming-appointments"]');
    this.recentBookingsSection = page.locator('[data-testid="recent-bookings"]');
    this.customerListSection = page.locator('[data-testid="customer-list"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');
  }
  
  /**
   * Navigate to the admin dashboard
   */
  async goto() {
    await super.goto(ROUTES.admin.dashboard);
  }
  
  /**
   * Navigate to a specific section of the admin dashboard
   * @param section Section name to navigate to (customers, appointments, etc.)
   */
  async navigateToSection(section: keyof typeof ROUTES.admin) {
    await super.goto(ROUTES.admin[section]);
  }
  
  /**
   * Verify the admin dashboard is loaded correctly
   */
  async verifyDashboard() {
    await expect(this.sideNav).toBeVisible();
    await expect(this.dashboardCards).toBeVisible();
    
    // Check dashboard cards count
    const cardsCount = await this.dashboardCards.count();
    expect(cardsCount).toBeGreaterThan(0);
  }
  
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const stats = {};
    const statElements = await this.statsSection.locator('[data-testid="stat-item"]').all();
    
    for (const elem of statElements) {
      const label = await elem.locator('.stat-label').textContent();
      const value = await elem.locator('.stat-value').textContent();
      
      if (label && value) {
        stats[label.trim()] = value.trim();
      }
    }
    
    return stats;
  }
  
  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments() {
    const appointments = [];
    const appointmentRows = await this.upcomingAppointmentsSection.locator('tr').all();
    
    // Skip header row
    for (let i = 1; i < appointmentRows.length; i++) {
      const row = appointmentRows[i];
      const cells = await row.locator('td').all();
      
      if (cells.length >= 3) {
        const date = await cells[0].textContent();
        const customer = await cells[1].textContent();
        const service = await cells[2].textContent();
        
        appointments.push({
          date: date?.trim(),
          customer: customer?.trim(),
          service: service?.trim()
        });
      }
    }
    
    return appointments;
  }
  
  /**
   * Search for a customer or appointment
   * @param searchTerm Search term
   */
  async search(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.searchInput.press('Enter');
    await this.waitForPageLoad();
  }
  
  /**
   * Create a new appointment
   * @param appointmentData Appointment data
   */
  async createNewAppointment(appointmentData: Record<string, string>) {
    // Navigate to appointments page
    await this.navigateToSection('appointments');
    
    // Click create new button
    await this.page.click('button:has-text("New Appointment")');
    
    // Wait for modal to appear
    const modal = this.page.locator(SELECTORS.modal);
    await expect(modal).toBeVisible();
    
    // Fill in appointment form
    for (const [field, value] of Object.entries(appointmentData)) {
      if (field === 'customer') {
        // Select customer from dropdown
        await modal.locator('select[name="customerId"]').selectOption({ label: value });
      } else if (field === 'date') {
        // Fill in date field
        await modal.locator('input[name="date"]').fill(value);
      } else if (field === 'time') {
        // Fill in time field
        await modal.locator('input[name="time"]').fill(value);
      } else {
        // Fill in other fields
        await modal.locator(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`).fill(value);
      }
    }
    
    // Submit form
    await modal.locator('button[type="submit"]').click();
    await this.waitForPageLoad();
    
    // Check for success notification
    const toast = this.page.locator(SELECTORS.toast);
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('created');
  }
  
  /**
   * Create a new customer
   * @param customerData Customer data
   */
  async createNewCustomer(customerData: Record<string, string>) {
    // Navigate to customers page
    await this.navigateToSection('customers');
    
    // Click create new button
    await this.page.click('button:has-text("New Customer")');
    
    // Wait for modal to appear
    const modal = this.page.locator(SELECTORS.modal);
    await expect(modal).toBeVisible();
    
    // Fill in customer form
    for (const [field, value] of Object.entries(customerData)) {
      // Fill in fields
      await modal.locator(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`).fill(value);
    }
    
    // Submit form
    await modal.locator('button[type="submit"]').click();
    await this.waitForPageLoad();
    
    // Check for success notification
    const toast = this.page.locator(SELECTORS.toast);
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('created');
  }
  
  /**
   * Delete a customer
   * @param customerName Name of the customer to delete
   */
  async deleteCustomer(customerName: string) {
    // Navigate to customers page
    await this.navigateToSection('customers');
    
    // Search for the customer
    await this.search(customerName);
    
    // Click action menu for the customer
    await this.page.click(`tr:has-text("${customerName}") button[aria-label="Actions"]`);
    
    // Click delete option
    await this.page.click('button:has-text("Delete")');
    
    // Confirm deletion in dialog
    await this.page.click(SELECTORS.button('Confirm'));
    await this.waitForPageLoad();
    
    // Check for success notification
    const toast = this.page.locator(SELECTORS.toast);
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('deleted');
  }
  
  /**
   * Test filtering functionality
   * @param filterType Type of filter to test
   * @param filterValue Value to filter by
   */
  async testFiltering(filterType: string, filterValue: string) {
    // Apply filter
    await this.page.click(`button:has-text("Filter")`);
    
    // Select filter type
    await this.page.selectOption('select[aria-label="Filter type"]', filterType);
    
    // Enter filter value
    await this.page.fill('input[aria-label="Filter value"]', filterValue);
    
    // Apply filter
    await this.page.click(SELECTORS.button('Apply'));
    await this.waitForPageLoad();
    
    // Check if results contain the filter value
    const results = await this.page.locator('table tbody tr').count();
    expect(results).toBeGreaterThan(0);
    
    // Check first result contains filter value
    const firstResult = await this.page.locator('table tbody tr').first();
    await expect(firstResult).toContainText(filterValue);
  }
  
  /**
   * Test export functionality
   * @param exportType Type of export (CSV, PDF, etc.)
   */
  async testExport(exportType: string) {
    // Click export button
    await this.page.click(`button:has-text("Export")`);
    
    // Select export type
    await this.page.click(`button:has-text("${exportType}")`);
    
    // Wait for download to start
    const download = await Promise.race([
      this.page.waitForEvent('download'),
      // Add a timeout in case download doesn't start
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
    ]);
    
    // Verify download started
    expect(download).not.toBeNull();
  }
  
  /**
   * Navigate through all admin sections
   */
  async navigateAllSections() {
    // Store results of each section navigation
    const results = {};
    
    // Navigate to each section
    for (const [name, path] of Object.entries(ROUTES.admin)) {
      if (name === 'dashboard') continue; // Skip dashboard
      
      // Navigate to section
      await super.goto(path);
      await this.waitForPageLoad();
      
      // Check page title to verify navigation
      const title = await this.getHeadingText();
      results[name] = title;
      
      // Verify page is loaded correctly
      const contentLoaded = await this.page.locator('main').isVisible();
      expect(contentLoaded).toBe(true);
    }
    
    return results;
  }
}
