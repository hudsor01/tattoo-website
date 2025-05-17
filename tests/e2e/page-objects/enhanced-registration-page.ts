import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';
import { AuthHelper, TestUser } from '../helpers/auth-helper';

/**
 * Enhanced Registration Page Object for E2E tests
 */
export class EnhancedRegistrationPage extends BasePage {
  // Form elements
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly confirmPasswordField: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly phoneField: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  
  // Result elements
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly verificationMessage: Locator;
  
  // Auth helper
  private authHelper: AuthHelper;
  
  // Visual testing
  private visualTesting: VisualTesting | null = null;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize auth helper
    this.authHelper = new AuthHelper(page);
    
    // Initialize locators
    this.emailField = page.locator('input[name="email"]');
    this.passwordField = page.locator('input[name="password"]');
    this.confirmPasswordField = page.locator('input[name="confirmPassword"]');
    this.firstNameField = page.locator('input[name="firstName"]');
    this.lastNameField = page.locator('input[name="lastName"]');
    this.phoneField = page.locator('input[name="phone"]');
    this.termsCheckbox = page.locator('input[name="terms"], input[type="checkbox"]').first();
    this.submitButton = page.locator('button[type="submit"]');
    this.loginLink = page.locator('a:has-text("Login")');
    this.errorMessage = page.locator('[role="alert"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.verificationMessage = page.locator('[data-testid="verification-message"]');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedRegistrationPage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to registration page
   */
  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('registration_page_initial');
    }
  }
  
  /**
   * Fill registration form
   * @param userData Test user data to register
   */
  async fillRegistrationForm(userData: Partial<TestUser> = {}): Promise<Partial<TestUser>> {
    // Generate unique ID for test data
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
    
    // Default user data with unique values
    const defaultData = {
      email: `test-register-${uniqueId}@example.com`,
      password: `Test-Password123!`,
      firstName: `TestFirst${uniqueId}`,
      lastName: `TestLast${uniqueId}`,
      phone: `555${uniqueId.substring(0, 7)}`,
    };
    
    // Merge with any overrides
    const data = { ...defaultData, ...userData };
    
    // Fill form fields
    await this.emailField.fill(data.email || '');
    await this.passwordField.fill(data.password || '');
    
    // If confirm password field exists, fill it
    if (await this.confirmPasswordField.count() > 0) {
      await this.confirmPasswordField.fill(data.password || '');
    }
    
    await this.firstNameField.fill(data.firstName || '');
    await this.lastNameField.fill(data.lastName || '');
    
    // Fill phone field if it exists
    if (await this.phoneField.count() > 0 && data.phone) {
      await this.phoneField.fill(data.phone);
    }
    
    // Check terms checkbox if it exists
    if (await this.termsCheckbox.count() > 0) {
      await this.termsCheckbox.check();
    }
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('registration_form_filled');
    }
    
    return data;
  }
  
  /**
   * Submit registration form
   */
  async submitRegistrationForm(): Promise<void> {
    // Take screenshot before submitting if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('before_registration_submit');
    }
    
    // Click submit button
    await this.submitButton.click();
    
    // Wait for response
    await this.waitForPageLoad();
    
    // Take screenshot after submitting if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_registration_submit');
    }
  }
  
  /**
   * Complete registration process
   * @param userData Test user data to register
   */
  async register(userData: Partial<TestUser> = {}): Promise<Partial<TestUser>> {
    await this.goto();
    const data = await this.fillRegistrationForm(userData);
    await this.submitRegistrationForm();
    
    return data;
  }
  
  /**
   * Check if registration was successful
   */
  async isRegistrationSuccessful(): Promise<boolean> {
    try {
      // Check for success message or verification message
      return (await this.successMessage.count() > 0) || (await this.verificationMessage.count() > 0);
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check if verification is required
   */
  async isVerificationRequired(): Promise<boolean> {
    return this.page.url().includes('/auth/verify') || (await this.verificationMessage.count() > 0);
  }
  
  /**
   * Check if there are registration errors
   */
  async hasRegistrationErrors(): Promise<boolean> {
    try {
      // Wait a bit for errors to appear
      await this.page.waitForTimeout(500);
      
      return await this.errorMessage.count() > 0;
    } catch (error) {
      // If no error messages are found, return false
      return false;
    }
  }
  
  /**
   * Get registration error messages
   */
  async getRegistrationErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    try {
      // Wait a bit for errors to appear
      await this.page.waitForTimeout(500);
      
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
   * Click login link to navigate to login page
   */
  async clickLogin(): Promise<void> {
    await this.loginLink.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('clicked_login_link');
    }
  }
  
  /**
   * Test valid registration
   * @param userData Optional user data overrides
   */
  async testValidRegistration(userData: Partial<TestUser> = {}): Promise<{
    success: boolean;
    userData: Partial<TestUser>;
    requiresVerification: boolean;
  }> {
    const registeredData = await this.register(userData);
    
    // Check if registration was successful
    const success = await this.isRegistrationSuccessful();
    
    // Check if verification is required
    const requiresVerification = await this.isVerificationRequired();
    
    // Take appropriate screenshot based on result
    if (this.visualTesting) {
      if (success) {
        if (requiresVerification) {
          await this.visualTesting.captureScreenshot('registration_verification_required');
        } else {
          await this.visualTesting.captureScreenshot('registration_success');
        }
      } else {
        await this.visualTesting.captureScreenshot('registration_failed');
      }
    }
    
    return {
      success,
      userData: registeredData,
      requiresVerification,
    };
  }
  
  /**
   * Test invalid registration
   * @param userData User data with validation issues
   */
  async testInvalidRegistration(userData: Partial<TestUser> = {}): Promise<string[]> {
    await this.register(userData);
    
    // Check for errors
    const hasErrors = await this.hasRegistrationErrors();
    expect(hasErrors).toBe(true, 'Invalid registration should show errors');
    
    // Take screenshot of error state
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('registration_validation_errors');
    }
    
    // Get error messages
    return this.getRegistrationErrors();
  }
  
  /**
   * Verify user email in database and redirect to login
   * @param email Email address to verify
   */
  async verifyEmailAndLogin(email: string, password: string): Promise<boolean> {
    // Verify email directly in database
    await this.authHelper.verifyEmail(email);
    
    // Navigate to login page
    await this.page.goto('/auth/login');
    
    // Log in with verified credentials
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submitButton.click();
    
    // Wait for redirect after login
    await this.page.waitForURL(/\/dashboard|\/admin/);
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_email_verification_login');
    }
    
    // Check if login was successful
    return await this.authHelper.isLoggedIn();
  }
}
