#!/usr/bin/env node

/**
 * Test Organization Improvement Script
 * 
 * This script improves the organization and documentation of the testing infrastructure
 * for the Ink 37 Tattoo Studio website project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Main function
async function main() {
  printHeader('Test Organization Improvement');
  
  // 1. Create or update README.md files for test directories
  updateReadmes();
  
  // 2. Create test constants file for reusable values
  createTestConstants();
  
  // 3. Ensure consistent fixtures across test files
  createSharedFixtures();
  
  // 4. Update test commands in package.json
  updateTestCommands();
  
  // 5. Create comprehensive test documentation
  createTestDocumentation();
  
  printHeader('Test Organization Improvements Complete');
  printSuccess('All test organization improvements have been applied');
  printInfo('Run tests with: npm run test or npm run test:e2e');
}

// Function to update README.md files in test directories
function updateReadmes() {
  printHeader('Updating Test README.md Files');
  
  // Update main tests README
  const testsReadmePath = path.join(rootDir, 'tests', 'README.md');
  const testsReadmeContent = `# Testing Documentation
  
This directory contains all tests for the Ink 37 Tattoo Studio website.

## Test Types

- **Unit Tests**: Located in \`/tests/unit\` - Fast tests for individual components and functions
- **E2E Tests**: Located in \`/tests/e2e\` - End-to-end tests using Playwright
- **Supabase E2E Tests**: Located in \`/tests/e2e-supabase\` - Tests that interact directly with Supabase

## Running Tests

Run all tests:
\`\`\`bash
npm run test
\`\`\`

Run only E2E tests:
\`\`\`bash
npm run test:e2e
\`\`\`

Run only Supabase E2E tests:
\`\`\`bash
npm run test:e2e:supabase
\`\`\`

Run tests with UI:
\`\`\`bash
npm run test:ui
\`\`\`

## Test Configuration

- **playwright.config.ts**: Configuration for standard E2E tests
- **playwright.config.supabase.ts**: Configuration for Supabase E2E tests
- **jest.config.js**: Configuration for unit tests

## Test Setup

- **global-setup.ts**: Sets up database and environment before tests
- **global-teardown.ts**: Cleans up after tests
- **setup.ts**: Provides fixtures and utilities for tests
`;

  fs.writeFileSync(testsReadmePath, testsReadmeContent);
  printSuccess('Updated main tests README.md');
  
  // Update unit tests README
  const unitReadmePath = path.join(rootDir, 'tests', 'unit', 'README.md');
  const unitReadmeContent = `# Unit Tests

This directory contains unit tests for individual components, hooks, and utilities.

## Structure

- **components/**: Tests for React components
- **hooks/**: Tests for custom hooks
- **utils/**: Tests for utility functions
- **stores/**: Tests for state stores

## Running Unit Tests

\`\`\`bash
npm run test:unit
\`\`\`

## Best Practices

1. Each test file should correspond to a single source file
2. Use \`__mocks__\` directory for mocks
3. Follow naming convention: \`[filename].test.ts\` or \`[filename].test.tsx\`
4. Use Jest's built-in utilities for mocking and assertions
`;

  fs.writeFileSync(unitReadmePath, unitReadmeContent);
  printSuccess('Updated unit tests README.md');
  
  // Update e2e tests README
  const e2eReadmePath = path.join(rootDir, 'tests', 'e2e', 'README.md');
  const e2eReadmeContent = `# End-to-End Tests

This directory contains end-to-end tests using Playwright.

## Structure

- **global-setup.ts**: Sets up database and environment before all tests
- **global-teardown.ts**: Cleans up after all tests
- **setup.ts**: Provides fixtures and utilities for tests
- **test-constants.ts**: Shared constants for tests
- **fixtures.ts**: Shared test fixtures

## Test Files

- **appointment.spec.ts**: Tests for appointment scheduling
- **customer-search.spec.ts**: Tests for customer search functionality
- **data-import.spec.ts**: Tests for data import features
- **database-functions.spec.ts**: Tests for database functions
- **email-notifications.spec.ts**: Tests for email notifications
- **payment-processing.spec.ts**: Tests for payment processing

## Running E2E Tests

\`\`\`bash
npm run test:e2e
\`\`\`

## Running with UI

\`\`\`bash
npm run test:ui
\`\`\`

## Best Practices

1. Isolate tests with unique prefixes for test data
2. Clean up all test data in \`afterEach\` or \`afterAll\` blocks
3. Use fixtures for repeated setup
4. Keep tests independent of each other
`;

  fs.writeFileSync(e2eReadmePath, e2eReadmeContent);
  printSuccess('Updated E2E tests README.md');
  
  // Update Supabase e2e tests README if it doesn't exist
  const supabaseE2eReadmePath = path.join(rootDir, 'tests', 'e2e-supabase', 'README.md');
  if (!fs.existsSync(supabaseE2eReadmePath) || fs.readFileSync(supabaseE2eReadmePath, 'utf8').length < 100) {
    const supabaseE2eReadmeContent = `# Supabase End-to-End Tests

This directory contains end-to-end tests that interact directly with Supabase.

## Structure

- **setup.ts**: Provides fixtures and utilities for tests
- **test-constants.ts**: Shared constants for Supabase tests
- **fixtures.ts**: Shared Supabase test fixtures

## Test Files

- **booking.spec.ts**: Tests for booking flow with Supabase
- **contact.spec.ts**: Tests for contact form with Supabase
- **crm.spec.ts**: Tests for CRM features with Supabase
- **database.spec.ts**: Tests for database operations with Supabase

## Running Supabase E2E Tests

\`\`\`bash
npm run test:e2e:supabase
\`\`\`

## Important Notes

1. These tests connect directly to your Supabase database
2. Tests use the \`test_\` prefix to isolate test data
3. Tests clean up after themselves, but some data might remain in case of failures
4. Run tests on a development database, never on production
`;

    fs.writeFileSync(supabaseE2eReadmePath, supabaseE2eReadmeContent);
    printSuccess('Updated Supabase E2E tests README.md');
  }
}

// Function to create test constants file
function createTestConstants() {
  printHeader('Creating Test Constants Files');
  
  // Create constants for E2E tests
  const e2eConstantsPath = path.join(rootDir, 'tests', 'e2e', 'test-constants.ts');
  const e2eConstantsContent = `/**
 * Shared constants for E2E tests
 */

