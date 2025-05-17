import { test as base } from '@playwright/test';
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
    const prefix = `${TEST_PREFIX}${Date.now().toString().slice(-6)}_`;
    await use(prefix);
  },
  
  // Create a test customer and clean up after test
  testCustomer: async ({ prisma, testPrefix }, use) => {
    // Create a test customer
    const testEmail = `${testPrefix}customer@example.com`;
    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: `${testPrefix}First`,
        lastName: `${testPrefix}Last`,
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
    const testEmail = `${testPrefix}artist@example.com`;
    const artist = await prisma.artist.create({
      data: {
        id: uuidv4(),
        name: `${testPrefix}Artist`,
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
        name: `${testPrefix}Client`,
        email: `${testPrefix}booking@example.com`,
        phone: TEST_BOOKING.phone,
        tattooType: TEST_BOOKING.tattooType,
        size: TEST_BOOKING.size,
        placement: TEST_BOOKING.placement,
        description: `${TEST_BOOKING.description} ${testPrefix}`,
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
  },});

export { expect } from '@playwright/test';
