/**
 * Services page object model
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { ROUTES } from '../test-constants';

export class ServicesPage extends BasePage {
  readonly servicesList: Locator;
  readonly serviceCards: Locator;
  readonly serviceCategories: Locator;
  readonly pricingSection: Locator;
  readonly faqSection: Locator;
  readonly bookingCTA: Locator;
  
  constructor(page: Page) {
    super(page);
    this.servicesList = page.locator('[data-testid="services-list"]');
    this.serviceCards = page.locator('[data-testid="service-card"]');
    this.serviceCategories = page.locator('[data-testid="service-categories"]');
    this.pricingSection = page.locator('[data-testid="pricing-section"]');
    this.faqSection = page.locator('[data-testid="faq-section"]');
    this.bookingCTA = page.locator('[data-testid="booking-cta"]');
  }
  
  /**
   * Navigate to the services page
   */
  async goto() {
    await super.goto(ROUTES.services);
  }
  
  /**
   * Verify services page structure
   */
  async verifyServicesPageStructure() {
    await expect(this.servicesList).toBeVisible();
    await expect(this.pricingSection).toBeVisible();
    
    // Check service cards count
    const cardsCount = await this.serviceCards.count();
    expect(cardsCount).toBeGreaterThan(0);
  }
  
  /**
   * Get all service categories
   */
  async getServiceCategories(): Promise<string[]> {
    // Check if categories section exists
    const hasCategoriesSection = await this.serviceCategories.isVisible();
    if (!hasCategoriesSection) {
      return [];
    }
    
    const categories = await this.serviceCategories.locator('button').allTextContents();
    return categories.map(c => c.trim()).filter(c => c.length > 0);
  }
  
  /**
   * Filter services by category
   * @param category Category to filter by
   */
  async filterByCategory(category: string) {
    // Check if categories section exists
    const hasCategoriesSection = await this.serviceCategories.isVisible();
    if (!hasCategoriesSection) {
      throw new Error('Service categories section not found');
    }
    
    await this.serviceCategories.locator(`button:has-text("${category}")`).click();
    await this.waitForPageLoad();
    
    // Verify the active category has changed
    const activeCategory = this.serviceCategories.locator('[aria-selected="true"]');
    await expect(activeCategory).toHaveText(category);
  }
  
  /**
   * Get service details
   * @param serviceIndex Index of the service to get details for (0-based)
   */
  async getServiceDetails(serviceIndex = 0): Promise<{
    title: string;
    description: string;
    price: string;
    duration: string;
  }> {
    const serviceCard = this.serviceCards.nth(serviceIndex);
    
    const title = await serviceCard.locator('h3').textContent() || '';
    const description = await serviceCard.locator('p').textContent() || '';
    const price = await serviceCard.locator('[data-testid="service-price"]').textContent() || '';
    const duration = await serviceCard.locator('[data-testid="service-duration"]').textContent() || '';
    
    return {
      title: title.trim(),
      description: description.trim(),
      price: price.trim(),
      duration: duration.trim()
    };
  }
  
  /**
   * Click on a service to view details
   * @param serviceIndex Index of the service to click (0-based)
   */
  async clickOnService(serviceIndex = 0) {
    await this.serviceCards.nth(serviceIndex).click();
    await this.waitForPageLoad();
  }
  
  /**
   * Navigate to booking from service
   * @param serviceIndex Index of the service to book (0-based)
   */
  async bookService(serviceIndex = 0) {
    const serviceCard = this.serviceCards.nth(serviceIndex);
    await serviceCard.locator('button:has-text("Book Now")').click();
    await this.waitForPageLoad();
    
    // Verify we're on the booking page
    expect(this.page.url()).toContain(ROUTES.booking);
    
    // Check if service selection is pre-filled
    const serviceField = this.page.locator('select[name="tattooType"], select[name="serviceType"]');
    if (await serviceField.isVisible()) {
      const selectedValue = await serviceField.inputValue();
      expect(selectedValue).not.toEqual('');
    }
  }
  
  /**
   * Test FAQ accordion functionality
   */
  async testFaqAccordion() {
    // Check if FAQ section exists
    const hasFaqSection = await this.faqSection.isVisible();
    if (!hasFaqSection) {
      console.log('FAQ section not found, skipping test');
      return;
    }
    
    // Get all FAQ items
    const faqItems = this.faqSection.locator('[data-testid="faq-item"]');
    const count = await faqItems.count();
    expect(count).toBeGreaterThan(0);
    
    // Click on first FAQ item
    const firstFaqItem = faqItems.first();
    const firstFaqButton = firstFaqItem.locator('button');
    await firstFaqButton.click();
    
    // Check if content is expanded
    const firstFaqContent = firstFaqItem.locator('[data-state="open"]');
    await expect(firstFaqContent).toBeVisible();
    
    // Click again to collapse
    await firstFaqButton.click();
    
    // Check if content is collapsed
    const collapsedContent = firstFaqItem.locator('[data-state="closed"]');
    await expect(collapsedContent).toBeVisible();
  }
  
  /**
   * Check pricing table visibility and structure
   */
  async verifyPricingTable() {
    // Check if pricing section exists
    const hasPricingSection = await this.pricingSection.isVisible();
    if (!hasPricingSection) {
      console.log('Pricing section not found, skipping test');
      return;
    }
    
    // Check for pricing table
    const pricingTable = this.pricingSection.locator('table');
    await expect(pricingTable).toBeVisible();
    
    // Check for table headers and at least one row
    const tableHeaders = pricingTable.locator('th');
    const tableRows = pricingTable.locator('tbody tr');
    
    const headerCount = await tableHeaders.count();
    const rowCount = await tableRows.count();
    
    expect(headerCount).toBeGreaterThan(0);
    expect(rowCount).toBeGreaterThan(0);
  }
  
  /**
   * Click on booking CTA
   */
  async clickBookingCTA() {
    await this.bookingCTA.click();
    await this.waitForPageLoad();
    
    // Verify we're on the booking page
    expect(this.page.url()).toContain(ROUTES.booking);
  }
  
  /**
   * Test responsive layout at different screen sizes
   */
  async testResponsiveLayout() {
    // Test desktop layout (initial state)
    const desktopCardsPerRow = await this.countCardsPerRow();
    
    // Test tablet layout
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.waitForPageLoad();
    const tabletCardsPerRow = await this.countCardsPerRow();
    
    // Test mobile layout
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.waitForPageLoad();
    const mobileCardsPerRow = await this.countCardsPerRow();
    
    // Reset viewport
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Verify responsive behavior (cards per row should decrease as screen size decreases)
    expect(desktopCardsPerRow).toBeGreaterThanOrEqual(tabletCardsPerRow);
    expect(tabletCardsPerRow).toBeGreaterThanOrEqual(mobileCardsPerRow);
    expect(mobileCardsPerRow).toBeLessThanOrEqual(2);
  }
  
  /**
   * Count the number of service cards per row
   * @private
   */
  private async countCardsPerRow(): Promise<number> {
    return this.page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="service-card"]');
      if (cards.length === 0) return 0;
      
      // Get the y position of the first card
      const firstCardY = cards[0].getBoundingClientRect().top;
      
      // Count cards with the same y position (same row)
      let count = 0;
      for (const card of cards) {
        if (Math.abs(card.getBoundingClientRect().top - firstCardY) < 5) {
          count++;
        } else {
          break;
        }
      }
      
      return count;
    });
  }
}
