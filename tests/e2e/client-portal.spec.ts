import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

/**
 * Test suite for client portal
 * Tests authentication, appointment viewing, and other client-specific features
 */
test.describe('Client Portal', () => {
  const prisma = new PrismaClient();
  let testUser;
  
  test.beforeAll(async () => {
    await prisma.$connect();
    
    // Create a test user for auth tests
    // We'll use a unique email to ensure it doesn't conflict with existing users
    const email = `test-user-${Date.now()}@example.com`;
    
    try {
      // Check if User table exists
      const userTable = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'User'
        );
      `;
      
      if (userTable[0].exists) {
        // Create test user in database if table exists
        testUser = await prisma.user.create({
          data: {
            email,
            name: 'Test Client',
            // This is a test password, not a real credential
            password: '$2a$10$EYHml2JavBG84G9UxQ/pzOs06L3.78jZDfPd9KP.NeRj/r33YNica', // "password123"
            role: 'client'
          }
        });
        
        console.log('Created test user for client portal tests');
      } else {
        console.log('User table not found, skipping test user creation');
      }
    } catch (error) {
      console.error('Error setting up client portal tests:', error);
    }
  });
  
  test.afterAll(async () => {
    // Clean up test user
    if (testUser?.id) {
      try {
        await prisma.user.delete({
          where: {
            id: testUser.id
          }
        });
        console.log('Deleted test user');
      } catch (error) {
        console.error('Error deleting test user:', error);
      }
    }
    
    await prisma.$disconnect();
  });
  
  test('client login page should be accessible', async ({ page }) => {
    // Navigate to client login page
    await page.goto('/client/login');
    
    // Verify login form exists
    const formExists = await page.isVisible('form');
    expect(formExists).toBe(true);
    
    // Check for email and password fields
    const emailField = await page.isVisible('input[type="email"]');
    const passwordField = await page.isVisible('input[type="password"]');
    const loginButton = await page.isVisible('button[type="submit"]');
    
    expect(emailField).toBe(true);
    expect(passwordField).toBe(true);
    expect(loginButton).toBe(true);
  });
  
  test('client registration should be accessible', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/client/register');
    
    // Verify registration form exists
    const formExists = await page.isVisible('form');
    expect(formExists).toBe(true);
    
    // Check for required registration fields
    const nameField = await page.isVisible('input[name="name"]');
    const emailField = await page.isVisible('input[type="email"]');
    const passwordField = await page.isVisible('input[type="password"]');
    const registerButton = await page.isVisible('button[type="submit"]');
    
    expect(nameField).toBe(true);
    expect(emailField).toBe(true);
    expect(passwordField).toBe(true);
    expect(registerButton).toBe(true);
  });
  
  test('forgot password flow should be functional', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/client/forgot-password');
    
    // Verify form exists
    const formExists = await page.isVisible('form');
    expect(formExists).toBe(true);
    
    // Check for email field and submit button
    const emailField = await page.isVisible('input[type="email"]');
    const submitButton = await page.isVisible('button[type="submit"]');
    
    expect(emailField).toBe(true);
    expect(submitButton).toBe(true);
    
    // Fill in form with test email and submit
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Verify success message appears
    const successMessage = await page.waitForSelector('text=reset link');
    expect(successMessage).toBeTruthy();
  });
  
  test('client dashboard should be protected', async ({ page }) => {
    // Attempt to access client dashboard without authentication
    await page.goto('/client');
    
    // Should be redirected to login
    await page.waitForURL('**/login**');
    expect(page.url()).toContain('/login');
  });
  
  test('client authentication process', async ({ page }) => {
    // Skip if test user wasn't created
    test.skip(!testUser, 'Test requires User table to exist');
    
    // Navigate to login page
    await page.goto('/client/login');
    
    // Fill login form with test credentials
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Expect successful redirect to client dashboard
    await page.waitForURL('**/client**');
    expect(page.url()).toContain('/client');
    
    // Verify logged in state - look for user name
    const userNameVisible = await page.isVisible(`text=${testUser.name}`);
    expect(userNameVisible).toBe(true);
  });
  
  test('appointments section should show client bookings', async ({ page }) => {
    // Skip if test user wasn't created
    test.skip(!testUser, 'Test requires User table to exist');
    
    // Login first
    await page.goto('/client/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/client**');
    
    // Navigate to appointments section
    await page.click('a[href*="/client/appointments"]');
    await page.waitForURL('**/client/appointments**');
    
    // Verify appointments section is shown
    const appointmentsTitle = await page.isVisible('h1:has-text("Appointments")');
    expect(appointmentsTitle).toBe(true);
    
    // Should at least show empty state if no appointments
    const emptyStateOrAppointmentsList = await page.isVisible('text=No appointments yet, text=Your Appointments');
    expect(emptyStateOrAppointmentsList).toBe(true);
  });
  
  test('logout process should work', async ({ page }) => {
    // Skip if test user wasn't created
    test.skip(!testUser, 'Test requires User table to exist');
    
    // Login first
    await page.goto('/client/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/client**');
    
    // Find and click logout button
    await page.click('button:has-text("Logout")');
    
    // Should be redirected to login page
    await page.waitForURL('**/login**');
    expect(page.url()).toContain('/login');
  });
});