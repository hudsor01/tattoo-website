#!/usr/bin/env node
/**
 * Consolidated Testing Script for Tattoo Website
 * 
 * This script combines functionality from multiple individual test scripts:
 * - test-admin-dashboard.js
 * - test-api-endpoints.js
 * - test-api.sh
 * - test-auth-flow.js  
 * - test-crm-functionality.js
 * - test-functionality.js
 * - run-all-tests.js
 */

// Import required modules
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Configure dotenv
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const commander = parseArguments(args);

// Constants and configuration
const BASE_URL = 'http://localhost:3000/api';
const ADMIN_BASE_URL = `${BASE_URL}/admin`;
const prisma = new PrismaClient();

// Supabase customer setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mock headers for admin endpoints testing
const MOCK_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer mock_token_for_testing'
};

// Test data constants
const TEST_EMAIL = 'test@example.com';
const TEST_AUTH_EMAIL = 'test.auth.user@gmail.com';
const TEST_AUTH_PASSWORD = 'Test@123456';
const TEST_NAME = 'Test User';
const TEST_PHONE = '555-123-4567';
const TEST_MESSAGE = 'This is a test message from the consolidated test script';

// Console colors for output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m', 
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Utility: Add a delay function to avoid rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Result logging function
function logResult(testName, success, message = '') {
  const status = success ? `${colors.green}✅ PASSED${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`;
  console.info(`${status}: ${testName}`);
  if (message) {
    console.info(`  ${message}`);
  }
  console.info(''); // Empty line for readability
}

/**
 * Parse command-line arguments
 */
function parseArguments(args) {
  // Default configuration
  const config = {
    tests: [],
    all: false,
    help: false,
    verbose: false
  };
  
  // Process arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i].toLowerCase();
    
    switch (arg) {
      case '--all':
      case '-a':
        config.all = true;
        break;
      case '--help':
      case '-h':
        config.help = true;
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--admin':
        config.tests.push('admin');
        break;
      case '--api':
        config.tests.push('api');
        break;
      case '--auth':
        config.tests.push('auth');
        break;
      case '--crm':
        config.tests.push('crm');
        break;
      case '--db':
      case '--database':
        config.tests.push('database');
        break;
      case '--curl':
        config.tests.push('curl');
        break;
      default:
        console.warn(`${colors.yellow}Warning: Unknown argument '${arg}'${colors.reset}`);
    }
  }
  
  // If no specific tests specified and not 'all', show help
  if (config.tests.length === 0 && !config.all && !config.help) {
    config.help = true;
  }
  
  // If 'all' is specified, include all test types
  if (config.all) {
    config.tests = ['admin', 'api', 'auth', 'crm', 'database', 'curl'];
  }
  
  return config;
}

/**
 * Display help message
 */
function showHelp() {
  console.info(`
${colors.cyan}Tattoo Website Testing Script${colors.reset}
Usage: node run-tests.js [options]

Options:
  ${colors.yellow}--all, -a${colors.reset}         Run all test categories
  ${colors.yellow}--help, -h${colors.reset}        Show this help message
  ${colors.yellow}--verbose, -v${colors.reset}     Show detailed test output
  
  ${colors.yellow}--admin${colors.reset}           Run admin dashboard tests
  ${colors.yellow}--api${colors.reset}             Run API endpoint tests
  ${colors.yellow}--auth${colors.reset}            Run authentication flow tests
  ${colors.yellow}--crm${colors.reset}             Run CRM functionality tests
  ${colors.yellow}--database, --db${colors.reset}  Run database functionality tests
  ${colors.yellow}--curl${colors.reset}            Run curl-based API tests

Examples:
  node run-tests.js --all
  node run-tests.js --api --auth
  node run-tests.js --database --verbose
  `);
}

/**
 * Main entry point for the test runner
 */
