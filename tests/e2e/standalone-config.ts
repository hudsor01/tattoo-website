import { defineConfig, devices } from '@playwright/test';

/**
 * Standalone configuration for tests that don't need a live server
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env['CI'],
  
  // Retry on CI only
  retries: process.env['CI'] ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env['CI'] ? 1 : '50%',
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report-standalone' }],
    ['json', { outputFile: 'playwright-report-standalone/test-results.json' }],
    ['list'],
  ],
  
  // Shared settings for all the projects
  use: {
    // Base URL is not needed for mock tests
    // baseURL: 'http://localhost:3000',
    
    // Capture screenshot after each test failure
    screenshot: 'only-on-failure',
    
    // Record video only on failure
    video: 'on-first-retry',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
  },
  
  // Configure projects for different environments
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  
  // No web server needed for these tests
  // webServer: { ... }
});
