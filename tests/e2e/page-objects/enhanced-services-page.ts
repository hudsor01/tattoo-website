import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';

/**
 * Enhanced Services Page Object for E2E tests
 */
export class EnhancedServicesPage extends BasePage {
  // Navigation elements
  readonly header: Locator;
  readonly backButton: Locator;
  
  // Services elements
  readonly servicesTitle: Locator;
  readonly servicesDescription: Locator;
  readonly servicesList: Locator;
  readonly serviceItems: Locator;
  readonly serviceCategories: Locator;
  readonly categoryTabs: Locator;
  readonly pricingTable: Locator;
  readonly bookingButtons: Locator;
  
  // Filters and search
  readonly filterButtons: Locator;
  readonly searchInput: Locator;
  readonly sortDropdown: Locator;
  
  // Service details modal
  readonly serviceModal: Locator;
  readonly serviceModalTitle: Locator;
  readonly serviceModalDescription: Locator;
  readonly serviceModalPrice: Locator;
  readonly serviceModalDuration: Locator;
  readonly serviceModalClose: Locator;
  readonly serviceModalBookButton: Locator;
  
  // Visual testing
  private visualTesting: VisualTesting | null = null;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.header = page.locator('header');
    this.backButton = page.locator('a:has-text("Back"), button:has-text("Back")');
    
    this.servicesTitle = page.locator('h1:has-text("Services"), [data-testid="services-title"]');
    this.servicesDescription = page.locator('.services-description, [data-testid="services-description"]');
    this.servicesList = page.locator('.services-list, [data-testid="services-list"]');
    this.serviceItems = page.locator('.service-item, [data-testid="service-item"]');
    this.serviceCategories = page.locator('.service-categories, [data-testid="service-categories"]');
    this.categoryTabs = page.locator('.category-tab, [data-testid="category-tab"]');
    this.pricingTable = page.locator('.pricing-table, [data-testid="pricing-table"]');
    this.bookingButtons = page.locator('a:has-text("Book"), button:has-text("Book")');
    
    this.filterButtons = page.locator('.service-filter button, [data-testid="service-filter"] button');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.sortDropdown = page.locator('select.service-sort, [data-testid="service-sort"]');
    
