import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';
import { AuthHelper, TestUser } from '../helpers/auth-helper';

/**
 * Enhanced Admin Customers Page Object for E2E tests
 */
export class EnhancedAdminCustomersPage extends BasePage {
  // Navigation elements
  readonly header: Locator;
  readonly breadcrumbs: Locator;
  readonly backButton: Locator;
  
  // Customers list elements
  readonly customersTitle: Locator;
  readonly customersList: Locator;
  readonly customerRows: Locator;
  readonly newCustomerButton: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly sortDropdown: Locator;
  readonly paginationControls: Locator;
  
  // Action buttons
  readonly editButtons: Locator;
  readonly deleteButtons: Locator;
  readonly viewButtons: Locator;
  readonly exportButton: Locator;
  readonly importButton: Locator;
  
  // Customer form elements
  readonly customerForm: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly emailField: Locator;
  readonly phoneField: Locator;
  readonly addressField: Locator;
  readonly cityField: Locator;
  readonly stateField: Locator;
  readonly zipField: Locator;
  readonly notesField: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  
  // Customer details elements
  readonly customerDetails: Locator;
  readonly customerName: Locator;
  readonly customerEmail: Locator;
  readonly customerPhone: Locator;
  readonly customerAddress: Locator;
  readonly customerAppointments: Locator;
  readonly customerBookings: Locator;
  readonly customerPayments: Locator;
  
  // Confirmation modal
  readonly confirmModal: Locator;
  readonly confirmButton: Locator;
  readonly cancelModalButton: Locator;
  
  // Notification elements
  readonly successNotification: Locator;
  readonly errorNotification: Locator;
  
  // Auth helper
  private authHelper: AuthHelper;
  
  // Visual testing
  private visualTesting: VisualTesting | null = null;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize auth helper
    this.authHelper = new AuthHelper(page);
    
    // Initialize locators
    this.header = page.locator('header');
    this.breadcrumbs = page.locator('.breadcrumbs, [data-testid="breadcrumbs"]');
    this.backButton = page.locator('a:has-text("Back"), button:has-text("Back")');
    
