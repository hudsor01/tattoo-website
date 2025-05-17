import { Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { TEST_PREFIX } from '../test-constants';

/**
 * Authentication helper for E2E tests
 * Manages test user creation, authentication, and cleanup
 */
export class AuthHelper {
  private prisma: PrismaClient;
  private page: Page;
  private createdUsers: TestUser[] = [];
  
  constructor(page: Page) {
    this.page = page;
    this.prisma = new PrismaClient();
    
    // Ensure connection
    this.prisma.$connect().then(() => {
      console.log('Connected to database for auth helper');
    });
    
    // Register cleanup on process exit
    process.on('exit', () => {
      this.cleanup().catch(err => {
        console.error('Error during auth cleanup:', err);
      });
    });
  }
  
  /**
   * Create a test user with specified role
   * @param role User role (client, admin, artist)
   * @param overrides Optional overrides for user data
   */
  async createTestUser(role: 'client' | 'admin' | 'artist', overrides: Partial<any> = {}): Promise<TestUser> {
    // Generate unique ID for test user
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
    
    // Default user data based on role
    const email = overrides.email || `${TEST_PREFIX}${role}-${uniqueId}@example.com`;
    const password = overrides.password || 'Test-Password123!';
    const firstName = overrides.firstName || `${TEST_PREFIX}First${uniqueId}`;
    const lastName = overrides.lastName || `${TEST_PREFIX}Last${uniqueId}`;
    
    // Create user in database
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role,
        password: await this.hashPassword(password),
        emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : true,
      }
    });
    
    // Create test user object
    const testUser: TestUser = {
      id: user.id,
      email,
      password,
      firstName, 
      lastName,
      role,
    };
    
    // Register for cleanup
    this.createdUsers.push(testUser);
    
    return testUser;
  }
  
  /**
   * Log in with a test user
   * @param user Test user to log in with
   */
  async login(user: TestUser): Promise<void> {
    // Navigate to login page
    await this.page.goto('/auth/login');
    
    // Fill login form
    await this.page.fill('input[name="email"]', user.email);
    await this.page.fill('input[name="password"]', user.password);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect after login
    await this.page.waitForURL(/\/dashboard|\/admin/);
    
    // Verify login state
    const isLoggedIn = await this.isLoggedIn();
    if (!isLoggedIn) {
      throw new Error(`Failed to log in as ${user.email}`);
    }
  }
  
  /**
   * Register a new test user
   * @param user Test user to register
   */
  async register(user: TestUser): Promise<void> {
    // Navigate to registration page
    await this.page.goto('/auth/register');
    
    // Fill registration form
    await this.page.fill('input[name="email"]', user.email);
    await this.page.fill('input[name="password"]', user.password);
    await this.page.fill('input[name="firstName"]', user.firstName);
    await this.page.fill('input[name="lastName"]', user.lastName);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect after registration
    await this.page.waitForURL(/\/auth\/verify|\/dashboard/);
    
    // If email verification is required, verify directly in database
    const currentUrl = this.page.url();
    if (currentUrl.includes('/auth/verify')) {
      await this.verifyEmail(user.email);
      
      // Navigate to login page
      await this.page.goto('/auth/login');
      
      // Log in with newly registered user
      await this.login(user);
    }
  }
  
  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    // Check for authenticated-only elements
    const logoutButton = this.page.locator('button[data-testid="logout-button"]');
    const userMenu = this.page.locator('[data-testid="user-menu"]');
    
    return (await logoutButton.count() > 0) || (await userMenu.count() > 0);
  }
  
  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    // Click logout button if visible
    const logoutButton = this.page.locator('button[data-testid="logout-button"]');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
    } else {
      // Try user menu first
      const userMenu = this.page.locator('[data-testid="user-menu"]');
      if (await userMenu.count() > 0) {
        await userMenu.click();
        
        // Find and click logout option
        await this.page.click('text=Logout');
      }
    }
    
    // Wait for redirect to login page
    await this.page.waitForURL(/\/auth\/login|\/$/);
    
    // Verify logout
    const isLoggedIn = await this.isLoggedIn();
    if (isLoggedIn) {
      throw new Error('Failed to log out');
    }
  }
  
  /**
   * Verify user email directly in database
   * @param email Email to verify
   */
  async verifyEmail(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
  }
  
  /**
   * Hash a password
   * @param password Password to hash
   */
  private async hashPassword(password: string): Promise<string> {
    // In a real implementation, this would use bcrypt or similar
    // For testing purposes, we'll use a simple hash
    return `hashed_${password}`;
  }
  
  /**
   * Clean up test users
   */
  async cleanup(): Promise<void> {
    console.log(`Cleaning up ${this.createdUsers.length} test users...`);
    
    for (const user of this.createdUsers) {
      try {
        await this.prisma.user.delete({
          where: { id: user.id },
        });
      } catch (error) {
        console.warn(`Failed to delete test user ${user.email}:`, error);
      }
    }
    
    // Clear created users list
    this.createdUsers = [];
    
    // Disconnect from database
    await this.prisma.$disconnect();
  }
}

/**
 * Test user interface
 */
export interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin' | 'artist';
}

/**
 * Get a singleton instance of the auth helper
 */
export function getAuthHelper(page: Page): AuthHelper {
  return new AuthHelper(page);
}