// Test data prefixes to isolate test data
export const TEST_PREFIX = 'e2e_test_';

// Test user credentials
export const TEST_ADMIN_EMAIL = 'test-admin@example.com';
export const TEST_ADMIN_PASSWORD = 'Test-Password123!';
export const TEST_USER_EMAIL = 'test-user@example.com';
export const TEST_USER_PASSWORD = 'Test-Password123!';

// Test customer data
export const TEST_CUSTOMER = {
  firstName: 'Test',
  lastName: 'Customer',
  email: 'test-customer@example.com',
  phone: '5551234567',
};

// Test booking data
export const TEST_BOOKING = {
  name: 'Test Booking',
  email: 'test-booking@example.com',
  phone: '5551234567',
  tattooType: 'custom',
  size: 'medium',
  placement: 'arm',
  description: 'Test booking created by E2E test',
  preferredTime: 'afternoon',
  paymentMethod: 'card',
};

// Test appointment data
export const TEST_APPOINTMENT = {
  title: 'Test Appointment',
  notes: 'Test appointment created by E2E test',
  duration: 120, // 2 hours
};

// Test payment data
export const TEST_PAYMENT = {
  amount: 100,
  paymentMethod: 'card',
  status: 'pending',
};

// Routes for testing
export const ROUTES = {
  home: '/',
  booking: '/booking',
  gallery: '/gallery',
  admin: {
    dashboard: '/admin/dashboard',
    customers: '/admin/dashboard/customers',
    appointments: '/admin/dashboard/appointments',
    payments: '/admin/dashboard/payments',
  },
  auth: {
    login: '/admin/login',
  },
};
`;

  fs.writeFileSync(e2eConstantsPath, e2eConstantsContent);
  printSuccess('Created E2E test constants file');
  
  // Create constants for Supabase E2E tests
  const supabaseE2eConstantsPath = path.join(rootDir, 'tests', 'e2e-supabase', 'test-constants.ts');
  const supabaseE2eConstantsContent = `/**
 * Shared constants for Supabase E2E tests
 */

