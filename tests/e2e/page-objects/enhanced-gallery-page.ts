import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';

/**
 * Enhanced Gallery Page Object for E2E tests
 */
export class EnhancedGalleryPage extends BasePage {
  // Navigation elements
  readonly header: Locator;
  readonly backButton: Locator;
  
  // Gallery elements
  readonly galleryTitle: Locator;
  readonly galleryDescription: Locator;
  readonly galleryGrid: Locator;
  readonly galleryItems: Locator;
  readonly galleryCategories: Locator;
  readonly categoryFilters: Locator;
  
  // Filters and search
  readonly filterButtons: Locator;
  readonly searchInput: Locator;
  readonly sortDropdown: Locator;
  
  // Lightbox elements
  readonly lightbox: Locator;
  readonly lightboxImage: Locator;
  readonly lightboxCaption: Locator;
  readonly lightboxNext: Locator;
  readonly lightboxPrevious: Locator;
  readonly lightboxClose: Locator;
  
  // Visual testing
  private visualTesting: VisualTesting | null = null;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.header = page.locator('header');
    this.backButton = page.locator('a:has-text("Back"), button:has-text("Back")');
    
    this.galleryTitle = page.locator('h1:has-text("Gallery"), [data-testid="gallery-title"]');
    this.galleryDescription = page.locator('.gallery-description, [data-testid="gallery-description"]');
    this.galleryGrid = page.locator('.gallery-grid, [data-testid="gallery-grid"]');
    this.galleryItems = page.locator('.gallery-item, [data-testid="gallery-item"]');
    this.galleryCategories = page.locator('.gallery-categories, [data-testid="gallery-categories"]');
    this.categoryFilters = page.locator('.category-filter, [data-testid="category-filter"]');
    
    this.filterButtons = page.locator('.gallery-filter button, [data-testid="gallery-filter"] button');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.sortDropdown = page.locator('select.gallery-sort, [data-testid="gallery-sort"]');
    
