import { test, expect } from './helpers/test-fixtures';
import { EnhancedLoginPage } from './page-objects/enhanced-login-page';
import { AuthHelper } from './helpers/auth-helper';

/**
 * Enhanced E2E test suite for authentication login flows
 */
test.describe('Authentication Login Tests', () => {
  let testClientEmail: string;
  let testClientPassword: string;
  let testAdminEmail: string;
  let testAdminPassword: string;
  
  test.beforeAll(async ({ page }) => {
    // Create test users for login tests
    const authHelper = new AuthHelper(page);
    
    // Create client test user
    const clientUser = await authHelper.createTestUser('client');
    testClientEmail = clientUser.email;
    testClientPassword = clientUser.password;
    
    // Create admin test user
    const adminUser = await authHelper.createTestUser('admin');
    testAdminEmail = adminUser.email;
    testAdminPassword = adminUser.password;
    
    console.log('Created test users for login tests');
  });
  
  test.afterAll(async ({ page }) => {
    // Clean up test users
    const authHelper = new AuthHelper(page);
    await authHelper.cleanup();
    console.log('Cleaned up test users for login tests');
  });
  
  test('should display login form with all required fields and match visual baseline', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced login page
    const loginPage = new EnhancedLoginPage(page);
    loginPage.setVisualTesting(visualTesting);
    
    // Navigate to login page
    await loginPage.goto();
    
    // Verify login form fields are present
    await expect(loginPage.emailField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    
    // Additional visual verification of the whole page
    await visualTesting.captureAndCompare('login_page_full');
    
    // Verify the page matches our visual baseline
    await expect({ visualTesting }).toMatchVisualBaseline('login_page_baseline');
  });
  
  test('should login successfully with valid client credentials', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced login page
    const loginPage = new EnhancedLoginPage(page);
    loginPage.setVisualTesting(visualTesting);
    
    // Test valid login
    const isSuccessful = await loginPage.testValidLogin(testClientEmail, testClientPassword);
    
    // Verify login was successful
    expect(isSuccessful).toBe(true, 'Login should be successful with valid credentials');
    
    // Verify redirect to client dashboard
    expect(page.url()).toContain('/dashboard');
  });
  
  test('should login successfully with valid admin credentials', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced login page
    const loginPage = new EnhancedLoginPage(page);
    loginPage.setVisualTesting(visualTesting);
    
    // Test valid login
    const isSuccessful = await loginPage.testValidLogin(testAdminEmail, testAdminPassword);
    
    // Verify login was successful
    expect(isSuccessful).toBe(true, 'Login should be successful with valid credentials');
    
    // Verify redirect to admin dashboard
    expect(page.url()).toContain('/admin');
  });
  
  test('should show error messages with invalid credentials', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced login page
    const loginPage = new EnhancedLoginPage(page);
    loginPage.setVisualTesting(visualTesting);
    
    // Test invalid login
    const errors = await loginPage.testInvalidLogin('invalid@example.com', 'WrongPassword');
    
    // Verify error messages
    expect(errors.length).toBeGreaterThan(0, 'Invalid login should show error messages');
    expect(errors.join(' ')).toContain('credentials', 'Error message should mention invalid credentials');
    
    // Visual verification of error state
    await visualTesting.captureAndCompare('login_error_state');
  });
  
  test('should navigate to forgot password page', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced login page
    const loginPage = new EnhancedLoginPage(page);
    loginPage.setVisualTesting(visualTesting);
    
    // Navigate to login page
    await loginPage.goto();
    
    // Click forgot password link
    await loginPage.clickForgotPassword();
    
    // Verify redirect to forgot password page
    expect(page.url()).toContain('/auth/forgot-password');
  });
  
  test('should navigate to registration page', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced login page
    const loginPage = new EnhancedLoginPage(page);
    loginPage.setVisualTesting(visualTesting);
    
    // Navigate to login page
    await loginPage.goto();
    
    // Click register link
    await loginPage.clickRegister();
    
    // Verify redirect to registration page
    expect(page.url()).toContain('/auth/register');
  });
});
