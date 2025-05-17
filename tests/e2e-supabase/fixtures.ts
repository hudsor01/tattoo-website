import { test as base } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { TEST_PREFIX, TEST_CUSTOMER, TEST_BOOKING } from './test-constants';

/**
 * Extended test fixtures for Supabase E2E tests
 */
export const test = base.extend({
  // Add Prisma client to test context
  prisma: async (_, use) => {
    const prisma = new PrismaClient();
    await use(prisma);
    await prisma.$disconnect();
  },
  
  // Add Supabase client to test context
  supabase: async (_, use) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    await use(supabase);
  },
  
  // Test prefix for data isolation
  testPrefix: async (_, use) => {
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
});

export { expect } from '@playwright/test';