    this.lightbox = page.locator('.lightbox, [data-testid="lightbox"]');
    this.lightboxImage = page.locator('.lightbox-image, [data-testid="lightbox-image"]');
    this.lightboxCaption = page.locator('.lightbox-caption, [data-testid="lightbox-caption"]');
    this.lightboxNext = page.locator('.lightbox-next, [data-testid="lightbox-next"]');
    this.lightboxPrevious = page.locator('.lightbox-previous, [data-testid="lightbox-previous"]');
    this.lightboxClose = page.locator('.lightbox-close, [data-testid="lightbox-close"]');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedGalleryPage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to gallery page
   */
  async goto(): Promise<void> {
    await this.page.goto('/gallery');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('gallery_page_initial');
    }
  }
  
  /**
   * Verify gallery page is loaded correctly
   */
  async verifyGalleryPage(): Promise<void> {
    // Verify key elements are visible
    await expect(this.header).toBeVisible();
    
    // Verify gallery grid is present
    await expect(this.galleryGrid).toBeVisible();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('gallery_page_verification');
    }
  }
  
  /**
   * Get count of gallery items
   */
  async getGalleryItemCount(): Promise<number> {
    return await this.galleryItems.count();
  }
  
  /**
   * Get all gallery categories
   */
  async getGalleryCategories(): Promise<string[]> {
    const categories: string[] = [];
    
    if (await this.categoryFilters.count() > 0) {
      const categoryElements = await this.categoryFilters.all();
      
      for (const element of categoryElements) {
        const text = await element.textContent();
        if (text) {
          categories.push(text.trim());
        }
      }
    }
    
    return categories;
  }
  
  /**
   * Filter gallery by category
   * @param category Category to filter by
   */
  async filterByCategory(category: string): Promise<void> {
    // Find category filter button by text
    const categoryFilter = this.categoryFilters.filter({ hasText: category }).first();
    
    // Click category filter
    await categoryFilter.click();
    
    // Wait for gallery to update
    await this.page.waitForTimeout(500);
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`gallery_filter_${category.toLowerCase().replace(/\s+/g, '_')}`);
    }
  }
  
  /**
   * Search gallery
   * @param searchTerm Term to search for
   */
  async searchGallery(searchTerm: string): Promise<void> {
    // Check if search input exists
    if (await this.searchInput.count() > 0) {
      // Clear search input
      await this.searchInput.fill('');
      
      // Enter search term
      await this.searchInput.fill(searchTerm);
      
      // Press Enter
      await this.searchInput.press('Enter');
      
      // Wait for gallery to update
      await this.page.waitForTimeout(500);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`gallery_search_${searchTerm.toLowerCase().replace(/\s+/g, '_')}`);
      }
    } else {
      console.warn('Search input not found on gallery page');
    }
  }
  
  /**
   * Click on a gallery item
   * @param index Index of gallery item to click (0-based)
   */
  async clickGalleryItem(index: number = 0): Promise<void> {
    // Get gallery item count
    const count = await this.galleryItems.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Gallery item index out of range: ${index} (total items: ${count})`);
    }
    
    // Click gallery item
    await this.galleryItems.nth(index).click();
    
    // Wait for lightbox to open
    await this.waitForLightbox();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`gallery_item_${index}_lightbox`);
    }
  }
  
  /**
   * Wait for lightbox to open
   */
  async waitForLightbox(): Promise<void> {
    try {
      await this.lightbox.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      console.warn('Lightbox did not appear after clicking gallery item');
    }
  }
  
  /**
   * Close lightbox
   */
  async closeLightbox(): Promise<void> {
    // Check if lightbox is open
    if (await this.lightbox.isVisible()) {
      // Click close button if available
      if (await this.lightboxClose.count() > 0) {
        await this.lightboxClose.click();
      } else {
        // If no close button, press Escape key
        await this.page.keyboard.press('Escape');
      }
      
      // Wait for lightbox to close
      try {
        await this.lightbox.waitFor({ state: 'hidden', timeout: 5000 });
      } catch (error) {
        console.warn('Lightbox did not close properly');
      }
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot('gallery_after_lightbox_close');
      }
    }
  }
  
  /**
   * Navigate through lightbox images
   * @param count Number of images to navigate through (positive = forward, negative = backward)
   */
  async navigateLightbox(count: number): Promise<void> {
    // Check if lightbox is open
    if (await this.lightbox.isVisible()) {
      const direction = count > 0 ? 'next' : 'previous';
      const button = direction === 'next' ? this.lightboxNext : this.lightboxPrevious;
      
      // Navigate specified number of images
      for (let i = 0; i < Math.abs(count); i++) {
        if (await button.isVisible()) {
          await button.click();
          
          // Wait for image to change
          await this.page.waitForTimeout(300);
          
          // Take screenshot if visual testing is enabled
          if (this.visualTesting && i === Math.abs(count) - 1) {
            await this.visualTesting.captureScreenshot(`lightbox_${direction}_${i + 1}`);
          }
        } else {
          console.log(`Cannot navigate ${direction} anymore, reached the end`);
          break;
        }
      }
    }
  }
  
  /**
   * Get lightbox image details
   */
  async getLightboxDetails(): Promise<{
    caption?: string;
    imageSrc?: string;
  }> {
    const details: {
      caption?: string;
      imageSrc?: string;
    } = {};
    
    // Check if lightbox is open
    if (await this.lightbox.isVisible()) {
      // Get caption
      if (await this.lightboxCaption.count() > 0) {
        details.caption = await this.lightboxCaption.textContent() || undefined;
      }
      
      // Get image source
      if (await this.lightboxImage.count() > 0) {
        details.imageSrc = await this.lightboxImage.getAttribute('src') || undefined;
      }
    }
    
    return details;
  }
  
  /**
   * Get all image sources in gallery
   */
  async getGalleryImageSources(): Promise<string[]> {
    return this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('.gallery-item img, [data-testid="gallery-item"] img'));
      return images.map(img => (img as HTMLImageElement).src);
    });
  }
  
  /**
   * Test all categories
   */
  async testAllCategories(): Promise<void> {
    // Get all gallery categories
    const categories = await this.getGalleryCategories();
    
    // Log categories
    console.log('Gallery categories:', categories);
    
    // Skip if no categories
    if (categories.length === 0) {
      return;
    }
    
    // Get initial item count for comparison
    const initialCount = await this.getGalleryItemCount();
    
    // Test each category
    for (const category of categories) {
      // Filter by category
      await this.filterByCategory(category);
      
      // Get item count for this category
      const categoryCount = await this.getGalleryItemCount();
      console.log(`Category "${category}" has ${categoryCount} items`);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`gallery_category_${category.toLowerCase().replace(/\s+/g, '_')}`);
      }
    }
  }
  
  /**
   * Check if images are lazy loaded
   */
  async checkImageLazyLoading(): Promise<{
    totalImages: number;
    lazyLoadedImages: number;
    percentage: number;
  }> {
    const result = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const lazyLoadedImages = images.filter(img => img.loading === 'lazy');
      
      return {
        totalImages: images.length,
        lazyLoadedImages: lazyLoadedImages.length,
        percentage: images.length > 0 ? (lazyLoadedImages.length / images.length) * 100 : 0,
      };
    });
    
    console.log(`Image lazy loading: ${result.lazyLoadedImages}/${result.totalImages} (${result.percentage.toFixed(2)}%)`);
    
    return result;
  }
  
  /**
   * Check responsive layout
   */
  async checkResponsiveness(): Promise<void> {
    // Test desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('gallery_desktop');
    }
    
    // Test tablet
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('gallery_tablet');
    }
    
    // Test mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('gallery_mobile');
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    await this.page.reload();
  }
}
