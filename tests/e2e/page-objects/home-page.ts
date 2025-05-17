/**
 * Home page object model
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { ROUTES } from '../test-constants';

export class HomePage extends BasePage {
  readonly heroSection: Locator;
  readonly featuredGallerySection: Locator;
  readonly servicesSection: Locator;
  readonly ctaSection: Locator;
  readonly testimonialsSection: Locator;
  readonly bookingButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.heroSection = page.locator('[data-testid="hero-section"]');
    this.featuredGallerySection = page.locator('[data-testid="featured-gallery"]');
    this.servicesSection = page.locator('[data-testid="services-section"]');
    this.ctaSection = page.locator('[data-testid="cta-section"]');
    this.testimonialsSection = page.locator('[data-testid="testimonials-section"]');
    this.bookingButton = page.locator('[data-testid="booking-cta"]');
  }
  
  /**
   * Navigate to the home page
   */
  async goto() {
    await super.goto(ROUTES.home);
  }
  
  /**
   * Verify all sections of the home page are present
   */
  async verifySections() {
    await expect(this.heroSection).toBeVisible();
    await expect(this.featuredGallerySection).toBeVisible();
    await expect(this.servicesSection).toBeVisible();
    await expect(this.ctaSection).toBeVisible();
    await expect(this.testimonialsSection).toBeVisible();
  }
  
  /**
   * Navigate to the booking page via CTA
   */
  async clickBookingCTA() {
    await this.bookingButton.click();
    await this.waitForPageLoad();
    
    // Verify we're on the booking page
    expect(this.page.url()).toContain(ROUTES.booking);
  }
  
  /**
   * Get featured gallery items
   */
  async getFeaturedGalleryItems(): Promise<number> {
    return this.page.locator('[data-testid="gallery-item"]').count();
  }
  
  /**
   * Check if mobile menu is working
   */
  async testMobileMenu() {
    // First make viewport mobile-sized
    await this.page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await this.page.locator('[aria-label="Toggle menu"]').click();
    
    // Check that menu is visible
    await expect(this.page.locator('[role="menu"]')).toBeVisible();
    
    // Click a menu item
    await this.page.locator('[role="menu"] a[href*="/gallery"]').click();
    await this.waitForPageLoad();
    
    // Verify we're on the gallery page
    expect(this.page.url()).toContain(ROUTES.gallery);
    
    // Reset viewport size
    await this.page.setViewportSize({ width: 1280, height: 800 });
  }
  
  /**
   * Verify hero section typography and content
   */
  async verifyHeroContent() {
    const heading = this.heroSection.locator('h1');
    const subheading = this.heroSection.locator('h2, p').first();
    
    await expect(heading).toBeVisible();
    await expect(subheading).toBeVisible();
    
    // Check that heading text is not empty
    const headingText = await heading.textContent();
    expect(headingText?.trim().length).toBeGreaterThan(0);
  }
  
  /**
   * Test all navigation links
   */
  async testNavigationLinks() {
    const navLinks = await this.page.locator('nav a[href]').all();
    
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        await link.click();
        await this.waitForPageLoad();
        expect(this.page.url()).toContain(href);
        await this.page.goBack();
        await this.waitForPageLoad();
      }
    }
  }
  
  /**
   * Check for service cards and their content
   */
  async verifyServiceCards() {
    const serviceCards = this.servicesSection.locator('[data-testid="service-card"]');
    const count = await serviceCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Check first card has required elements
    const firstCard = serviceCards.first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('p')).toBeVisible();
    
    // Check if card is clickable and navigates correctly
    await firstCard.click();
    await this.waitForPageLoad();
    
    // Should be on a service detail page or services page
    expect(this.page.url()).toContain('/services');
    
    // Go back to home page
    await this.page.goBack();
    await this.waitForPageLoad();
  }
  
  /**
   * Check if testimonial carousel is functioning
   */
  async verifyTestimonialsCarousel() {
    const testimonials = this.testimonialsSection.locator('[data-testid="testimonial"]');
    const count = await testimonials.count();
    
    expect(count).toBeGreaterThan(0);
    
    // If there are navigation buttons, test them
    const nextButton = this.testimonialsSection.locator('button[aria-label="Next testimonial"]');
    const hasNextButton = await nextButton.count() > 0;
    
    if (hasNextButton) {
      // Get the first testimonial content
      const firstTestimonialText = await testimonials.first().textContent();
      
      // Click next button
      await nextButton.click();
      await this.page.waitForTimeout(500); // Wait for animation
      
      // Get the now-visible testimonial content
      const secondTestimonialText = await this.testimonialsSection.locator('[data-testid="testimonial"]:visible').textContent();
      
      // They should be different
      expect(secondTestimonialText).not.toEqual(firstTestimonialText);
    }
  }
  
  /**
   * Check the performance of the home page
   */
  async checkPerformance() {
    // Check if images are lazy loaded
    const lazyImages = await this.page.locator('img[loading="lazy"]').count();
    expect(lazyImages).toBeGreaterThan(0);
    
    // Check for responsive images
    const responsiveImages = await this.page.locator('img[srcset]').count();
    expect(responsiveImages).toBeGreaterThan(0);
  }
}