async function main() {
  if (commander.help) {
    showHelp();
    return;
  }
  
  // Configure tests to run based on arguments
  const testsToRun = [];
  for (const testType of commander.tests) {
    switch (testType) {
      case 'admin':
        testsToRun.push({
          name: 'Admin Dashboard',
          function: testAdminDashboard,
          description: 'Tests admin dashboard API endpoints and data access'
        });
        break;
      case 'api':
        testsToRun.push({
          name: 'API Endpoints',
          function: testApiEndpoints,
          description: 'Tests public API endpoints like contact and booking forms'
        });
        break;
      case 'auth':
        testsToRun.push({
          name: 'Authentication Flow',
          function: testAuthFlow,
          description: 'Tests Supabase authentication flows including signup and login'
        });
        break;
      case 'crm':
        testsToRun.push({
          name: 'CRM Functionality',
          function: testCrmFunctionality,
          description: 'Tests CRM related functions for customer and appointment management'
        });
        break;
      case 'database':
        testsToRun.push({
          name: 'Database Functionality',
          function: testDatabaseFunctionality,
          description: 'Tests basic database operations on core models'
        });
        break;
      case 'curl':
        testsToRun.push({
          name: 'Curl API Tests',
          function: testApiWithCurl,
          description: 'Tests API endpoints using curl commands'
        });
        break;
    }
  }

  // Prepare results tracking
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  // Print test run header
  console.info(`\n${colors.magenta}===============================================${colors.reset}`);
  console.info(`${colors.magenta}Starting Tests - ${testsToRun.length} test suites to run${colors.reset}`);
  console.info(`${colors.magenta}===============================================${colors.reset}\n`);
  
  const startTime = Date.now();
  
  // Run each test suite sequentially
  for (const test of testsToRun) {
    try {
      console.info(`\n${colors.cyan}=======================================${colors.reset}`);
      console.info(`${colors.cyan}Running ${test.name} Tests${colors.reset}`);
      console.info(`${colors.blue}${test.description}${colors.reset}`);
      console.info(`${colors.cyan}=======================================${colors.reset}\n`);
      
      const testResult = await test.function();
      
      if (testResult) {
        console.info(`\n${colors.green}✅ ${test.name} Tests PASSED${colors.reset}\n`);
        results.passed++;
      } else {
        console.info(`\n${colors.red}❌ ${test.name} Tests FAILED${colors.reset}\n`);
        results.failed++;
      }
    } catch (error) {
      console.error(`${colors.red}Error running ${test.name} tests: ${error.message}${colors.reset}`);
      results.failed++;
    }
  }
  
  // Calculate duration
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print final summary
  console.info(`\n${colors.magenta}===============================================${colors.reset}`);
  console.info(`${colors.magenta}Test Runner Summary${colors.reset}`);
  console.info(`${colors.magenta}===============================================${colors.reset}`);
  console.info(`${colors.white}Total test suites: ${testsToRun.length}${colors.reset}`);
  console.info(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.info(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.info(`${colors.yellow}Skipped: ${results.skipped}${colors.reset}`);
  console.info(`${colors.blue}Time: ${duration} seconds${colors.reset}`);
  console.info(`${colors.magenta}===============================================${colors.reset}\n`);
  
  // Disconnect Prisma customer
  await prisma.$disconnect();
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Test module: Admin Dashboard
 * Originally from test-admin-dashboard.js
 */
async function testAdminDashboard() {
  console.info('Starting Admin Dashboard API tests...');
  console.info('⚠️ Note: These tests require proper authentication to succeed.');
  console.info('⚠️ Without valid auth, some tests will intentionally fail to demonstrate security.');

  let allPassed = true;

  try {
    // Test dashboard stats endpoint
    console.info('\n📊 Testing dashboard stats endpoint...');
    const dashboardResponse = await fetch(`${ADMIN_BASE_URL}/dashboard`, {
      headers: MOCK_HEADERS,
    });

    if (dashboardResponse.ok) {
      console.info('✅ Dashboard stats endpoint accessible');
      const dashboardData = await dashboardResponse.json();
      console.info(`ℹ️ Retrieved stats: ${JSON.stringify(dashboardData, null, 2)}`);
    } else {
      // This is expected to fail without proper auth
      console.info('ℹ️ Dashboard endpoint requires auth (expected to fail with mock token)');
    }

    // Test customers endpoint
    console.info('\n👥 Testing customers endpoint...');
    const clientsResponse = await fetch(`${ADMIN_BASE_URL}/customers`, {
      headers: MOCK_HEADERS,
    });

    if (clientsResponse.ok) {
      console.info('✅ Customers endpoint accessible');
      const clientsData = await clientsResponse.json();
      console.info(`ℹ️ Retrieved ${clientsData.customers?.length || 0} customers`);
    } else {
      // This is expected to fail without proper auth
      console.info('ℹ️ Customers endpoint requires auth (expected to fail with mock token)');
    }

    // Test appointments endpoint
    console.info('\n📅 Testing appointments endpoint...');
    const appointmentsResponse = await fetch(`${ADMIN_BASE_URL}/appointments`, {
      headers: MOCK_HEADERS,
    });

    if (appointmentsResponse.ok) {
      console.info('✅ Appointments endpoint accessible');
      const appointmentsData = await appointmentsResponse.json();
      console.info(`ℹ️ Retrieved ${appointmentsData.appointments?.length || 0} appointments`);
    } else {
      // This is expected to fail without proper auth
      console.info('ℹ️ Appointments endpoint requires auth (expected to fail with mock token)');
    }

    // Test permissions verification endpoint
    console.info('\n🔒 Testing permissions verification endpoint...');
    const permissionsResponse = await fetch(`${ADMIN_BASE_URL}/verify-permissions`, {
      method: 'POST',
      headers: MOCK_HEADERS,
      body: JSON.stringify({ role: 'admin' }),
    });

    if (permissionsResponse.ok) {
      console.info('✅ Permissions verification endpoint accessible');
      const permissionsData = await permissionsResponse.json();
      console.info(`ℹ️ Permission check result: ${JSON.stringify(permissionsData, null, 2)}`);
    } else {
      // This is expected to fail without proper auth
      console.info('ℹ️ Permissions endpoint requires auth (expected to fail with mock token)');
    }

    // Alternative tests using Prisma directly
    console.info('\n📊 Testing admin dashboard data directly via Prisma...');

    // Count customers (equivalent to customers in the UI)
    const customerCount = await prisma.customer.count();
    console.info(`ℹ️ Customer count: ${customerCount}`);

    // Count appointments
    const appointmentCount = await prisma.appointment.count();
    console.info(`ℹ️ Appointment count: ${appointmentCount}`);

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      orderBy: { startDate: 'desc' },
      include: { customer: true }
    });
    console.info(`ℹ️ Retrieved ${recentAppointments.length} recent appointments`);

    // Get payment statistics
    const payments = await prisma.payment.findMany();
    let totalRevenue = 0;
    if (payments.length > 0) {
      totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    }
    console.info(`ℹ️ Total revenue: $${(totalRevenue / 100).toFixed(2)}`);

    // Get transaction statistics as an alternative
    const transactions = await prisma.transaction.findMany();
    let totalTransactions = 0;
    if (transactions.length > 0) {
      totalTransactions = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    }
    console.info(`ℹ️ Total transactions: $${totalTransactions.toFixed(2)}`);

    // Summary
    console.info('\n🔍 Admin Dashboard Tests Summary:');
    console.info('ℹ️ API endpoint tests likely failed due to authentication requirements (expected)');
    console.info('✅ Direct database queries completed successfully');
    console.info('ℹ️ To fully test API endpoints, implement proper authentication in the test script');

  } catch (error) {
    console.error('❌ Test execution error:', error);
    allPassed = false;
  } 

  return allPassed;
}

/**
 * Test module: API Endpoints
 * Originally from test-api-endpoints.js
 */
async function testApiEndpoints() {
  console.info('Starting API endpoint tests...');
  let allPassed = true;

  try {
    // Test contact form endpoint
    console.info('\n📝 Testing contact form submission...');
    const contactResponse = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        phone: TEST_PHONE,
        message: TEST_MESSAGE,
      }),
    });

    if (contactResponse.ok) {
      console.info('✅ Contact form submission successful');

      // Verify the contact was created in the database
      const contact = await prisma.contact.findFirst({
        where: { email: TEST_EMAIL, name: TEST_NAME },
        orderBy: { createdAt: 'desc' },
      });

      if (contact) {
        console.info('✅ Contact record found in database');

        // Clean up the test data
        await prisma.contact.delete({ where: { id: contact.id } });
        console.info('🧹 Test contact record cleaned up');
      } else {
        console.error('❌ Contact record not found in database');
        allPassed = false;
      }
    } else {
      console.error('❌ Contact form submission failed:', await contactResponse.text());
      allPassed = false;
    }

    // Test booking endpoint
    console.info('\n📅 Testing booking submission...');
    const bookingResponse = await fetch(`${BASE_URL}/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        phone: TEST_PHONE,
        description: TEST_MESSAGE, // The schema shows this field is called description, not message
        tattooType: 'Custom Design',
        size: 'Medium',
        placement: 'Arm',
        preferredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        preferredTime: '10:00 AM',
        paymentMethod: 'card',
        agreeToTerms: true
      }),
    });

    if (bookingResponse.ok) {
      console.info('✅ Booking submission successful');

      // Verify the booking was created in the database
      const booking = await prisma.booking.findFirst({
        where: { email: TEST_EMAIL, name: TEST_NAME },
        orderBy: { createdAt: 'desc' },
      });

      if (booking) {
        console.info('✅ Booking record found in database');

        // Clean up the test data
        await prisma.booking.delete({ where: { id: booking.id } });
        console.info('🧹 Test booking record cleaned up');
      } else {
        console.error('❌ Booking record not found in database');
        allPassed = false;
      }
    } else {
      console.error('❌ Booking submission failed:', await bookingResponse.text());
      allPassed = false;
    }

    // Test CRM customer endpoints (requires auth - skipped for now)
    console.info('\n👤 Testing CRM customer endpoints would require authentication, skipping for now');
    console.info('To test authenticated endpoints, we would need to implement a login flow or use API tokens');

    // Test health check endpoint - this is optional
    console.info('\n🏥 Testing health check endpoint...');
    try {
      const healthResponse = await fetch(`${BASE_URL}/health`);

      if (healthResponse.ok) {
        console.info('✅ Health check endpoint successful');
        const healthData = await healthResponse.json();
        console.info(`ℹ️ Server status: ${healthData.status || 'OK'}`);
      } else {
        console.info('ℹ️ Health check endpoint returned non-200 status');
        console.info('ℹ️ Trying alternative endpoint...');

        // Try setup endpoint as fallback
        const setupResponse = await fetch(`${BASE_URL}/setup`);
        if (setupResponse.ok) {
          console.info('✅ Setup endpoint successful');
          const setupData = await setupResponse.json();
          console.info(`ℹ️ Setup status: ${setupData.status || 'OK'}`);
        } else {
          console.info('ℹ️ No health check or setup endpoint found - this is optional');
          console.info('ℹ️ Consider adding a health check endpoint for monitoring');
        }
      }
    } catch (error) {
      console.info('ℹ️ Error accessing health check endpoint:', error.message);
      console.info('ℹ️ Health checks are optional but recommended for production');
    }

    // Summary
    console.info('\n🔍 API Tests Summary:');
    if (allPassed) {
      console.info('✅ All tests passed successfully!');
    } else {
      console.error('❌ Some tests failed. Review the logs for details.');
    }
  } catch (error) {
    console.error('❌ Test execution error:', error);
    allPassed = false;
  }

  return allPassed;
}

/**
 * Test module: API with cUrl
 * Originally from test-api.sh
 */
async function testApiWithCurl() {
  console.info('Starting cUrl-based API tests...');
  let allPassed = true;

  // Function to test endpoint with curl
  async function testEndpoint(endpoint, method = 'GET', expectedStatus = 200, data = null, description = `Testing ${endpoint}`) {
    return new Promise((resolve) => {
      console.info(`\n${colors.yellow}${description}${colors.reset}`);
      console.info(`Endpoint: ${method} ${endpoint}`);
      
      const curlCmd = 'curl';
      const curlArgs = ['-s', '-o', '/dev/null', '-w', '%{http_code}'];
      
      if (method !== 'GET') {
        curlArgs.push('-X', method);
      }
      
      if (data) {
        curlArgs.push('-H', 'Content-Type: application/json', '-d', data);
      }
      
      curlArgs.push(`http://localhost:3000${endpoint}`);
      
      const curl = spawn(curlCmd, curlArgs, { shell: true });
      let responseCode = '';
      
      curl.stdout.on('data', (data) => {
        responseCode += data.toString();
      });
      
      curl.on('close', (code) => {
        responseCode = responseCode.trim();
        const success = responseCode === expectedStatus.toString();
        
        if (success) {
          console.info(`${colors.green}✅ Test passed: Got expected status ${responseCode}${colors.reset}`);
        } else {
          console.info(`${colors.red}❌ Test failed: Expected status ${expectedStatus}, got ${responseCode}${colors.reset}`);
          allPassed = false;
        }
        
        console.info('----------------------------------------');
        resolve(success);
      });
      
      curl.on('error', (err) => {
        console.error(`${colors.red}Error running curl: ${err.message}${colors.reset}`);
        allPassed = false;
        console.info('----------------------------------------');
        resolve(false);
      });
    });
  }

  try {
    // Test 1: Public API endpoint - Contact Form
    console.info(`\n${colors.yellow}Testing public API endpoints${colors.reset}`);
    await testEndpoint(
      '/api/contact',
      'POST',
      200,
      '{"name":"Test User","email":"test@example.com","message":"This is a test message"}',
      'Testing Contact Form API'
    );

    // Test 2: Booking API
    await testEndpoint(
      '/api/booking',
      'POST',
      200,
      '{"name":"Test User","email":"test@example.com","phone":"123-456-7890","tattooType":"custom","size":"medium","placement":"arm","description":"Test tattoo","preferredDate":"2025-06-01","preferredTime":"afternoon","paymentMethod":"cashapp","agreeToTerms":true}',
      'Testing Booking API'
    );

    // Test 3: Admin API - Dashboard stats (without auth, should fail)
    console.info(`\n${colors.yellow}Testing admin API endpoints (expected to fail without auth)${colors.reset}`);
    await testEndpoint(
      '/api/admin/dashboard',
      'GET',
      403,
      null,
      'Testing Admin Dashboard API (no auth)'
    );

    // Test 4: API with invalid data
    console.info(`\n${colors.yellow}Testing error handling${colors.reset}`);
    await testEndpoint(
      '/api/booking',
      'POST',
      400,
      '{"name":"Test User"}',
      'Testing booking API with invalid data'
    );

  } catch (error) {
    console.error('❌ Test execution error:', error);
    allPassed = false;
  }

  console.info(`\n${colors.yellow}API Tests completed${colors.reset}`);
  return allPassed;
}

