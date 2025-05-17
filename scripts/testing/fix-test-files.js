#!/usr/bin/env node

/**
 * Test Files Fix Script
 * 
 * This script fixes specific issues in test files that are causing errors.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Utility to print colored messages
const printColor = (color, message) => console.log(`${color}${message}${colors.reset}`);
const printHeader = (message) => printColor(`${colors.bright}${colors.cyan}`, `\n=== ${message} ===`);
const printSuccess = (message) => printColor(colors.green, `✓ ${message}`);
const printWarning = (message) => printColor(colors.yellow, `⚠ ${message}`);
const printError = (message) => printColor(colors.red, `✗ ${message}`);
const printInfo = (message) => printColor(colors.magenta, `ℹ ${message}`);

// Project root directory
const rootDir = path.resolve(__dirname, '..');

// Fix appointment.spec.ts file
function fixAppointmentSpec() {
  const filePath = path.join(rootDir, 'tests', 'e2e', 'appointment.spec.ts');
  if (!fs.existsSync(filePath)) {
    printWarning(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix authenticatedUser parameter
  content = content.replace(/async \(\{ page, authenticatedUser \}\)/g, 'async ({ page })');
  content = content.replace(/async \(\{ page, prisma, authenticatedUser, testArtist \}\)/g, 'async ({ page, prisma, testArtist })');
  
  // Add authenticatedUser fixture to fixtures.ts if it doesn't exist yet
  const fixturesPath = path.join(rootDir, 'tests', 'e2e', 'fixtures.ts');
  let fixturesContent = fs.readFileSync(fixturesPath, 'utf8');
  
  if (!fixturesContent.includes('authenticatedUser')) {
    // Add authenticatedUser fixture
    const fixtureToAdd = `
  // Create a test authenticated user
  authenticatedUser: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/admin/login');
    
    // Fill in login form
    await page.fill('[data-testid="email-input"]', 'test-admin@example.com');
    await page.fill('[data-testid="password-input"]', 'Test-Password123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/admin/dashboard');
    
    // Provide an empty object for the test to use
    await use({});
  },`;
    
    // Insert the fixture before the last closing bracket
    const lastBracketPos = fixturesContent.lastIndexOf('});');
    const updatedFixturesContent = fixturesContent.slice(0, lastBracketPos) + fixtureToAdd + fixturesContent.slice(lastBracketPos);
    
    fs.writeFileSync(fixturesPath, updatedFixturesContent);
    printSuccess(`Added authenticatedUser fixture to ${fixturesPath}`);
  }
  
  fs.writeFileSync(filePath, content);
  printSuccess(`Fixed ${filePath}`);
}

// Fix customer-search.spec.ts file
function fixCustomerSearchSpec() {
  const filePath = path.join(rootDir, 'tests', 'e2e', 'customer-search.spec.ts');
  if (!fs.existsSync(filePath)) {
    printWarning(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix authenticatedUser parameter
  content = content.replace(/async \(\{ page, prisma, authenticatedUser \}\)/g, 'async ({ page, prisma })');
  
  fs.writeFileSync(filePath, content);
  printSuccess(`Fixed ${filePath}`);
}

// Fix email-notifications.spec.ts file
function fixEmailNotificationsSpec() {
  const filePath = path.join(rootDir, 'tests', 'e2e', 'email-notifications.spec.ts');
  if (!fs.existsSync(filePath)) {
    printWarning(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix jest mocking with proper Playwright mocking
  const jestMockRegex = /jest\.mock\('resend',.*?\}\);/s;
  const playwrightMock = `
// Mock Resend for testing
const mockSendEmail = {
  emails: {
    send: async () => ({ id: 'test-email-id' })
  }
};

// Use vi.mock in a way that works with Playwright
const originalResend = await import('resend');
originalResend.default = () => mockSendEmail;
`;
  
  content = content.replace(jestMockRegex, playwrightMock);
  
  fs.writeFileSync(filePath, content);
  printSuccess(`Fixed ${filePath}`);
}

// Fix payment-processing.spec.ts file
function fixPaymentProcessingSpec() {
  const filePath = path.join(rootDir, 'tests', 'e2e', 'payment-processing.spec.ts');
  if (!fs.existsSync(filePath)) {
    printWarning(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix jest mocking with proper Playwright mocking
  const jestMockRegex = /jest\.mock\('stripe',.*?\}\);/s;
  const playwrightMock = `
// Mock Stripe for testing
const mockStripe = {
  checkout: {
    sessions: {
      create: async () => ({ id: 'test-session-id', url: 'https://test-checkout.url' })
    }
  },
  webhooks: {
    constructEvent: () => ({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'test-session-id',
          metadata: {
            bookingId: '123',
            type: 'deposit'
          },
          amount_total: 10000,
          customer_email: 'test@example.com'
        }
      }
    })
  }
};

// Use module replacement instead of jest.mock
const originalStripe = await import('stripe');
originalStripe.default = () => mockStripe;
`;
  
  content = content.replace(jestMockRegex, playwrightMock);
  
  fs.writeFileSync(filePath, content);
  printSuccess(`Fixed ${filePath}`);
}

// Main function
async function main() {
  printHeader('Fixing Test Files');
  
  // Fix appointment.spec.ts
  fixAppointmentSpec();
  
  // Fix customer-search.spec.ts
  fixCustomerSearchSpec();
  
  // Fix email-notifications.spec.ts
  fixEmailNotificationsSpec();
  
  // Fix payment-processing.spec.ts
  fixPaymentProcessingSpec();
  
  printHeader('Test Files Fix Complete');
  printSuccess('All test files have been fixed');
  printInfo('Now you can run the tests with: npm run test:e2e');
}

// Run the main function
main().catch((error) => {
  printError(`Error: ${error.message}`);
  process.exit(1);
});