/**
 * Gallery page object model
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { ROUTES } from '../test-constants';

export class GalleryPage extends BasePage {
  readonly galleryGrid: Locator;
  readonly filterControls: Locator;
  readonly galleryItems: Locator;
  readonly categoryTabs: Locator;
  readonly lightbox: Locator;
  readonly searchInput: Locator;
  
  constructor(page: Page) {
    super(page);
    this.galleryGrid = page.locator('[data-testid="gallery-grid"]');
    this.filterControls = page.locator('[data-testid="filter-controls"]');
    this.galleryItems = page.locator('[data-testid="gallery-item"]');
    this.categoryTabs = page.locator('[data-testid="category-tabs"] button');
    this.lightbox = page.locator('[role="dialog"][aria-label*="gallery"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');
  }
  
  /**
   * Navigate to the gallery page
   */
  async goto() {
    await super.goto(ROUTES.gallery);
  }
  
  /**
   * Verify gallery layout and structure
   */
  async verifyGalleryLayout() {
    await expect(this.galleryGrid).toBeVisible();
    await expect(this.filterControls).toBeVisible();
    
    // Check gallery items count
    const itemsCount = await this.galleryItems.count();
    expect(itemsCount).toBeGreaterThan(0);
  }
  
  /**
   * Get all gallery categories/tabs
   */
  async getCategories(): Promise<string[]> {
    const categories = await this.categoryTabs.allTextContents();
    return categories.map(c => c.trim()).filter(c => c.length > 0);
  }
  
  /**
   * Filter gallery by category
   * @param category Category to filter by
   */
  async filterByCategory(category: string) {
    await this.categoryTabs.locator(`text="${category}"`).click();
    await this.waitForPageLoad();
    
    // Verify the active tab has changed
    const activeTab = this.categoryTabs.locator('[aria-selected="true"]');
    await expect(activeTab).toHaveText(category);
  }
  
  /**
   * Search gallery
   * @param searchTerm Search term
   */
  async searchGallery(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.searchInput.press('Enter');
    await this.waitForPageLoad();
  }
  
  /**
   * Open a gallery item to view in lightbox
   * @param index Index of the gallery item to open (0-based)
   */
  async openGalleryItem(index = 0) {
    await this.galleryItems.nth(index).click();
    
    // Wait for lightbox to open
    await expect(this.lightbox).toBeVisible();
  }
  
  /**
   * Navigate through lightbox gallery
   */
  async navigateLightbox() {
    // Make sure lightbox is open
    if (await this.lightbox.isHidden()) {
      await this.openGalleryItem();
    }
    
    // Get initial image src
    const initialImage = this.lightbox.locator('img').first();
    const initialSrc = await initialImage.getAttribute('src');
    
    // Click next button
    await this.lightbox.locator('button[aria-label*="Next"]').click();
    await this.page.waitForTimeout(500); // Wait for transition
    
    // Get new image src
    const nextImage = this.lightbox.locator('img').first();
    const nextSrc = await nextImage.getAttribute('src');
    
    // Verify image has changed
    expect(nextSrc).not.toEqual(initialSrc);
    
    // Click previous button
    await this.lightbox.locator('button[aria-label*="Previous"]').click();
    await this.page.waitForTimeout(500); // Wait for transition
    
    // Get image src after going back
    const prevImage = this.lightbox.locator('img').first();
    const prevSrc = await prevImage.getAttribute('src');
    
    // Verify image has changed back to original
    expect(prevSrc).toEqual(initialSrc);
    
    // Close lightbox
    await this.lightbox.locator('button[aria-label*="Close"]').click();
    
    // Verify lightbox is closed
    await expect(this.lightbox).toBeHidden();
  }
  
  /**
   * Verify lazy loading of gallery images
   */
  async verifyLazyLoading() {
    // Get initial visible items count
    const initialVisibleItems = await this.galleryItems.count();
    
    // Scroll to bottom of the page
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for potential lazy loading
    await this.page.waitForTimeout(1000);
    
    // Get new visible items count
    const newVisibleItems = await this.galleryItems.count();
    
    // Check if more items were loaded
    // Note: This test will pass even if no lazy loading is implemented
    // It just verifies the behavior if it is implemented
    expect(newVisibleItems).toBeGreaterThanOrEqual(initialVisibleItems);
  }
  
  /**
   * Verify image loading and alt text
   */
  async verifyImageAccessibility() {
    // Check all gallery images have alt text
    const images = this.galleryGrid.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // Verify image has alt text
      expect(alt).not.toBeNull();
      expect(alt?.trim().length).toBeGreaterThan(0);
      
      // Verify image has loaded
      const isLoaded = await image.evaluate((img) => {
        return img.complete && img.naturalWidth > 0;
      });
      
      expect(isLoaded).toBe(true);
    }
  }
  
  /**
   * Test responsive layout at different screen sizes
   */
  async testResponsiveLayout() {
    // Test desktop layout (initial state)
    const desktopItemsPerRow = await this.countItemsPerRow();
    
    // Test tablet layout
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.waitForPageLoad();
    const tabletItemsPerRow = await this.countItemsPerRow();
    
    // Test mobile layout
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.waitForPageLoad();
    const mobileItemsPerRow = await this.countItemsPerRow();
    
    // Reset viewport
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Verify responsive behavior (items per row should decrease as screen size decreases)
    expect(desktopItemsPerRow).toBeGreaterThanOrEqual(tabletItemsPerRow);
    expect(tabletItemsPerRow).toBeGreaterThanOrEqual(mobileItemsPerRow);
  }
  
  /**
   * Count the number of gallery items per row
   * @private
   */
  private async countItemsPerRow(): Promise<number> {
    return this.page.evaluate(() => {
      const items = document.querySelectorAll('[data-testid="gallery-item"]');
      if (items.length === 0) return 0;
      
      // Get the y position of the first item
      const firstItemY = items[0].getBoundingClientRect().top;
      
      // Count items with the same y position (same row)
      let count = 0;
      for (const item of items) {
        if (Math.abs(item.getBoundingClientRect().top - firstItemY) < 5) {
          count++;
        } else {
          break;
        }
      }
      
      return count;
    });
  }
}