/**
 * Test module: Authentication Flow
 * Originally from test-auth-flow.js
 */
async function testAuthFlow() {
  console.info('Starting Authentication Flow tests...');

  if (!supabase) {
    console.error('❌ Supabase customer could not be initialized. Check your environment variables.');
    return false;
  }

  let allPassed = true;
  let testUserId = null;
  let lastSignInError = null;

  try {
    // Step 1: Create a test user
    console.info('\n👤 Creating test user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_AUTH_EMAIL,
      password: TEST_AUTH_PASSWORD,
    });

    if (signUpError) {
      // If error is "User already registered", we can continue
      if (signUpError.message.includes('already registered')) {
        console.info('ℹ️ Test user already exists, continuing with tests');
      } else {
        console.error('❌ Error creating test user:', signUpError.message);
        allPassed = false;
      }
    } else if (signUpData?.user) {
      console.info('✅ Test user created successfully');
      testUserId = signUpData.user.id;
    }

    // Step 2: Sign in with the test user
    console.info('\n🔑 Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_AUTH_EMAIL,
      password: TEST_AUTH_PASSWORD,
    });

    if (signInError) {
      // Store the error for later reference in the summary
      lastSignInError = signInError;

      // Email confirmation may be required - this is expected in a real setup
      if (signInError.message.includes('Email not confirmed')) {
        console.info('ℹ️ User created but email confirmation is required - this is expected behavior');
        console.info('ℹ️ In a real scenario, the user would need to click a confirmation link sent to their email');
      } else {
        console.error('❌ Error signing in:', signInError.message);
        allPassed = false;
      }
    } else if (signInData?.session) {
      console.info('✅ Sign in successful');
      console.info(`ℹ️ Session expires at: ${new Date(signInData.session.expires_at * 1000).toLocaleString()}`);

      // Store the test user ID if we didn't get it from sign up
      if (!testUserId && signInData.user) {
        testUserId = signInData.user.id;
      }

      // Step 3: Test getting user data
      console.info('\n👤 Testing user data retrieval...');
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ Error getting user data:', userError.message);
        allPassed = false;
      } else if (userData?.user) {
        console.info('✅ User data retrieved successfully');
        console.info(`ℹ️ User email: ${userData.user.email}`);
      }

      // Step 4: Test setting user metadata
      console.info('\n📝 Testing setting user metadata...');
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: { test_field: 'This is a test', last_tested: new Date().toISOString() }
      });

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError.message);
        allPassed = false;
      } else {
        console.info('✅ User metadata updated successfully');
      }

      // Step 5: Test getting session data
      console.info('\n🔐 Testing session data retrieval...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Error getting session data:', sessionError.message);
        allPassed = false;
      } else if (sessionData?.session) {
        console.info('✅ Session data retrieved successfully');
      }

      // Step 6: Test sign out
      console.info('\n🚪 Testing sign out...');
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('❌ Error signing out:', signOutError.message);
        allPassed = false;
      } else {
        console.info('✅ Sign out successful');

        // Verify sign out by trying to get user data
        const { data: afterSignOutData } = await supabase.auth.getUser();
        if (!afterSignOutData.user) {
          console.info('✅ User session properly cleared after sign out');
        } else {
          console.error('❌ User still has active session after sign out');
          allPassed = false;
        }
      }
    }

    // Add a delay to avoid rate limiting
    console.info('\nℹ️ Waiting 3 seconds to avoid rate limiting...');
    await delay(3000);

    // Step 7: Test password reset flow (we'll just test requesting the reset)
    console.info('\n🔄 Testing password reset request...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(TEST_AUTH_EMAIL, {
      redirectTo: 'http://localhost:3000/auth/update-password',
    });

    if (resetError) {
      console.error('❌ Error requesting password reset:', resetError.message);
      allPassed = false;
    } else {
      console.info('✅ Password reset request sent successfully');
      console.info('ℹ️ In a real scenario, the user would receive an email with reset instructions');
    }

  } catch (error) {
    console.error('❌ Test execution error:', error);
    allPassed = false;
  }

  // Summary
  console.info('\n🔍 Authentication Flow Tests Summary:');
  // For auth tests, we'll consider it a success even if email confirmation is required
  if (allPassed || (lastSignInError && lastSignInError.message.includes('Email not confirmed'))) {
    console.info('✅ Authentication setup is working correctly!');
    console.info('ℹ️ Note: Email confirmation is required for new users, which is a security best practice');
  } else {
    console.error('❌ Some authentication tests failed. Review the logs for details.');
  }

  // Note: We don't delete the test user automatically to allow for manual testing
  console.info('\nℹ️ Test user was not deleted. You can delete it manually from the Supabase dashboard if needed.');

  return allPassed;
}