// Test data prefixes to isolate test data
export const TEST_PREFIX = 'supabase_test_';

// Test customer data
export const TEST_CUSTOMER = {
  firstName: 'Supabase',
  lastName: 'TestCustomer',
  email: 'supabase-test-customer@example.com',
  phone: '5551234567',
};

// Test booking data
export const TEST_BOOKING = {
  name: 'Supabase Test Booking',
  email: 'supabase-test-booking@example.com',
  phone: '5551234567',
  tattooType: 'custom',
  size: 'medium',
  placement: 'arm',
  description: 'Test booking created by Supabase E2E test',
  preferredTime: 'afternoon',
  paymentMethod: 'card',
};

// Test payment data
export const TEST_PAYMENT = {
  amount: 100,
  paymentMethod: 'card',
  status: 'pending',
};

// Routes for testing
export const ROUTES = {
  home: '/',
  booking: '/booking',
  gallery: '/gallery',
  admin: {
    dashboard: '/admin/dashboard',
    customers: '/admin/dashboard/customers',
    appointments: '/admin/dashboard/appointments',
    payments: '/admin/dashboard/payments',
  },
};
`;

  fs.writeFileSync(supabaseE2eConstantsPath, supabaseE2eConstantsContent);
  printSuccess('Created Supabase E2E test constants file');
}

// Function to create shared fixtures
function createSharedFixtures() {
  printHeader('Creating Shared Test Fixtures');
  
  // Create fixtures for E2E tests
  const e2eFixturesPath = path.join(rootDir, 'tests', 'e2e', 'fixtures.ts');
  const e2eFixturesContent = `import { test as base } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { TEST_PREFIX, TEST_CUSTOMER, TEST_BOOKING } from './test-constants';

/**
 * Extended test fixtures for E2E tests
 */
