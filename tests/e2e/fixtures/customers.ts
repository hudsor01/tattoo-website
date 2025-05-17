/**
 * Customer fixtures for E2E tests
 */
import { PrismaClient } from '@prisma/client';
import { TEST_PREFIX, TEST_CUSTOMER } from '../test-constants';

const prisma = new PrismaClient();

/**
 * Create test customers for E2E testing
 */
export async function createTestCustomers() {
  console.log('Creating test customers...');
  
  // Create test customers with basic information
  const testCustomers = [
    // Standard test customer
    {
      id: 'test-customer-1',
      firstName: TEST_CUSTOMER.firstName,
      lastName: TEST_CUSTOMER.lastName,
      email: TEST_CUSTOMER.email,
      phone: TEST_CUSTOMER.phone,
      address: TEST_CUSTOMER.address,
      city: TEST_CUSTOMER.city,
      state: TEST_CUSTOMER.state,
      postalCode: TEST_CUSTOMER.zip,
      allergies: null,
      source: 'website',
      personalNotes: TEST_CUSTOMER.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Customer with history
    {
      id: 'test-customer-2',
      firstName: 'History',
      lastName: 'Customer',
      email: `${TEST_PREFIX}history@example.com`,
      phone: '5557654321',
      address: null,
      city: null,
      state: null,
      postalCode: null,
      allergies: 'None',
      source: 'referral',
      personalNotes: 'Test customer with appointment history',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // VIP customer
    {
      id: 'test-customer-3',
      firstName: 'VIP',
      lastName: 'Customer',
      email: `${TEST_PREFIX}vip@example.com`,
      phone: '5559876543',
      address: '789 VIP Lane',
      city: 'VIP City',
      state: 'VS',
      postalCode: '98765',
      allergies: 'Sensitive skin',
      source: 'instagram',
      personalNotes: 'Test VIP customer with special handling',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  try {
    const result = await prisma.$transaction(
      testCustomers.map((customer) => 
        prisma.customer.upsert({
          where: { id: customer.id },
          update: customer,
          create: customer
        })
      )
    );
    
    console.log(`✅ Created ${result.length} test customers`);
    
    // Add notes to the customers
    await prisma.note.createMany({
      data: [
        {
          id: 'test-note-1',
          content: 'Initial consultation completed',
          type: 'manual',
          customerId: 'test-customer-2',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-note-2',
          content: 'Prefers black ink only',
          type: 'manual',
          customerId: 'test-customer-2',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-note-3',
          content: 'VIP customer - offer premium scheduling',
          type: 'manual',
          customerId: 'test-customer-3',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    });
    
    console.log('✅ Added notes to test customers');
    
    return result;
  } catch (error) {
    console.error('Error creating test customers:', error);
    throw error;
  }
}

/**
 * Clean up test customers after tests
 */
export async function cleanupTestCustomers() {
  console.log('Cleaning up test customers...');
  
  try {
    // First delete related notes
    await prisma.note.deleteMany({
      where: {
        id: { in: ['test-note-1', 'test-note-2', 'test-note-3'] }
      }
    });
    
    // Delete test customers
    const result = await prisma.customer.deleteMany({
      where: {
        id: { in: ['test-customer-1', 'test-customer-2', 'test-customer-3'] }
      }
    });
    
    console.log(`✅ Removed ${result.count} test customers`);
  } catch (error) {
    console.error('Error cleaning up test customers:', error);
    throw error;
  }
}