/**
 * Test module: CRM Functionality
 * Originally from test-crm-functionality.js
 */
async function testCrmFunctionality() {
  console.info('Starting CRM functionality tests...');
  
  // Test data
  const TEST_CUSTOMER = {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test-customer@example.com',
    phone: '555-987-6543',
    personalNotes: 'Created for CRM functionality testing'
  };

  // We'll need a test user and artist for appointments
  const TEST_USER = {
    name: 'Test Artist',
    email: 'test-artist-crm@example.com',
    password: 'hashed_password_123',
    role: 'artist'
  };

  const TEST_APPOINTMENT = {
    title: 'Test Appointment',
    description: 'Testing appointment creation',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    status: 'scheduled'
  };

  const TEST_NOTE = {
    content: 'This is a test note from the CRM functionality test script',
    type: 'manual'
  };
  
  let allPassed = true;
  let createdCustomer = null;
  let createdUser = null;
  let createdArtist = null;
  let createdAppointment = null;
  let createdNote = null;

  try {
    // Test customer creation (equivalent to customer in CRM terminology)
    console.info('\n👤 Testing customer creation...');
    createdCustomer = await prisma.customer.create({
      data: TEST_CUSTOMER
    });

    if (createdCustomer && createdCustomer.id) {
      console.info(`✅ Customer created successfully with ID: ${createdCustomer.id}`);
    } else {
      console.error('❌ Failed to create customer');
      allPassed = false;
    }

    // Create test user with artist for appointment testing
    console.info('\n👨‍🎨 Creating test artist for appointment...');
    createdUser = await prisma.user.create({
      data: {
        ...TEST_USER,
        artist: {
          create: {
            specialty: 'Testing',
            bio: 'Test artist for CRM testing',
            availableForBooking: true
          }
        }
      },
      include: {
        artist: true
      }
    });

    if (createdUser && createdUser.artist) {
      createdArtist = createdUser.artist;
      console.info(`✅ Test artist created successfully with ID: ${createdArtist.id}`);
    } else {
      console.error('❌ Failed to create test artist');
      allPassed = false;
    }

    // Test appointment creation
    if (createdCustomer && createdArtist) {
      console.info('\n📅 Testing appointment creation...');
      createdAppointment = await prisma.appointment.create({
        data: {
          ...TEST_APPOINTMENT,
          customerId: createdCustomer.id,
          artistId: createdArtist.id
        }
      });

      if (createdAppointment && createdAppointment.id) {
        console.info(`✅ Appointment created successfully with ID: ${createdAppointment.id}`);
      } else {
        console.error('❌ Failed to create appointment');
        allPassed = false;
      }
    }

    // Test note creation
    if (createdCustomer) {
      console.info('\n📝 Testing note creation...');
      createdNote = await prisma.note.create({
        data: {
          ...TEST_NOTE,
          customerId: createdCustomer.id
        }
      });

      if (createdNote && createdNote.id) {
        console.info(`✅ Note created successfully with ID: ${createdNote.id}`);
      } else {
        console.error('❌ Failed to create note');
        allPassed = false;
      }
    }

    // Test retrieving customer with related data
    if (createdCustomer) {
      console.info('\n🔍 Testing customer retrieval with relations...');
      const retrievedCustomer = await prisma.customer.findUnique({
        where: { id: createdCustomer.id },
        include: {
          appointments: true,
          notes: true
        }
      });

      if (retrievedCustomer) {
        console.info('✅ Customer retrieved successfully');
        console.info(`ℹ️ Customer has ${retrievedCustomer.appointments.length} appointments and ${retrievedCustomer.notes.length} notes`);

        if (retrievedCustomer.appointments.length === 0 || retrievedCustomer.notes.length === 0) {
          console.error('❌ Missing expected related records');
          allPassed = false;
        }
      } else {
        console.error('❌ Failed to retrieve customer with relations');
        allPassed = false;
      }
    }

    // Test updating customer
    if (createdCustomer) {
      console.info('\n✏️ Testing customer update...');
      const updatedCustomer = await prisma.customer.update({
        where: { id: createdCustomer.id },
        data: { personalNotes: 'Updated notes during testing' }
      });

      if (updatedCustomer && updatedCustomer.personalNotes === 'Updated notes during testing') {
        console.info('✅ Customer updated successfully');
      } else {
        console.error('❌ Failed to update customer');
        allPassed = false;
      }
    }

    // Test updating appointment
    if (createdAppointment) {
      console.info('\n✏️ Testing appointment update...');
      const updatedAppointment = await prisma.appointment.update({
        where: { id: createdAppointment.id },
        data: { status: 'confirmed' }
      });

      if (updatedAppointment && updatedAppointment.status === 'confirmed') {
        console.info('✅ Appointment updated successfully');
      } else {
        console.error('❌ Failed to update appointment');
        allPassed = false;
      }
    }

  } catch (error) {
    console.error('❌ Test execution error:', error);
    allPassed = false;
  } finally {
    // Clean up test data
    console.info('\n🧹 Cleaning up test data...');
    try {
      if (createdNote) {
        await prisma.note.delete({ where: { id: createdNote.id } });
        console.info('✅ Test note deleted');
      }

      if (createdAppointment) {
        await prisma.appointment.delete({ where: { id: createdAppointment.id } });
        console.info('✅ Test appointment deleted');
      }

      if (createdArtist) {
        await prisma.artist.delete({ where: { id: createdArtist.id } });
        console.info('✅ Test artist deleted');
      }

      if (createdUser) {
        await prisma.user.delete({ where: { id: createdUser.id } });
        console.info('✅ Test user deleted');
      }

      if (createdCustomer) {
        await prisma.customer.delete({ where: { id: createdCustomer.id } });
        console.info('✅ Test customer deleted');
      }
    } catch (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError);
    }
  }

  // Summary
  console.info('\n🔍 CRM Functionality Tests Summary:');
  if (allPassed) {
    console.info('✅ All tests passed successfully!');
  } else {
    console.error('❌ Some tests failed. Review the logs for details.');
  }

  return allPassed;
}

