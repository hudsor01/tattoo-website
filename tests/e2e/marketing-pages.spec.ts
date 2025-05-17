import { test, expect } from '@playwright/test';

/**
 * Test suite for marketing pages
 * Tests UI and core functionality of public-facing pages
 */
test.describe('Marketing Pages', () => {
  test('homepage should load with core components', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Check page title
    const title = await page.title();
    expect(title).toContain('Ink 37');
    
    // Verify key components exist
    const heroExists = await page.isVisible('section:has-text("Book Your Custom Tattoo")');
    const servicesExists = await page.isVisible('section:has-text("Services")');
    const ctaExists = await page.isVisible('a:has-text("Book Now")');
    
    expect(heroExists).toBe(true);
    expect(servicesExists).toBe(true);
    expect(ctaExists).toBe(true);
  });

  test('about page should display artist information', async ({ page }) => {
    // Navigate to about page
    await page.goto('/about');
    
    // Check content is loaded
    const artistInfoExists = await page.isVisible('section:has-text("About the Artist")');
    const studioInfoExists = await page.isVisible('section:has-text("Studio")');
    
    expect(artistInfoExists).toBe(true);
    expect(studioInfoExists).toBe(true);
    
    // Check for images
    const artistImageExists = await page.isVisible('img[alt*="artist"]');
    expect(artistImageExists).toBe(true);
  });

  test('services page should list tattoo services', async ({ page }) => {
    // Navigate to services page
    await page.goto('/services');
    
    // Verify service cards are displayed
    const serviceCards = await page.$$('section[id="services"] div[class*="card"]');
    expect(serviceCards.length).toBeGreaterThan(0);
    
    // Check for service categories
    const textContent = await page.textContent('section[id="services"]');
    expect(textContent).toContain('Custom Design');
    expect(textContent).toContain('Black and Grey');
  });

  test('gallery page should display tattoo portfolio', async ({ page }) => {
    // Navigate to gallery page
    await page.goto('/gallery');
    
    // Check for gallery images
    const galleryImages = await page.$$('div[class*="gallery"] img');
    expect(galleryImages.length).toBeGreaterThan(0);
    
    // Verify image modal opens on click
    await galleryImages[0].click();
    const modalVisible = await page.isVisible('div[role="dialog"]');
    expect(modalVisible).toBe(true);
  });

  test('contact page should have functional contact form', async ({ page }) => {
    // Navigate to contact page
    await page.goto('/contact');
    
    // Verify form exists
    const formExists = await page.isVisible('form');
    expect(formExists).toBe(true);
    
    // Check required form fields
    const nameField = await page.isVisible('input[name="name"]');
    const emailField = await page.isVisible('input[name="email"]');
    const messageField = await page.isVisible('textarea[name="message"]');
    const submitButton = await page.isVisible('button[type="submit"]');
    
    expect(nameField).toBe(true);
    expect(emailField).toBe(true);
    expect(messageField).toBe(true);
    expect(submitButton).toBe(true);
    
    // Test form validation
    await page.click('button[type="submit"]');
    const validationErrorVisible = await page.isVisible('text=required');
    expect(validationErrorVisible).toBe(true);
  });

  test('navigation menu should work correctly', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Verify navigation links
    const navLinks = await page.$$('nav a');
    expect(navLinks.length).toBeGreaterThanOrEqual(4); // At least 4 nav links
    
    // Check that about link works
    await page.click('nav a[href="/about"]');
    await page.waitForURL('**/about');
    expect(page.url()).toContain('/about');
    
    // Check that services link works
    await page.click('nav a[href="/services"]');
    await page.waitForURL('**/services');
    expect(page.url()).toContain('/services');
  });

  test('booking CTA should redirect to booking page', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Click on main CTA
    await page.click('a:has-text("Book Now")');
    
    // Verify redirect
    await page.waitForURL('**/booking');
    expect(page.url()).toContain('/booking');
    
    // Verify booking form is displayed
    const bookingFormVisible = await page.isVisible('form');
    expect(bookingFormVisible).toBe(true);
  });

  test('FAQ page should display accordion content', async ({ page }) => {
    // Navigate to FAQ page
    await page.goto('/faq');
    
    // Verify FAQ accordions are present
    const faqItems = await page.$$('div[class*="accordion"]');
    expect(faqItems.length).toBeGreaterThan(0);
    
    // Test accordion functionality
    const firstQuestion = faqItems[0];
    await firstQuestion.click();
    
    // After clicking, answer should be visible
    const answerVisible = await page.isVisible('div[class*="accordion-content"]:visible');
    expect(answerVisible).toBe(true);
  });
});