/**
 * Common setup for E2E tests
 * Provides utility functions and setup/teardown hooks for test fixtures
 */
import { test as base } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { HomePage } from './page-objects/home-page';
import { BookingPage } from './page-objects/booking-page';
import { GalleryPage } from './page-objects/gallery-page';
import { ServicesPage } from './page-objects/services-page';
import { AdminDashboardPage } from './page-objects/admin-dashboard-page';
import { loginAsAdmin, loginAsUser, loginAsArtist, logout } from './helpers/auth-helper';
import { connectToDatabase, disconnectFromDatabase } from './helpers/db-helper';

// Create a singleton Prisma client
const prisma = new PrismaClient();

/**
 * Extend the base test with custom fixtures
 */
export const test = base.extend({
  // Add page object models as fixtures
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  bookingPage: async ({ page }, use) => {
    await use(new BookingPage(page));
  },
  galleryPage: async ({ page }, use) => {
    await use(new GalleryPage(page));
  },
  servicesPage: async ({ page }, use) => {
    await use(new ServicesPage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
  
  // Add database fixture
  prisma: async ({}, use) => {
    await prisma.$connect();
    await use(prisma);
    await prisma.$disconnect();
  },
  
  // Add authentication fixtures
  authenticatedAdminPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
    await logout(page);
  },
  
  authenticatedUserPage: async ({ page }, use) => {
    await loginAsUser(page);
    await use(page);
    await logout(page);
  },
  
  authenticatedArtistPage: async ({ page }, use) => {
    await loginAsArtist(page);
    await use(page);
    await logout(page);
  },
});

// Export auth helpers
export { loginAsAdmin, loginAsUser, loginAsArtist, logout };

// Export database helpers
export { connectToDatabase, disconnectFromDatabase };

/**
 * Get a unique test ID to help isolate test data
 */
export function getUniqueTestId() {
  return `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Clean up test data
 * @param testId Unique test ID used to tag test data
 */
export async function cleanupTestData(testId: string) {
  // Connect to database
  await prisma.$connect();
  
  try {
    // Delete test records from various tables
    await prisma.payment.deleteMany({
      where: {
        notes: {
          contains: testId
        }
      }
    });
    
    await prisma.appointment.deleteMany({
      where: {
        notes: {
          contains: testId
        }
      }
    });
    
    await prisma.booking.deleteMany({
      where: {
        description: {
          contains: testId
        }
      }
    });
    
    await prisma.customer.deleteMany({
      where: {
        notes: {
          contains: testId
        }
      }
    });
    
    await prisma.galleryItem.deleteMany({
      where: {
        description: {
          contains: testId
        }
      }
    });
    
    console.log(`Cleaned up test data with ID: ${testId}`);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}