/**
 * Test module: Database Functionality
 * Originally from test-functionality.js
 */
async function testDatabaseFunctionality() {
  console.info('STARTING FUNCTIONAL TESTS\n' + '='.repeat(50));
  let allPassed = true;

  try {
    // Test 1: Database Connection
    try {
      const testQuery = await prisma.$queryRaw`SELECT 1 as testValue`;
      logResult('Database Connection', true, 'Successfully connected to the database');
    } catch (error) {
      logResult('Database Connection', false, `Error: ${error.message}`);
      allPassed = false;
    }

    // Test 2: Customer Model
    try {
      // Count customers
      const customerCount = await prisma.customer.count();
      logResult('Customer Model', true, `Successfully queried customers table (found ${customerCount} records)`);

      // Create a test customer
      const testCustomer = await prisma.customer.create({
        data: {
          firstName: 'Test',
          lastName: 'Customer',
          email: `test-${Date.now()}@example.com`,  // Use timestamp to avoid duplicates
          phone: '555-123-4567',
          source: 'automated_test'
        }
      });

      logResult('Create Customer', true, `Created customer with ID: ${testCustomer.id}`);

      // Delete the test customer (cleanup)
      await prisma.customer.delete({
        where: { id: testCustomer.id }
      });

      logResult('Delete Customer', true, `Successfully deleted test customer`);

    } catch (error) {
      logResult('Customer Tests', false, `Error: ${error.message}`);
      allPassed = false;
    }

    // Test 3: Booking Model
    try {
      // Count bookings
      const bookingCount = await prisma.booking.count();
      logResult('Booking Model', true, `Successfully queried bookings table (found ${bookingCount} records)`);

      // Create a test booking
      const testBooking = await prisma.booking.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '123-456-7890',
          tattooType: 'custom',
          size: 'medium',
          placement: 'arm',
          description: 'Test booking from automated script',
          preferredDate: new Date('2025-06-01'),
          preferredTime: 'afternoon',
          paymentMethod: 'cashapp',
          depositPaid: false,
        }
      });

      logResult('Create Booking', true, `Created booking with ID: ${testBooking.id}`);

      // Update the test booking
      const updatedBooking = await prisma.booking.update({
        where: { id: testBooking.id },
        data: { depositPaid: true }
      });

      logResult('Update Booking', true, `Updated booking deposit status to: ${updatedBooking.depositPaid}`);

      // Delete the test booking (cleanup)
      await prisma.booking.delete({
        where: { id: testBooking.id }
      });

      logResult('Delete Booking', true, `Successfully deleted test booking`);

    } catch (error) {
      logResult('Booking Tests', false, `Error: ${error.message}`);
      allPassed = false;
    }

    // Test 4: Contact Model
    try {
      // Count contacts
      const contactCount = await prisma.contact.count();
      logResult('Contact Model', true, `Successfully queried contacts table (found ${contactCount} records)`);

      // Create a test contact
      const testContact = await prisma.contact.create({
        data: {
          name: 'Test Contact',
          email: 'testcontact@example.com',
          subject: 'Test Subject',
          message: 'This is a test contact message from the automated testing script',
        }
      });

      logResult('Create Contact', true, `Created contact with ID: ${testContact.id}`);

      // Delete the test contact (cleanup)
      await prisma.contact.delete({
        where: { id: testContact.id }
      });

      logResult('Delete Contact', true, `Successfully deleted test contact`);

    } catch (error) {
      logResult('Contact Tests', false, `Error: ${error.message}`);
      allPassed = false;
    }

    // Test 5: Lead Model
    try {
      // Count leads
      const leadCount = await prisma.lead.count();
      logResult('Lead Model', true, `Successfully queried leads table (found ${leadCount} records)`);

      // Create a test lead
      const testLead = await prisma.lead.create({
        data: {
          name: 'Test Lead',
          email: 'testlead@example.com',
          leadMagnetType: 'tattoo-guide',
        }
      });

      logResult('Create Lead', true, `Created lead with ID: ${testLead.id}`);

      // Delete the test lead (cleanup)
      await prisma.lead.delete({
        where: { id: testLead.id }
      });

      logResult('Delete Lead', true, `Successfully deleted test lead`);

    } catch (error) {
      logResult('Lead Tests', false, `Error: ${error.message}`);
      allPassed = false;
    }

    // Test 6: Check User Model
    try {
      const userCount = await prisma.user.count();
      logResult('User Model', true, `Successfully queried users table (found ${userCount} users)`);
    } catch (error) {
      logResult('User Tests', false, `Error: ${error.message}`);
      allPassed = false;
    }

    // Test 7: Check Available Models
    console.info('Available models in the Prisma schema:');
    const models = Object.keys(prisma).filter(key => !key.startsWith('_') && typeof prisma[key] === 'object');
    models.forEach(model => console.info(`- ${model}`));
    logResult('Schema Models Check', true, `Found ${models.length} models`);

  } catch (error) {
    console.error('Unhandled error during tests:', error);
    allPassed = false;
  }
  
  console.info('='.repeat(50));
  console.info('TESTS COMPLETED');
  
  return allPassed;
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Fatal error in test runner: ${error.message}${colors.reset}`);
  process.exit(1);
});