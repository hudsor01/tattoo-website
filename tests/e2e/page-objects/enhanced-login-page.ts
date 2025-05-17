import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';
import { AuthHelper } from '../helpers/auth-helper';

/**
 * Enhanced Login Page Object for E2E tests
 */
export class EnhancedLoginPage extends BasePage {
  // Form elements
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly submitButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  
  // Result elements
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  
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
    this.submitButton = page.locator('button[type="submit"]');
    this.rememberMeCheckbox = page.locator('input[name="rememberMe"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot password")');
    this.registerLink = page.locator('a:has-text("Register")');
    this.errorMessage = page.locator('[role="alert"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedLoginPage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('login_page_initial');
    }
  }
  
  /**
   * Fill login form
   * @param email Email address
   * @param password Password
   * @param rememberMe Remember me option
   */
  async fillLoginForm(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('login_form_filled');
    }
  }
  
  /**
   * Submit login form
   */
  async submitLoginForm(): Promise<void> {
    // Take screenshot before submitting if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('before_login_submit');
    }
    
    // Click submit button
    await this.submitButton.click();
    
    // Wait for response
    await this.waitForPageLoad();
  }
  
  /**
   * Complete login process
   * @param email Email address
   * @param password Password
   * @param rememberMe Remember me option
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.goto();
    await this.fillLoginForm(email, password, rememberMe);
    await this.submitLoginForm();
    
    // Take screenshot after submitting if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_login_submit');
    }
  }
  
  /**
   * Check if login was successful
   */
  async isLoginSuccessful(): Promise<boolean> {
    return await this.authHelper.isLoggedIn();
  }
  
  /**
   * Check if there are login errors
   */
  async hasLoginErrors(): Promise<boolean> {
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
   * Get login error messages
   */
  async getLoginErrors(): Promise<string[]> {
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
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('forgot_password_page');
    }
  }
  
  /**
   * Click register link
   */
  async clickRegister(): Promise<void> {
    await this.registerLink.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('register_page');
    }
  }
  
  /**
   * Test valid login
   * @param email Email address
   * @param password Password
   */
  async testValidLogin(email: string, password: string): Promise<boolean> {
    await this.login(email, password);
    
    return await this.isLoginSuccessful();
  }
  
  /**
   * Test invalid login
   * @param email Email address
   * @param password Password
   */
  async testInvalidLogin(email: string, password: string): Promise<string[]> {
    await this.login(email, password);
    
    // Check for errors
    const hasErrors = await this.hasLoginErrors();
    expect(hasErrors).toBe(true, 'Invalid login should show errors');
    
    // Get error messages
    return this.getLoginErrors();
  }
}