export const test = base.extend({
  // Add Prisma client to test context
  prisma: async ({}, use) => {
    const prisma = new PrismaClient();
    await use(prisma);
    await prisma.$disconnect();
  },
  
  // Add Supabase client to test context
  supabase: async ({}, use) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    await use(supabase);
  },
  
  // Test prefix for data isolation
  testPrefix: async ({}, use) => {
    // Generate a unique prefix for this test run to isolate test data
    const prefix = \`\${TEST_PREFIX}\${Date.now().toString().slice(-6)}_\`;
    await use(prefix);
  },
  
  // Create a test customer and clean up after test
  testCustomer: async ({ prisma, testPrefix }, use) => {
    // Create a test customer
    const testEmail = \`\${testPrefix}customer@example.com\`;
    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: \`\${testPrefix}First\`,
        lastName: \`\${testPrefix}Last\`,
        email: testEmail,
        phone: TEST_CUSTOMER.phone,
      },
    });
    
    // Make customer available in test
    await use(customer);
    
    // Clean up after test
    await prisma.customer.delete({
      where: { id: customer.id },
    }).catch(e => console.warn('Warning: Failed to delete test customer:', e.message));
  },
  
  // Create a test artist and clean up after test
  testArtist: async ({ prisma, testPrefix }, use) => {
    // Create a test artist
    const testEmail = \`\${testPrefix}artist@example.com\`;
    const artist = await prisma.artist.create({
      data: {
        id: uuidv4(),
        name: \`\${testPrefix}Artist\`,
        email: testEmail,
        bio: 'Test artist bio',
        specialties: ['custom', 'traditional'],
        status: 'active',
      },
    });
    
    // Make artist available in test
    await use(artist);
    
    // Clean up after test
    await prisma.artist.delete({
      where: { id: artist.id },
    }).catch(e => console.warn('Warning: Failed to delete test artist:', e.message));
  },
  
  // Create a test booking and clean up after test
  testBooking: async ({ prisma, testPrefix, testCustomer }, use) => {
    // Create a test booking
    const booking = await prisma.booking.create({
      data: {
        name: \`\${testPrefix}Client\`,
        email: \`\${testPrefix}booking@example.com\`,
        phone: TEST_BOOKING.phone,
        tattooType: TEST_BOOKING.tattooType,
        size: TEST_BOOKING.size,
        placement: TEST_BOOKING.placement,
        description: \`\${TEST_BOOKING.description} \${testPrefix}\`,
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        preferredTime: TEST_BOOKING.preferredTime,
        paymentMethod: TEST_BOOKING.paymentMethod,
        depositPaid: false,
        customerId: testCustomer.id,
      },
    });
    
    // Make booking available in test
    await use(booking);
    
    // Clean up after test
    await prisma.booking.delete({
      where: { id: booking.id },
    }).catch(e => console.warn('Warning: Failed to delete test booking:', e.message));
  },
});

export { expect } from '@playwright/test';
`;

  fs.writeFileSync(e2eFixturesPath, e2eFixturesContent);
  printSuccess('Created E2E test fixtures file');
  
  // Create fixtures for Supabase E2E tests
  const supabaseFixturesPath = path.join(rootDir, 'tests', 'e2e-supabase', 'fixtures.ts');
  const supabaseFixturesContent = `import { test as base } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { TEST_PREFIX, TEST_CUSTOMER, TEST_BOOKING } from './test-constants';

/**
 * Extended test fixtures for Supabase E2E tests
 */
export const test = base.extend({
  // Add Prisma client to test context
  prisma: async ({}, use) => {
    const prisma = new PrismaClient();
    await use(prisma);
    await prisma.$disconnect();
  },
  
  // Add Supabase client to test context
  supabase: async ({}, use) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    await use(supabase);
  },
  
  // Test prefix for data isolation
  testPrefix: async ({}, use) => {
    // Generate a unique prefix for this test run to isolate test data
    const prefix = \`\${TEST_PREFIX}\${Date.now().toString().slice(-6)}_\`;
    await use(prefix);
  },
  
  // Create a test customer and clean up after test
  testCustomer: async ({ prisma, testPrefix }, use) => {
    // Create a test customer
    const testEmail = \`\${testPrefix}customer@example.com\`;
    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: \`\${testPrefix}First\`,
        lastName: \`\${testPrefix}Last\`,
        email: testEmail,
        phone: TEST_CUSTOMER.phone,
      },
    });
    
    // Make customer available in test
    await use(customer);
    
    // Clean up after test
    await prisma.customer.delete({
      where: { id: customer.id },
    }).catch(e => console.warn('Warning: Failed to delete test customer:', e.message));
  },
});

export { expect } from '@playwright/test';
`;

  fs.writeFileSync(supabaseFixturesPath, supabaseFixturesContent);
  printSuccess('Created Supabase E2E test fixtures file');
  
  // Update the E2E setup.ts file to use fixtures.ts
  const e2eSetupPath = path.join(rootDir, 'tests', 'e2e', 'setup.ts');
  const e2eSetupContent = `/**
 * Re-export fixtures for better organization
 */
export * from './fixtures';
`;

  fs.writeFileSync(e2eSetupPath, e2eSetupContent);
  printSuccess('Updated E2E setup.ts to use fixtures.ts');
  
  // Update the Supabase E2E setup.ts file to use fixtures.ts
  const supabaseSetupPath = path.join(rootDir, 'tests', 'e2e-supabase', 'setup.ts');
  const supabaseSetupContent = `/**
 * Re-export fixtures for better organization
 */
export * from './fixtures';
`;

  fs.writeFileSync(supabaseSetupPath, supabaseSetupContent);
  printSuccess('Updated Supabase E2E setup.ts to use fixtures.ts');
}

// Function to update test commands in package.json
function updateTestCommands() {
  printHeader('Updating Test Commands in package.json');
  
  try {
    // Read package.json
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add or update test commands
    packageJson.scripts = packageJson.scripts || {};
    
    // Add or update test commands
    const testCommands = {
      "test": "node scripts/testing/run-tests.cjs --all",
      "test:unit": "node scripts/testing/run-tests.cjs --unit",
      "test:e2e": "npx playwright test",
      "test:e2e:supabase": "scripts/run-e2e-tests.sh",
      "test:ui": "npx playwright test --ui",
      "test:debug": "npx playwright test --debug",
      "test:single": "npx playwright test"
    };
    
    // Update scripts without overwriting existing commands
    for (const [key, value] of Object.entries(testCommands)) {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        printInfo(`Added ${key} command`);
      }
    }
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    printSuccess('Updated test commands in package.json');
  } catch (error) {
    printError(`Failed to update package.json: ${error.message}`);
  }
}

