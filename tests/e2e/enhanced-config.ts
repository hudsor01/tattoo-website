import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Enhanced configuration for Playwright E2E tests
 * Integrates with our improved test framework
 */
const config: PlaywrightTestConfig = {
  // Directory where tests are located
  testDir: './tests/e2e',
  
  // Timeout for each test
  timeout: 60000,
  
  // Expect assertion timeout
  expect: {
    timeout: 10000,
  },
  
  // Only allow .spec.ts files
  testMatch: /.*\.spec\.ts/,
  
  // Forbid test.only on CI
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 1,
  
  // Use a single worker on CI, parallel locally
  workers: process.env.CI ? 1 : undefined,
  
  // Reporters: default list + our custom reporter
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['./tests/e2e/helpers/enhanced-test-reporter.ts'],
  ],
  
  // Use artifacts directory
  outputDir: 'test-results/artifacts',
  
  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  
  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    
    // Collect trace on retry
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // Record video on first retry
    video: 'on-first-retry',
    
    // Record console logs
    logger: {
      isEnabled: true,
    },
    
    // Use color scheme that matches our app
    colorScheme: 'dark',
    
    // Browser viewport size
    viewport: { width: 1280, height: 720 },
    
    // Additional options for visual testing
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    },
    
    // Custom visual testing config - will be passed to our VisualTesting class
    visualTesting: {
      enabled: process.env.VISUAL_TESTING === 'true',
      createMissingBaseline: process.env.CREATE_MISSING_BASELINE === 'true',
      threshold: parseFloat(process.env.VISUAL_THRESHOLD || '0.1'),
    },
  },
  
  // Projects for different browsers and environments
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    // Performance testing project with specific configuration
    {
      name: 'performance',
      testMatch: /.*\.perf\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
          ],
        },
      },
    },
    // Public website tests
    {
      name: 'public',
      testMatch: /public-.*\.spec\.ts|gallery-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Authentication tests
    {
      name: 'auth',
      testMatch: /auth-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Client portal tests
    {
      name: 'client',
      testMatch: /client-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Admin dashboard tests
    {
      name: 'admin',
      testMatch: /admin-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // End-to-end flow tests
    {
      name: 'e2e-flows',
      testMatch: /end-to-end-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // Folder for test artifacts
  webServer: {
    command: 'npm run start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
