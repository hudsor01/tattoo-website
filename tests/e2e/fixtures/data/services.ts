/**
 * Service data fixtures for tests
 */
import { PrismaClient } from '@prisma/client';

// Tattoo styles enum for consistency across tests
export const TATTOO_STYLES = {
  TRADITIONAL: 'traditional',
  NEO_TRADITIONAL: 'neo-traditional',
  JAPANESE: 'japanese',
  REALISM: 'realism',
  BLACKWORK: 'blackwork',
  GEOMETRIC: 'geometric',
  WATERCOLOR: 'watercolor',
  FINE_LINE: 'fine-line',
  PORTRAIT: 'portrait',
  COVER_UP: 'cover-up',
  CUSTOM: 'custom',
};

// Test service data
export const testServices = [
  {
    id: 'test-service-1',
    name: 'Custom Tattoo Design',
    slug: 'custom-design',
    description: 'Personalized tattoo design service tailored to your vision.',
    price: 15000, // $150.00
    duration: 120,
    imageUrl: '/images/services/custom-design.jpg',
    enabled: true,
    featured: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'test-service-2',
    name: 'Black and Grey Tattoo',
    slug: 'black-and-grey',
    description: 'Classic black and grey tattoo style with rich depth and contrast.',
    price: 20000, // $200.00
    duration: 180,
    imageUrl: '/images/services/black-and-grey.jpg',
    enabled: true,
    featured: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'test-service-3',
    name: 'Cover-Up Tattoo',
    slug: 'cover-up',
    description: 'Transform unwanted tattoos into beautiful new designs.',
    price: 25000, // $250.00
    duration: 240,
    imageUrl: '/images/services/cover-up.jpg',
    enabled: true,
    featured: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'test-service-4',
    name: 'Japanese Style Tattoo',
    slug: 'japanese',
    description: 'Traditional Japanese tattoo art with centuries of history.',
    price: 30000, // $300.00
    duration: 300,
    imageUrl: '/images/japanese.jpg',
    enabled: true,
    featured: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'test-service-5',
    name: 'Portrait Tattoo',
    slug: 'portrait',
    description: 'Realistic portrait tattoos that capture every detail.',
    price: 35000, // $350.00
    duration: 360,
    imageUrl: '/images/services/portrait.jpg',
    enabled: true,
    featured: false,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Reference table name - must match Prisma schema
const TABLE_NAME = 'Service';

/**
 * Create test services in the database
 */
export async function createTestServices() {
  console.log('Creating test services...');

  const prisma = new PrismaClient();

  try {
    const result = await prisma.$transaction(
      testServices.map(service =>
        prisma.service.upsert({
          where: { id: service.id },
          update: service,
          create: service,
        }),
      ),
    );

    console.log(`✅ Created ${result.length} test services`);
  } catch (error) {
    console.error('Error creating test services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Cleanup test services from the database
 */
export async function cleanupTestServices() {
  console.log('Cleaning up test services...');

  const prisma = new PrismaClient();

  try {
    // Delete all test services by their IDs
    const result = await prisma.service.deleteMany({
      where: {
        id: {
          in: testServices.map(service => service.id),
        },
      },
    });

    console.log(`✅ Removed ${result.count} test services`);
  } catch (error) {
    console.error('Error cleaning up test services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