// Function to create comprehensive test documentation
function createTestDocumentation() {
  printHeader('Creating Test Documentation');
  
  // Create test documentation in docs/testing directory
  const testDocPath = path.join(rootDir, 'docs', 'testing', 'COMPREHENSIVE_TESTING_GUIDE.md');
  const testDocContent = `# Comprehensive Testing Guide

This guide provides detailed information about the testing infrastructure for the Ink 37 Tattoo Studio website.

## Testing Philosophy

The testing approach for this project follows these principles:

1. **Comprehensive Coverage**: Tests should cover all critical business logic and user flows
2. **Isolation**: Tests should be isolated from each other to avoid dependencies
3. **Realism**: E2E tests should simulate real user behavior as much as possible
4. **Database Testing**: Core business logic is tested directly at the database level
5. **Cleanup**: Tests should clean up after themselves to avoid test pollution

## Test Types

### Unit Tests

Located in \`/tests/unit\`, these tests focus on individual components and functions:

- **Components**: Test React components in isolation
- **Hooks**: Test custom hooks
- **Utils**: Test utility functions
- **Stores**: Test state management stores

### End-to-End Tests

Located in \`/tests/e2e\`, these tests use Playwright to simulate user interactions:

- **Appointment Tests**: Test appointment scheduling flows
- **Customer Search Tests**: Test customer search functionality
- **Data Import Tests**: Test data import features
- **Database Function Tests**: Test database functions directly
- **Email Notification Tests**: Test email notification flows
- **Payment Processing Tests**: Test payment processing flows

### Supabase-Specific E2E Tests

Located in \`/tests/e2e-supabase\`, these tests directly interact with Supabase:

- **Booking Tests**: Test booking flows with Supabase
- **Contact Tests**: Test contact form with Supabase
- **CRM Tests**: Test CRM features with Supabase
- **Database Tests**: Test database operations with Supabase

## Test Environment

The testing environment uses the following tools:

- **Jest**: For unit testing
- **Playwright**: For E2E testing
- **Prisma Client**: For database access during tests
- **Supabase Client**: For Supabase API access during tests

## Test Database

Tests use a separate database to avoid affecting production data:

- **Default**: \`postgresql://postgres:postgres@localhost:5432/tattoo_db\`
- **Override**: Set \`TEST_DATABASE_URL\` environment variable

The database setup process:

1. **Global Setup**: \`global-setup.ts\` initializes the database
2. **Migrations**: Prisma migrations are applied to set up schema
3. **Business Logic**: SQL functions are applied for business logic
4. **Test Data**: Each test creates its own isolated test data
5. **Cleanup**: \`global-teardown.ts\` cleans up all test data

## Test Fixtures

Tests use fixtures for common setup and cleanup:

- **prisma**: Prisma client for database access
- **supabase**: Supabase client for API access
- **testPrefix**: Unique prefix for test data isolation
- **testCustomer**: Pre-created test customer
- **testArtist**: Pre-created test artist (E2E only)
- **testBooking**: Pre-created test booking (E2E only)

## Writing Tests

### Unit Test Example

\`\`\`typescript
import { render, screen } from '@testing-library/react';
import { CustomerSearch } from '../../src/components/customers/CustomerSearch';

describe('CustomerSearch', () => {
  it('renders search input', () => {
    render(<CustomerSearch />);
    expect(screen.getByPlaceholderText('Search customers...')).toBeInTheDocument();
  });
});
\`\`\`

### E2E Test Example

\`\`\`typescript
import { test, expect } from './setup';

test('customer search should find results', async ({ page, testCustomer }) => {
  // Navigate to customers page
  await page.goto('/admin/dashboard/customers');
  
  // Login if needed
  if (page.url().includes('/admin/login')) {
    await page.fill('[data-testid="email-input"]', 'test-admin@example.com');
    await page.fill('[data-testid="password-input"]', 'Test-Password123!');
    await page.click('[data-testid="login-button"]');
  }
  
  // Search for the test customer
  await page.fill('[data-testid="customer-search"]', testCustomer.lastName);
  await page.click('[data-testid="search-button"]');
  
  // Verify results
  await expect(page.locator(\`text=\${testCustomer.email}\`)).toBeVisible();
});
\`\`\`

### Supabase E2E Test Example

\`\`\`typescript
import { test, expect } from './setup';

test('can create and retrieve customer data', async ({ prisma, supabase, testPrefix }) => {
  // Create customer via Prisma
  const customer = await prisma.customer.create({
    data: {
      id: uuidv4(),
      firstName: \`\${testPrefix}First\`,
      lastName: \`\${testPrefix}Last\`,
      email: \`\${testPrefix}test@example.com\`,
      phone: '5551234567',
    },
  });
  
  // Verify customer can be retrieved from Supabase
  const { data, error } = await supabase
    .from('Customer')
    .select()
    .eq('id', customer.id)
    .single();
  
  expect(error).toBeNull();
  expect(data).toBeDefined();
  expect(data.email).toBe(\`\${testPrefix}test@example.com\`);
  
  // Clean up
  await prisma.customer.delete({
    where: { id: customer.id },
  });
});
\`\`\`

## Test Best Practices

1. **Isolation**: Use unique identifiers for test data
2. **Cleanup**: Always clean up after tests
3. **Assertions**: Use specific assertions that express intent
4. **Waiting**: Use \`expect().toBeVisible()\` instead of arbitrary waits
5. **Setup**: Use fixtures for common setup
6. **Context**: Test in relevant user contexts (logged in, logged out)
7. **Documentation**: Document test purpose and expectations

## Continuous Integration

Tests run in CI on every pull request:

- **GitHub Actions**: Runs all tests on push and pull requests
- **Test Database**: A temporary test database is created for CI runs
- **Migration**: Database schema is applied automatically
- **Artifact**: Test reports and screenshots are saved as artifacts

## Troubleshooting Tests

Common issues and solutions:

1. **Database Connection Errors**: Check database URL and credentials
2. **Timeout Errors**: Increase test timeout or check for bottlenecks
3. **Selector Errors**: Update selectors if UI has changed
4. **Cross-Test Pollution**: Ensure tests clean up their data
5. **Authentication Issues**: Check if auth tokens are valid

## Adding New Tests

1. Place unit tests in \`/tests/unit/\` matching the structure of \`/src/\`
2. Place E2E tests in \`/tests/e2e/\` with a descriptive name ending in \`.spec.ts\`
3. Place Supabase E2E tests in \`/tests/e2e-supabase/\` with a descriptive name ending in \`.spec.ts\`
4. Use existing fixtures and constants when possible
5. Follow the existing patterns for setup and teardown
`;

  fs.writeFileSync(testDocPath, testDocContent);
  printSuccess('Created comprehensive testing guide');
  
  // Update the main TESTING_GUIDE.md to reference the comprehensive guide
  const mainTestDocPath = path.join(rootDir, 'docs', 'testing', 'TESTING_GUIDE.md');
  if (fs.existsSync(mainTestDocPath)) {
    let mainTestDoc = fs.readFileSync(mainTestDocPath, 'utf8');
    
    if (!mainTestDoc.includes('COMPREHENSIVE_TESTING_GUIDE.md')) {
      mainTestDoc += `\n\n## Detailed Testing Guide\n\nFor more detailed information about testing, see [Comprehensive Testing Guide](COMPREHENSIVE_TESTING_GUIDE.md).\n`;
      fs.writeFileSync(mainTestDocPath, mainTestDoc);
      printSuccess('Updated main TESTING_GUIDE.md to reference comprehensive guide');
    }
  }
}

// Run the main function
main().catch((error) => {
  printError(`Error: ${error.message}`);
  process.exit(1);
});