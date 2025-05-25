import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async loginAsAdmin() {
    // Production-ready authentication for E2E testing
    // Uses real Supabase auth with test credentials
    await this.page.goto('/sign-in');
    
    // Fill in test admin credentials
    await this.page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@test.com');
    await this.page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'testpassword123');
    
    // Submit login form
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await this.page.waitForURL('**/admin**');
    
    // Verify admin access by checking for admin-specific elements
    await this.page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 10000 });
  }

  async loginAsCustomer() {
    // Production-ready customer authentication
    await this.page.goto('/sign-in');
    
    await this.page.fill('input[name="email"]', process.env.TEST_CUSTOMER_EMAIL || 'customer@test.com');
    await this.page.fill('input[name="password"]', process.env.TEST_CUSTOMER_PASSWORD || 'testpassword123');
    
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to customer area or home
    await this.page.waitForNavigation();
  }

  async logout() {
    // Navigate to logout or click logout button
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('**/');
  }

  async createTestUser(email: string, password: string, role: 'admin' | 'customer' = 'customer') {
    // Create a test user via API for testing purposes
    const response = await this.page.request.post('/api/test/create-user', {
      data: {
        email,
        password,
        role,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to create test user: ${response.status()}`);
    }

    return response.json();
  }

  async cleanupTestUsers() {
    // Clean up test users after tests
    await this.page.request.delete('/api/test/cleanup-users');
  }

  async verifyAuthState(expectedState: 'authenticated' | 'unauthenticated') {
    // Verify current authentication state
    const isAuthenticated = await this.page.evaluate(() => {
      // Check for auth tokens or user state
      return !!localStorage.getItem('supabase.auth.token') || 
             !!sessionStorage.getItem('supabase.auth.token');
    });

    if (expectedState === 'authenticated' && !isAuthenticated) {
      throw new Error('Expected user to be authenticated but they are not');
    }

    if (expectedState === 'unauthenticated' && isAuthenticated) {
      throw new Error('Expected user to be unauthenticated but they are');
    }
  }

  async waitForAuthLoad() {
    // Wait for auth state to be fully loaded
    await this.page.waitForFunction(() => {
      return window.localStorage.getItem('supabase.auth.token') !== null ||
             window.sessionStorage.getItem('supabase.auth.token') !== null;
    }, { timeout: 5000 });
  }

  async mockAPIEndpoints() {
    // Mock only necessary API endpoints for isolated testing
    // Use real API calls when possible for integration testing
    
    // Mock only failing scenarios or rate-limited endpoints
    await this.page.route('**/api/admin/stats**', (route) => {
      if (process.env.MOCK_API_ENDPOINTS === 'true') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalCustomers: 150,
            totalBookings: 89,
            totalRevenue: 25000,
            completionRate: 94,
          }),
        });
      } else {
        route.continue();
      }
    });
  }

  async setupTestData() {
    // Set up test data in the database for consistent testing
    await this.page.request.post('/api/test/setup-data', {
      data: {
        customers: 5,
        bookings: 10,
        designs: 8,
      },
    });
  }

  async teardownTestData() {
    // Clean up test data after tests
    await this.page.request.delete('/api/test/cleanup-data');
  }
}