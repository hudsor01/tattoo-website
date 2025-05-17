import { test, expect } from './helpers/test-fixtures';
import { EnhancedRegistrationPage } from './page-objects/enhanced-registration-page';
import { AuthHelper } from './helpers/auth-helper';

/**
 * Enhanced E2E test suite for authentication registration flows
 */
test.describe('Authentication Registration Tests', () => {
  test.beforeAll(async ({ page }) => {
    // Setup for registration tests
    console.log('Setting up registration tests');
  });
  
  test.afterAll(async ({ page }) => {
    // Clean up after registration tests
    const authHelper = new AuthHelper(page);
    await authHelper.cleanup();
    console.log('Cleaned up after registration tests');
  });
  
  test('should display registration form with all required fields and match visual baseline', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced registration page
    const registrationPage = new EnhancedRegistrationPage(page);
    registrationPage.setVisualTesting(visualTesting);
    
    // Navigate to registration page
    await registrationPage.goto();
    
    // Verify registration form fields are present
    await expect(registrationPage.emailField).toBeVisible();
    await expect(registrationPage.passwordField).toBeVisible();
    await expect(registrationPage.firstNameField).toBeVisible();
    await expect(registrationPage.lastNameField).toBeVisible();
    await expect(registrationPage.submitButton).toBeVisible();
    
    // Additional visual verification of the whole page
    await visualTesting.captureAndCompare('registration_page_full');
    
    // Verify the page matches our visual baseline
    await expect({ visualTesting }).toMatchVisualBaseline('registration_page_baseline');
  });
  
  test('should register successfully with valid information', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced registration page
    const registrationPage = new EnhancedRegistrationPage(page);
    registrationPage.setVisualTesting(visualTesting);
    
    // Test valid registration
    const result = await registrationPage.testValidRegistration();
    
    // Verify registration was successful
    expect(result.success).toBe(true, 'Registration should be successful with valid information');
    
    // Handle email verification if required
    if (result.requiresVerification) {
      console.log('Email verification is required');
      
      // Verify email and login
      const loginSuccess = await registrationPage.verifyEmailAndLogin(
        result.userData.email || '',
        result.userData.password || ''
      );
      
      expect(loginSuccess).toBe(true, 'Should be able to login after email verification');
    } else {
      // Check for redirect to dashboard
      expect(page.url()).toContain('/dashboard');
    }
  });
  
  test('should show validation errors for invalid email format', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced registration page
    const registrationPage = new EnhancedRegistrationPage(page);
    registrationPage.setVisualTesting(visualTesting);
    
    // Test invalid registration with bad email
    const errors = await registrationPage.testInvalidRegistration({
      email: 'not-an-email',
    });
    
    // Verify error messages
    expect(errors.length).toBeGreaterThan(0, 'Invalid email should trigger validation errors');
    expect(errors.join(' ')).toContain('email', 'Error message should mention email validation');
  });
  
  test('should show validation errors for weak password', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced registration page
    const registrationPage = new EnhancedRegistrationPage(page);
    registrationPage.setVisualTesting(visualTesting);
    
    // Test invalid registration with weak password
    const errors = await registrationPage.testInvalidRegistration({
      password: 'weak',
    });
    
    // Verify error messages
    expect(errors.length).toBeGreaterThan(0, 'Weak password should trigger validation errors');
    expect(errors.join(' ')).toMatch(/password|strong|requirements/i, 'Error message should mention password requirements');
  });
  
  test('should show validation errors for missing required fields', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced registration page
    const registrationPage = new EnhancedRegistrationPage(page);
    registrationPage.setVisualTesting(visualTesting);
    
    // Navigate to registration page
    await registrationPage.goto();
    
    // Submit the form without filling any fields
    await registrationPage.submitRegistrationForm();
    
    // Check for errors
    const hasErrors = await registrationPage.hasRegistrationErrors();
    expect(hasErrors).toBe(true, 'Empty form should show validation errors');
    
    // Get error messages
    const errors = await registrationPage.getRegistrationErrors();
    
    // Verify error messages for required fields
    expect(errors.length).toBeGreaterThan(0, 'Empty form should trigger validation errors');
    expect(errors.join(' ')).toMatch(/required|missing|empty/i, 'Error message should mention required fields');
    
    // Visual verification of error state
    await visualTesting.captureAndCompare('registration_empty_form_errors');
  });
  
  test('should navigate to login page', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced registration page
    const registrationPage = new EnhancedRegistrationPage(page);
    registrationPage.setVisualTesting(visualTesting);
    
    // Navigate to registration page
    await registrationPage.goto();
    
    // Click login link
    await registrationPage.clickLogin();
    
    // Verify redirect to login page
    expect(page.url()).toContain('/auth/login');
  });
  
  test('should prevent duplicate email registration', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced registration page
    const registrationPage = new EnhancedRegistrationPage(page);
    registrationPage.setVisualTesting(visualTesting);
    
    // Create a test user first
    const authHelper = new AuthHelper(page);
    const existingUser = await authHelper.createTestUser('client');
    
    // Test registration with duplicate email
    const errors = await registrationPage.testInvalidRegistration({
      email: existingUser.email,
    });
    
    // Verify error messages
    expect(errors.length).toBeGreaterThan(0, 'Duplicate email should trigger validation errors');
    expect(errors.join(' ')).toMatch(/already|exists|taken/i, 'Error message should mention email already exists');
  });
});
