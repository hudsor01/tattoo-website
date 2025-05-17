/**
 * Appointment data fixtures for tests
 */
import { PrismaClient } from '@prisma/client';
import { TEST_APPOINTMENT } from '../../test-constants';

const prisma = new PrismaClient();

// Test appointment data
export const testAppointments = [
  {
    id: 'test-appointment-1',
    title: TEST_APPOINTMENT.title,
    description: 'Initial consultation for sleeve tattoo',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
    status: 'scheduled',
    deposit: 100.00,
    totalPrice: 350.00,
    location: 'main studio',
    createdAt: new Date(),
    updatedAt: new Date(),
    customerId: 'test-customer-2',
    artistId: 'test-artist-1'
  },
  {
    id: 'test-appointment-2',
    title: 'Follow-up Session',
    description: 'Continuation of sleeve work',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
    status: 'scheduled',
    deposit: 150.00,
    totalPrice: 450.00,
    location: 'main studio',
    createdAt: new Date(),
    updatedAt: new Date(),
    customerId: 'test-customer-2',
    artistId: 'test-artist-1'
  },
  {
    id: 'test-appointment-3',
    title: 'VIP Tattoo Session',
    description: 'Custom back piece design',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 hours
    status: 'confirmed',
    deposit: 200.00,
    totalPrice: 800.00,
    location: 'private room',
    createdAt: new Date(),
    updatedAt: new Date(),
    customerId: 'test-customer-3',
    artistId: 'test-artist-1'
  }
];

/**
 * Create test appointments in the database
 */
export async function createTestAppointments() {
  console.log('Creating test appointments...');
  
  try {
    // Check if customers and artists exist first
    const customersExist = await prisma.customer.count({
      where: {
        id: {
          in: ['test-customer-2', 'test-customer-3']
        }
      }
    });
    
    const artistsExist = await prisma.artist.count({
      where: {
        id: 'test-artist-1'
      }
    });
    
    if (customersExist < 2 || artistsExist === 0) {
      console.warn('⚠️ Required customers or artists missing, appointments may fail to create');
    }
    
    // Create test appointments
    const result = await prisma.$transaction(
      testAppointments.map(appointment => 
        prisma.appointment.upsert({
          where: { id: appointment.id },
          update: appointment,
          create: appointment
        })
      )
    );
    
    console.log(`✅ Created ${result.length} test appointments`);
  } catch (error) {
    console.error('Error creating test appointments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Cleanup test appointments from the database
 */
export async function cleanupTestAppointments() {
  console.log('Cleaning up test appointments...');
  
  try {
    // Delete all test appointments by their IDs
    const result = await prisma.appointment.deleteMany({
      where: {
        id: {
          in: testAppointments.map(appointment => appointment.id)
        }
      }
    });
    
    console.log(`✅ Removed ${result.count} test appointments`);
  } catch (error) {
    console.error('Error cleaning up test appointments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
