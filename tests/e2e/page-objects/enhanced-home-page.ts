import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';

/**
 * Enhanced Home Page Object for E2E tests
 */
export class EnhancedHomePage extends BasePage {
  // Navigation elements
  readonly mainElement: Locator;
  readonly logo: Locator;
  readonly navLinks: Locator;
  readonly mobileMenuButton: Locator;
  
  // Hero section
  readonly heroImg: Locator;
  readonly heroText: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly heroCta: Locator;
  
  // Main sections
  readonly featureIcons: Locator;
  readonly featureTexts: Locator;
  
  // Calls to action
  readonly bookingButton: Locator;
  readonly viewGalleryButton: Locator;
  readonly contactButton: Locator;
  
  // Visual testing
  private visualTesting: VisualTesting | null = null;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize locators based on actual page structure
    this.mainElement = page.locator('main');
    this.logo = page.locator('a:has-text("Ink 37 Logo")');
    this.navLinks = page.locator('main > a[href]').filter({ hasNotText: 'Ink 37 Logo' });
    this.mobileMenuButton = page.locator('button[aria-label="Menu"], .hamburger-menu');
    
    this.heroImg = page.locator('main > img').first();
    this.heroText = page.locator('main > p').first();
    this.heroTitle = page.locator('main h2').first();
    this.heroSubtitle = page.locator('main h2').nth(1);
    this.heroCta = page.locator('main > a').filter({ hasText: 'View My Work' }).first();
    
    this.featureIcons = page.locator('main > img').filter({ hasNotText: 'Japanese tattoo artwork' });
    this.featureTexts = page.locator('main > text');
    
    this.bookingButton = page.locator('a:has-text("Book a Consultation")');
    this.viewGalleryButton = page.locator('a:has-text("View My Work")');
    this.contactButton = page.locator('a:has-text("Contact")');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedHomePage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('home_page_initial');
    }
  }
  
  /**
   * Verify home page is loaded correctly
   */
  async verifyHomePage(): Promise<void> {
    // Verify key elements are visible based on actual page structure
    await expect(this.mainElement).toBeVisible();
    await expect(this.logo).toBeVisible();
    
    // Verify hero content
    await expect(this.heroImg).toBeVisible();
    await expect(this.heroTitle).toBeVisible();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('home_page_verification');
    }
  }
  
  /**
   * Get all navigation links
   */
  async getNavigationLinks(): Promise<string[]> {
    const links: string[] = [];
    
    const count = await this.navLinks.count();
    for (let i = 0; i < count; i++) {
      const link = this.navLinks.nth(i);
      const text = await link.textContent();
      if (text) {
        links.push(text.trim());
      }
    }
    
    return links;
  }
  
  /**
   * Click navigation link by text
   * @param text Link text to click
   */
  async clickNavigationLink(text: string): Promise<void> {
    await this.navLinks.getByText(text, { exact: false }).first().click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`after_click_${text.toLowerCase()}`);
    }
  }
  
  /**
   * Click booking button
   */
  async clickBookButton(): Promise<void> {
    await this.bookingButton.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_click_book');
    }
  }
  
  /**
   * Click view gallery button
   */
  async clickViewGallery(): Promise<void> {
    await this.viewGalleryButton.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_click_gallery');
    }
  }
  
  /**
   * Click contact button
   */
  async clickContact(): Promise<void> {
    await this.contactButton.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_click_contact');
    }
  }
  
  /**
   * Get feature texts
   */
  async getFeatureTexts(): Promise<string[]> {
    const features: string[] = [];
    
    const count = await this.featureTexts.count();
    for (let i = 0; i < count; i++) {
      const featureText = this.featureTexts.nth(i);
      const text = await featureText.textContent();
      if (text) {
        features.push(text.trim());
      }
    }
    
    return features;
  }
  
  /**
   * Open mobile menu
   */
  async openMobileMenu(): Promise<void> {
    // Only click if mobile menu button is visible
    if (await this.mobileMenuButton.isVisible()) {
      await this.mobileMenuButton.click();
      
      // Wait for menu to open
      await this.page.waitForTimeout(500);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot('mobile_menu_open');
      }
    }
  }
  
  /**
   * Check mobile responsiveness
   * @param viewportSizes Array of viewport sizes to test
   */
  async checkResponsiveness(viewportSizes: Array<{ width: number; height: number; name: string }> = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ]): Promise<void> {
    // Test each viewport size
    for (const viewport of viewportSizes) {
      // Set viewport size
      await this.page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      
      // Reload the page to ensure proper rendering
      await this.goto();
      
      // Wait for page to settle
      await this.page.waitForTimeout(1000);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`responsive_${viewport.name}`);
        
        // Check if mobile menu button is visible for mobile/tablet
        if (viewport.width < 1024) {
          const isMobileMenuVisible = await this.mobileMenuButton.isVisible();
          
          if (isMobileMenuVisible) {
            // Open mobile menu
            await this.openMobileMenu();
          }
        }
      }
    }
    
    // Reset to desktop viewport
    await this.page.setViewportSize({ width: 1280, height: 800 });
  }
  
  /**
   * Verify meta tags for SEO
   */
  async verifyMetaTags(): Promise<{
    title: string | null;
    description: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
  }> {
    const title = await this.page.title();
    
    // Get meta tags using evaluate
    const metaTags = await this.page.evaluate(() => {
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || null;
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null;
      const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null;
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;
      
      return { description, ogTitle, ogDescription, ogImage };
    });
    
    return {
      title,
      ...metaTags
    };
  }
}
