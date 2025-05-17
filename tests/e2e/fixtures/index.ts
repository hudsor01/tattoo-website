/**
 * Central fixture management for E2E tests
 * Coordinates creation and cleanup of all test data
 */
import { PrismaClient } from '@prisma/client';
import { createTestUsers, cleanupTestUsers } from './users';
import { createTestCustomers, cleanupTestCustomers } from './customers';
import { createTestGalleryItems, cleanupTestGalleryItems } from './gallery';
import { createTestServices, cleanupTestServices } from './data/services';

const prisma = new PrismaClient();

/**
 * Initialize all test fixtures
 */
export async function setupAllFixtures() {
  console.log('==== Setting up test fixtures ====');
  
  try {
    // Connect to database
    await prisma.$connect();
    
    // Create test users first (since they might be referenced by other fixtures)
    await createTestUsers();
    
    // Create test customers
    await createTestCustomers();
    
    // Create test services
    await createTestServices();
    
    // Create test gallery items
    await createTestGalleryItems();
    
    console.log('==== Test fixtures setup complete ====\n');
  } catch (error) {
    console.error('❌ Error setting up test fixtures:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clean up all test fixtures
 */
export async function cleanupAllFixtures() {
  console.log('\n==== Cleaning up test fixtures ====');
  
  try {
    // Connect to database
    await prisma.$connect();
    
    // Clean up in reverse order of dependencies
    await cleanupTestGalleryItems();
    await cleanupTestServices();
    await cleanupTestCustomers();
    await cleanupTestUsers();
    
    console.log('==== Test fixtures cleanup complete ====');
  } catch (error) {
    console.error('❌ Error cleaning up test fixtures:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}