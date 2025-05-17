import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';

/**
 * Enhanced Contact Page Object for E2E tests
 */
export class EnhancedContactPage extends BasePage {
  // Navigation elements
  readonly header: Locator;
  readonly backButton: Locator;
  
  // Contact elements
  readonly contactTitle: Locator;
  readonly contactDescription: Locator;
  readonly contactForm: Locator;
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly phoneField: Locator;
  readonly subjectField: Locator;
  readonly messageField: Locator;
  readonly submitButton: Locator;
  
  // Contact info elements
  readonly addressInfo: Locator;
  readonly phoneInfo: Locator;
  readonly emailInfo: Locator;
  readonly hoursInfo: Locator;
  readonly socialLinks: Locator;
  
  // Map element
  readonly mapContainer: Locator;
  
  // Result elements
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  
  // Visual testing
  private visualTesting: VisualTesting | null = null;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.header = page.locator('header');
    this.backButton = page.locator('a:has-text("Back"), button:has-text("Back")');
    
    this.contactTitle = page.locator('h1:has-text("Contact"), [data-testid="contact-title"]');
    this.contactDescription = page.locator('.contact-description, [data-testid="contact-description"]');
    this.contactForm = page.locator('form[data-testid="contact-form"], form.contact-form');
    this.nameField = page.locator('input[name="name"]');
    this.emailField = page.locator('input[name="email"]');
    this.phoneField = page.locator('input[name="phone"]');
    this.subjectField = page.locator('input[name="subject"]');
    this.messageField = page.locator('textarea[name="message"]');
    this.submitButton = page.locator('button[type="submit"]');
    
    this.addressInfo = page.locator('.address-info, [data-testid="address-info"]');
    this.phoneInfo = page.locator('.phone-info, [data-testid="phone-info"]');
    this.emailInfo = page.locator('.email-info, [data-testid="email-info"]');
    this.hoursInfo = page.locator('.hours-info, [data-testid="hours-info"]');
    this.socialLinks = page.locator('.social-links, [data-testid="social-links"]');
    
    this.mapContainer = page.locator('.map-container, [data-testid="map-container"]');
    
    this.successMessage = page.locator('.success-message, [data-testid="success-message"]');
    this.errorMessage = page.locator('.error-message, [data-testid="error-message"], [role="alert"]');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedContactPage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to contact page
   */
  async goto(): Promise<void> {
    await this.page.goto('/contact');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('contact_page_initial');
    }
  }
  
  /**
   * Verify contact page is loaded correctly
   */
  async verifyContactPage(): Promise<void> {
    // Verify key elements are visible
    await expect(this.header).toBeVisible();
    await expect(this.contactTitle).toBeVisible();
    await expect(this.contactForm).toBeVisible();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('contact_page_verification');
    }
  }
  
  /**
   * Fill contact form with test data
   * @param data Contact form data
   */
  async fillContactForm(data: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  } = {}): Promise<{
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }> {
    // Generate unique ID for test data
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
    
    // Default form data with unique values
    const defaultData = {
      name: `Test User ${uniqueId}`,
      email: `test-${uniqueId}@example.com`,
      phone: `555${uniqueId.substring(0, 7)}`,
      subject: `Test Subject ${uniqueId}`,
      message: `This is a test message from automated testing. Please ignore. ID: ${uniqueId}`,
    };
    
    // Merge with provided data
    const formData = {
      ...defaultData,
      ...data,
    };
    
    // Fill form fields
    await this.nameField.fill(formData.name);
    await this.emailField.fill(formData.email);
    
    // Fill phone field if it exists
    if (await this.phoneField.count() > 0) {
      await this.phoneField.fill(formData.phone);
    }
    
    // Fill subject field if it exists
    if (await this.subjectField.count() > 0) {
      await this.subjectField.fill(formData.subject);
    }
    
    await this.messageField.fill(formData.message);
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('contact_form_filled');
    }
    
    return formData;
  }
  
  /**
   * Submit contact form
   */
  async submitContactForm(): Promise<void> {
    // Take screenshot before submitting if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('before_contact_submit');
    }
    
    // Click submit button
    await this.submitButton.click();
    
    // Wait for response
    await this.waitForPageLoad();
    
    // Take screenshot after submitting if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_contact_submit');
    }
  }
  
  /**
   * Check if form submission was successful
   */
  async isSubmissionSuccessful(): Promise<boolean> {
    try {
      // Wait for success message to appear
      await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check if there are form errors
   */
  async hasFormErrors(): Promise<boolean> {
    try {
      return await this.errorMessage.count() > 0;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get form error messages
   */
  async getFormErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    try {
      // Get all error messages
      const errorElements = await this.errorMessage.all();
      
      for (const element of errorElements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          errors.push(text.trim());
        }
      }
    } catch (error) {
      // If no error messages are found, return empty array
    }
    
    return errors;
  }
  
  /**
   * Get contact information
   */
  async getContactInfo(): Promise<{
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
  }> {
    const info: {
      address?: string;
      phone?: string;
      email?: string;
      hours?: string;
    } = {};
    
    // Get address
    if (await this.addressInfo.count() > 0) {
      info.address = await this.addressInfo.textContent() || undefined;
    }
    
    // Get phone
    if (await this.phoneInfo.count() > 0) {
      info.phone = await this.phoneInfo.textContent() || undefined;
    }
    
    // Get email
    if (await this.emailInfo.count() > 0) {
      info.email = await this.emailInfo.textContent() || undefined;
    }
    
    // Get hours
    if (await this.hoursInfo.count() > 0) {
      info.hours = await this.hoursInfo.textContent() || undefined;
    }
    
    return info;
  }
  
  /**
   * Get social media links
   */
  async getSocialLinks(): Promise<string[]> {
    const links: string[] = [];
    
    // Check if social links container exists
    if (await this.socialLinks.count() > 0) {
      // Get all links within the container
      const linkElements = this.socialLinks.locator('a');
      const count = await linkElements.count();
      
      for (let i = 0; i < count; i++) {
        const href = await linkElements.nth(i).getAttribute('href');
        if (href) {
          links.push(href);
        }
      }
    }
    
    return links;
  }
  
  /**
   * Check if map is displayed
   */
  async isMapDisplayed(): Promise<boolean> {
    return await this.mapContainer.isVisible();
  }
  
  /**
   * Test form validation by submitting an empty form
   */
  async testFormValidation(): Promise<string[]> {
    // Navigate to contact page
    await this.goto();
    
    // Submit the form without filling any fields
    await this.submitContactForm();
    
    // Check for validation errors
    const hasErrors = await this.hasFormErrors();
    expect(hasErrors).toBe(true, 'Empty form should show validation errors');
    
    // Get error messages
    const errors = await this.getFormErrors();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('contact_form_validation_errors');
    }
    
    return errors;
  }
  
  /**
   * Test form submission with valid data
   */
  async testValidSubmission(data: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  } = {}): Promise<boolean> {
    // Navigate to contact page
    await this.goto();
    
    // Fill contact form
    await this.fillContactForm(data);
    
    // Submit form
    await this.submitContactForm();
    
    // Check if submission was successful
    const isSuccessful = await this.isSubmissionSuccessful();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(
        isSuccessful ? 'contact_form_success' : 'contact_form_error'
      );
    }
    
    return isSuccessful;
  }
  
  /**
   * Check responsive layout
   */
  async checkResponsiveness(): Promise<void> {
    // Test desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('contact_desktop');
    }
    
    // Test tablet
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('contact_tablet');
    }
    
    // Test mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('contact_mobile');
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    await this.page.reload();
  }
}