    this.serviceModal = page.locator('.service-modal, [data-testid="service-modal"]');
    this.serviceModalTitle = page.locator('.service-modal-title, [data-testid="service-modal-title"]');
    this.serviceModalDescription = page.locator('.service-modal-description, [data-testid="service-modal-description"]');
    this.serviceModalPrice = page.locator('.service-modal-price, [data-testid="service-modal-price"]');
    this.serviceModalDuration = page.locator('.service-modal-duration, [data-testid="service-modal-duration"]');
    this.serviceModalClose = page.locator('.service-modal-close, [data-testid="service-modal-close"]');
    this.serviceModalBookButton = page.locator('.service-modal-book, [data-testid="service-modal-book"]');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedServicesPage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to services page
   */
  async goto(): Promise<void> {
    await this.page.goto('/services');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('services_page_initial');
    }
  }
  
  /**
   * Verify services page is loaded correctly
   */
  async verifyServicesPage(): Promise<void> {
    // Verify key elements are visible
    await expect(this.header).toBeVisible();
    await expect(this.servicesTitle).toBeVisible();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('services_page_verification');
    }
  }
  
  /**
   * Get count of service items
   */
  async getServiceItemCount(): Promise<number> {
    return await this.serviceItems.count();
  }
  
  /**
   * Get all service categories
   */
  async getServiceCategories(): Promise<string[]> {
    const categories: string[] = [];
    
    const count = await this.categoryTabs.count();
    for (let i = 0; i < count; i++) {
      const tab = this.categoryTabs.nth(i);
      const text = await tab.textContent();
      if (text) {
        categories.push(text.trim());
      }
    }
    
    return categories;
  }
  
  /**
   * Switch to service category
   * @param category Category to switch to
   */
  async switchCategory(category: string): Promise<void> {
    // Find category tab by text
    const categoryTab = this.categoryTabs.getByText(category, { exact: false }).first();
    
    // Click category tab
    await categoryTab.click();
    
    // Wait for services to update
    await this.page.waitForTimeout(500);
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`services_category_${category.toLowerCase()}`);
    }
  }
  
  /**
   * Search services by term
   * @param searchTerm Term to search for
   */
  async searchServices(searchTerm: string): Promise<void> {
    // Check if search input exists
    if (await this.searchInput.count() > 0) {
      // Clear search input
      await this.searchInput.fill('');
      
      // Enter search term
      await this.searchInput.fill(searchTerm);
      
      // Press Enter
      await this.searchInput.press('Enter');
      
      // Wait for services to update
      await this.page.waitForTimeout(500);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`services_search_${searchTerm.toLowerCase()}`);
      }
    } else {
      console.warn('Search input not found');
    }
  }
  
  /**
   * Click on a service item by index
   * @param index Index of service item to click (0-based)
   */
  async clickServiceItem(index: number = 0): Promise<void> {
    // Get service item count
    const count = await this.serviceItems.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Service item index out of range: ${index} (total items: ${count})`);
    }
    
    // Click service item
    await this.serviceItems.nth(index).click();
    
    // Wait for modal to open
    await this.waitForServiceModal();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`service_item_${index}_details`);
    }
  }
  
  /**
   * Wait for service modal to open
   */
  async waitForServiceModal(): Promise<void> {
    // Check if modal exists
    if (await this.serviceModal.count() > 0) {
      // Wait for modal to be visible
      await this.serviceModal.waitFor({ state: 'visible', timeout: 5000 });
    }
  }
  
  /**
   * Close service modal
   */
  async closeServiceModal(): Promise<void> {
    // Check if modal is open
    if (await this.serviceModal.isVisible()) {
      // Click close button
      await this.serviceModalClose.click();
      
      // Wait for modal to close
      await this.serviceModal.waitFor({ state: 'hidden', timeout: 5000 });
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot('services_after_modal_close');
      }
    }
  }
  
  /**
   * Click book button for a service
   * @param index Index of service item to book (0-based)
   */
  async clickBookService(index: number = 0): Promise<void> {
    // Get booking buttons count
    const count = await this.bookingButtons.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Booking button index out of range: ${index} (total buttons: ${count})`);
    }
    
    // Click booking button
    await this.bookingButtons.nth(index).click();
    
    // Wait for navigation to booking page
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_book_service_click');
    }
  }
  
  /**
   * Click book button in service modal
   */
  async clickBookServiceModal(): Promise<void> {
    // Check if modal is open
    if (await this.serviceModal.isVisible()) {
      // Click book button in modal
      await this.serviceModalBookButton.click();
      
      // Wait for navigation to booking page
      await this.waitForPageLoad();
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot('after_book_service_modal');
      }
    }
  }
  
  /**
   * Get service details at specific index
   * @param index Index of service item to get details for (0-based)
   */
  async getServiceDetails(index: number = 0): Promise<{
    title?: string;
    price?: string;
    duration?: string;
    description?: string;
    category?: string;
  }> {
    const details: {
      title?: string;
      price?: string;
      duration?: string;
      description?: string;
      category?: string;
    } = {};
    
    // Get service item count
    const count = await this.serviceItems.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Service item index out of range: ${index} (total items: ${count})`);
    }
    
    try {
      // Get service item
      const item = this.serviceItems.nth(index);
      
      // Get title element
      const titleElement = item.locator('.service-title, h3, .title');
      if (await titleElement.count() > 0) {
        details.title = await titleElement.textContent() || undefined;
      }
      
      // Get price element
      const priceElement = item.locator('.service-price, .price');
      if (await priceElement.count() > 0) {
        details.price = await priceElement.textContent() || undefined;
      }
      
      // Get duration element
      const durationElement = item.locator('.service-duration, .duration');
      if (await durationElement.count() > 0) {
        details.duration = await durationElement.textContent() || undefined;
      }
      
      // Get description element
      const descriptionElement = item.locator('.service-description, .description');
      if (await descriptionElement.count() > 0) {
        details.description = await descriptionElement.textContent() || undefined;
      }
      
      // Get category element
      const categoryElement = item.locator('.service-category, .category');
      if (await categoryElement.count() > 0) {
        details.category = await categoryElement.textContent() || undefined;
      }
    } catch (error) {
      console.warn(`Error getting service details for index ${index}:`, error);
    }
    
    return details;
  }
  
  /**
   * Get service modal details
   */
  async getServiceModalDetails(): Promise<{
    title?: string;
    price?: string;
    duration?: string;
    description?: string;
  }> {
    const details: {
      title?: string;
      price?: string;
      duration?: string;
      description?: string;
    } = {};
    
    // Check if modal is open
    if (await this.serviceModal.isVisible()) {
      // Get title
      if (await this.serviceModalTitle.count() > 0) {
        details.title = await this.serviceModalTitle.textContent() || undefined;
      }
      
      // Get price
      if (await this.serviceModalPrice.count() > 0) {
        details.price = await this.serviceModalPrice.textContent() || undefined;
      }
      
      // Get duration
      if (await this.serviceModalDuration.count() > 0) {
        details.duration = await this.serviceModalDuration.textContent() || undefined;
      }
      
      // Get description
      if (await this.serviceModalDescription.count() > 0) {
        details.description = await this.serviceModalDescription.textContent() || undefined;
      }
    }
    
    return details;
  }
  
  /**
   * Test all service categories
   */
  async testAllCategories(): Promise<void> {
    // Get all service categories
    const categories = await this.getServiceCategories();
    
    // Log categories
    console.log('Service categories:', categories);
    
    // Skip if no categories
    if (categories.length === 0) {
      return;
    }
    
    // Test each category
    for (const category of categories) {
      // Switch to category
      await this.switchCategory(category);
      
      // Get service item count for this category
      const serviceCount = await this.getServiceItemCount();
      console.log(`Category "${category}" has ${serviceCount} services`);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`services_category_${category.toLowerCase()}`);
      }
    }
  }
  
  /**
   * Check responsive layout
   */
  async checkResponsiveness(): Promise<void> {
    // Test desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('services_desktop');
    }
    
    // Test tablet
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('services_tablet');
    }
    
    // Test mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('services_mobile');
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    await this.page.reload();
  }
}