    this.customersTitle = page.locator('h1:has-text("Customers"), [data-testid="customers-title"]');
    this.customersList = page.locator('.customers-list, [data-testid="customers-list"], table');
    this.customerRows = page.locator('.customer-row, [data-testid="customer-row"], tr:not(:first-child)');
    this.newCustomerButton = page.locator('button:has-text("New Customer"), a:has-text("New Customer"), [data-testid="new-customer-button"]');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]');
    this.filterDropdown = page.locator('select.filter-dropdown, [data-testid="filter-dropdown"]');
    this.sortDropdown = page.locator('select.sort-dropdown, [data-testid="sort-dropdown"]');
    this.paginationControls = page.locator('.pagination, [data-testid="pagination"]');
    
    this.editButtons = page.locator('button:has-text("Edit"), a:has-text("Edit"), [data-testid="edit-button"]');
    this.deleteButtons = page.locator('button:has-text("Delete"), a:has-text("Delete"), [data-testid="delete-button"]');
    this.viewButtons = page.locator('button:has-text("View"), a:has-text("View"), [data-testid="view-button"]');
    this.exportButton = page.locator('button:has-text("Export"), a:has-text("Export"), [data-testid="export-button"]');
    this.importButton = page.locator('button:has-text("Import"), a:has-text("Import"), [data-testid="import-button"]');
    
    this.customerForm = page.locator('form, [data-testid="customer-form"]');
    this.firstNameField = page.locator('input[name="firstName"]');
    this.lastNameField = page.locator('input[name="lastName"]');
    this.emailField = page.locator('input[name="email"]');
    this.phoneField = page.locator('input[name="phone"]');
    this.addressField = page.locator('input[name="address"]');
    this.cityField = page.locator('input[name="city"]');
    this.stateField = page.locator('input[name="state"], select[name="state"]');
    this.zipField = page.locator('input[name="zip"]');
    this.notesField = page.locator('textarea[name="notes"]');
    this.saveButton = page.locator('button[type="submit"], button:has-text("Save")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    
    this.customerDetails = page.locator('.customer-details, [data-testid="customer-details"]');
    this.customerName = page.locator('.customer-name, [data-testid="customer-name"]');
    this.customerEmail = page.locator('.customer-email, [data-testid="customer-email"]');
    this.customerPhone = page.locator('.customer-phone, [data-testid="customer-phone"]');
    this.customerAddress = page.locator('.customer-address, [data-testid="customer-address"]');
    this.customerAppointments = page.locator('.customer-appointments, [data-testid="customer-appointments"]');
    this.customerBookings = page.locator('.customer-bookings, [data-testid="customer-bookings"]');
    this.customerPayments = page.locator('.customer-payments, [data-testid="customer-payments"]');
    
    this.confirmModal = page.locator('.confirm-modal, [data-testid="confirm-modal"], [role="dialog"]');
    this.confirmButton = page.locator('.confirm-button, [data-testid="confirm-button"], button:has-text("Confirm"), button:has-text("Yes")');
    this.cancelModalButton = page.locator('.cancel-button, [data-testid="cancel-button"], button:has-text("Cancel"), button:has-text("No")');
    
    this.successNotification = page.locator('.success-notification, [data-testid="success-notification"], [role="status"]');
    this.errorNotification = page.locator('.error-notification, [data-testid="error-notification"], [role="alert"]');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedAdminCustomersPage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to admin customers page
   */
  async goto(): Promise<void> {
    await this.page.goto('/admin/customers');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_customers_page_initial');
    }
  }
  
  /**
   * Login as admin and navigate to customers page
   * @param adminUser Admin user credentials
   */
  async loginAndGoto(adminUser: TestUser): Promise<void> {
    await this.authHelper.login(adminUser);
    await this.goto();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_customers_page_after_login');
    }
  }
  
  /**
   * Verify customers page is loaded correctly
   */
  async verifyCustomersPage(): Promise<void> {
    // Verify key elements are visible
    await expect(this.header).toBeVisible();
    await expect(this.customersTitle).toBeVisible();
    await expect(this.customersList).toBeVisible();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_customers_page_verification');
    }
  }
  
  /**
   * Get count of customer rows
   */
  async getCustomerCount(): Promise<number> {
    return await this.customerRows.count();
  }
  
  /**
   * Search for customer
   * @param searchTerm Term to search for
   */
  async searchCustomer(searchTerm: string): Promise<void> {
    // Check if search input exists
    if (await this.searchInput.count() > 0) {
      // Clear search input
      await this.searchInput.fill('');
      
      // Enter search term
      await this.searchInput.fill(searchTerm);
      
      // Press Enter
      await this.searchInput.press('Enter');
      
      // Wait for customers list to update
      await this.page.waitForTimeout(500);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`customers_search_${searchTerm.toLowerCase()}`);
      }
    } else {
      console.warn('Search input not found');
    }
  }
  
  /**
   * Apply filter to customers list
   * @param filterValue Filter value to select
   */
  async applyFilter(filterValue: string): Promise<void> {
    // Check if filter dropdown exists
    if (await this.filterDropdown.count() > 0) {
      // Select filter option
      await this.filterDropdown.selectOption({ label: filterValue });
      
      // Wait for customers list to update
      await this.page.waitForTimeout(500);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`customers_filter_${filterValue.toLowerCase()}`);
      }
    } else {
      console.warn('Filter dropdown not found');
    }
  }
  
  /**
   * Sort customers list
   * @param sortOption Sort option to select
   */
  async sortCustomers(sortOption: string): Promise<void> {
    // Check if sort dropdown exists
    if (await this.sortDropdown.count() > 0) {
      // Select sort option
      await this.sortDropdown.selectOption({ label: sortOption });
      
      // Wait for customers list to update
      await this.page.waitForTimeout(500);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`customers_sort_${sortOption.toLowerCase()}`);
      }
    } else {
      console.warn('Sort dropdown not found');
    }
  }
  
  /**
   * Click new customer button
   */
  async clickNewCustomer(): Promise<void> {
    await this.newCustomerButton.click();
    
    // Wait for customer form to load
    await this.waitForPageLoad();
    
    // Wait for form to be visible
    await this.customerForm.waitFor({ state: 'visible' });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('new_customer_form');
    }
  }
  
  /**
   * Fill customer form with test data
   * @param data Customer form data
   */
  async fillCustomerForm(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
  } = {}): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  }> {
    // Generate unique ID for test data
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
    
    // Default form data with unique values
    const defaultData = {
      firstName: `Test${uniqueId}`,
      lastName: `User${uniqueId}`,
      email: `test-${uniqueId}@example.com`,
      phone: `555${uniqueId.substring(0, 7)}`,
      address: `${uniqueId} Test St`,
      city: 'Test City',
      state: 'TS',
      zip: `1${uniqueId.substring(0, 4)}`,
      notes: `Test customer created by automated testing. ID: ${uniqueId}`,
    };
    
    // Merge with provided data
    const formData = {
      ...defaultData,
      ...data,
    };
    
    // Fill form fields
    await this.firstNameField.fill(formData.firstName);
    await this.lastNameField.fill(formData.lastName);
    await this.emailField.fill(formData.email);
    await this.phoneField.fill(formData.phone);
    
    // Fill address fields if they exist
    if (await this.addressField.count() > 0) {
      await this.addressField.fill(formData.address);
    }
    
    if (await this.cityField.count() > 0) {
      await this.cityField.fill(formData.city);
    }
    
    if (await this.stateField.count() > 0) {
      // Check if it's a select dropdown or text input
      const tagName = await this.stateField.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'select') {
        await this.stateField.selectOption(formData.state);
      } else {
        await this.stateField.fill(formData.state);
      }
    }
    
    if (await this.zipField.count() > 0) {
      await this.zipField.fill(formData.zip);
    }
    
    if (await this.notesField.count() > 0) {
      await this.notesField.fill(formData.notes);
    }
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('customer_form_filled');
    }
    
    return formData;
  }
  
  /**
   * Save customer form
   */
  async saveCustomerForm(): Promise<void> {
    // Take screenshot before saving if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('before_save_customer');
    }
    
    // Click save button
    await this.saveButton.click();
    
    // Wait for response
    await this.waitForPageLoad();
    
    // Take screenshot after saving if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_save_customer');
    }
  }
  
  /**
   * Cancel customer form
   */
  async cancelCustomerForm(): Promise<void> {
    await this.cancelButton.click();
    
    // Wait for redirect back to customers list
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_cancel_customer');
    }
  }
  
  /**
   * Create new customer
   * @param data Customer form data
   */
  async createNewCustomer(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
  } = {}): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  }> {
    // Click new customer button
    await this.clickNewCustomer();
    
    // Fill customer form
    const formData = await this.fillCustomerForm(data);
    
    // Save customer form
    await this.saveCustomerForm();
    
    // Check for success notification
    const isSuccessful = await this.hasSuccessNotification();
    expect(isSuccessful).toBe(true, 'Customer creation should show success notification');
    
    return formData;
  }
  
  /**
   * Check if success notification is displayed
   */
  async hasSuccessNotification(): Promise<boolean> {
    try {
      await this.successNotification.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check if error notification is displayed
   */
  async hasErrorNotification(): Promise<boolean> {
    try {
      await this.errorNotification.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get notification message
   */
  async getNotificationMessage(): Promise<string | null> {
    // Check for success notification
    if (await this.hasSuccessNotification()) {
      return await this.successNotification.textContent();
    }
    
    // Check for error notification
    if (await this.hasErrorNotification()) {
      return await this.errorNotification.textContent();
    }
    
    return null;
  }
  
  /**
   * View customer details by index
   * @param index Index of customer to view (0-based)
   */
  async viewCustomerDetails(index: number = 0): Promise<void> {
    // Get view buttons count
    const count = await this.viewButtons.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`View button index out of range: ${index} (total buttons: ${count})`);
    }
    
    // Click view button
    await this.viewButtons.nth(index).click();
    
    // Wait for customer details to load
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`customer_details_${index}`);
    }
  }
  
  /**
   * Edit customer by index
   * @param index Index of customer to edit (0-based)
   */
  async editCustomer(index: number = 0, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
  } = {}): Promise<void> {
    // Get edit buttons count
    const count = await this.editButtons.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Edit button index out of range: ${index} (total buttons: ${count})`);
    }
    
    // Click edit button
    await this.editButtons.nth(index).click();
    
    // Wait for customer form to load
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`edit_customer_form_${index}`);
    }
    
    // Fill customer form with updated data
    await this.fillCustomerForm(data);
    
    // Save customer form
    await this.saveCustomerForm();
    
    // Check for success notification
    const isSuccessful = await this.hasSuccessNotification();
    expect(isSuccessful).toBe(true, 'Customer update should show success notification');
  }
  
  /**
   * Delete customer by index
   * @param index Index of customer to delete (0-based)
   */
  async deleteCustomer(index: number = 0): Promise<void> {
    // Get delete buttons count
    const count = await this.deleteButtons.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Delete button index out of range: ${index} (total buttons: ${count})`);
    }
    
    // Click delete button
    await this.deleteButtons.nth(index).click();
    
    // Wait for confirmation modal
    await this.confirmModal.waitFor({ state: 'visible', timeout: 5000 });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`delete_confirmation_${index}`);
    }
    
    // Click confirm button
    await this.confirmButton.click();
    
    // Wait for page to update
    await this.waitForPageLoad();
    
    // Check for success notification
    const isSuccessful = await this.hasSuccessNotification();
    expect(isSuccessful).toBe(true, 'Customer deletion should show success notification');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_customer_deletion');
    }
  }
  
  /**
   * Get customer details from the list by index
   * @param index Index of customer to get details for (0-based)
   */
  async getCustomerListDetails(index: number = 0): Promise<{
    name?: string;
    email?: string;
    phone?: string;
  }> {
    const details: {
      name?: string;
      email?: string;
      phone?: string;
    } = {};
    
    // Get row count
    const count = await this.customerRows.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Customer row index out of range: ${index} (total rows: ${count})`);
    }
    
    try {
      // Get customer row
      const row = this.customerRows.nth(index);
      
      // Get cells
      const cells = row.locator('td');
      const cellCount = await cells.count();
      
      // Extract data based on cell index
      // This approach assumes a consistent table structure
      if (cellCount > 0) {
        details.name = await cells.nth(0).textContent() || undefined;
      }
      
      if (cellCount > 1) {
        details.email = await cells.nth(1).textContent() || undefined;
      }
      
      if (cellCount > 2) {
        details.phone = await cells.nth(2).textContent() || undefined;
      }
    } catch (error) {
      console.warn(`Error getting customer details for index ${index}:`, error);
    }
    
    return details;
  }
  
  /**
   * Get customer details from the details page
   */
  async getCustomerPageDetails(): Promise<{
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }> {
    const details: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    } = {};
    
    // Check if customer details page is loaded
    if (await this.customerDetails.count() > 0) {
      // Get name
      if (await this.customerName.count() > 0) {
        details.name = await this.customerName.textContent() || undefined;
      }
      
      // Get email
      if (await this.customerEmail.count() > 0) {
        details.email = await this.customerEmail.textContent() || undefined;
      }
      
      // Get phone
      if (await this.customerPhone.count() > 0) {
        details.phone = await this.customerPhone.textContent() || undefined;
      }
      
      // Get address
      if (await this.customerAddress.count() > 0) {
        details.address = await this.customerAddress.textContent() || undefined;
      }
    }
    
    return details;
  }
  
  /**
   * Get appointment count for a customer
   */
  async getCustomerAppointmentCount(): Promise<number> {
    // Check if customer appointments section exists
    if (await this.customerAppointments.count() > 0) {
      // Get appointment rows
      const appointmentRows = this.customerAppointments.locator('tr, .appointment-row');
      return await appointmentRows.count();
    }
    
    return 0;
  }
  
  /**
   * Check responsive layout
   */
  async checkResponsiveness(): Promise<void> {
    // Test desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_customers_desktop');
    }
    
    // Test tablet
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_customers_tablet');
    }
    
    // Test mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_customers_mobile');
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    await this.page.reload();
  }
}
