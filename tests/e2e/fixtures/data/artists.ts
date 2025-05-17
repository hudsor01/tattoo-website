/**
 * Artist data fixtures for tests
 */
import { PrismaClient } from '@prisma/client';
import { TEST_PREFIX, TEST_ARTIST_EMAIL } from '../../test-constants';
import { TATTOO_STYLES } from './services';

const prisma = new PrismaClient();

// Test artist data
export const testArtists = [
  {
    id: 'test-artist-1',
    userId: 'test-user-artist',
    specialty: `${TATTOO_STYLES.TRADITIONAL}, ${TATTOO_STYLES.JAPANESE}`,
    bio: 'Experienced tattoo artist specializing in traditional and Japanese styles',
    portfolio: null,
    availableForBooking: true,
    hourlyRate: 150,
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Create test artists in the database
 */
export async function createTestArtists() {
  console.log('Creating test artists...');
  
  try {
    // First ensure the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: testArtists[0].userId }
    });
    
    if (!userExists) {
      // Create user first
      await prisma.user.create({
        data: {
          id: testArtists[0].userId,
          email: TEST_ARTIST_EMAIL,
          name: 'Test Artist',
          role: 'artist',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    // Create the artist
    const result = await prisma.artist.upsert({
      where: { id: testArtists[0].id },
      update: testArtists[0],
      create: testArtists[0]
    });
    
    console.log(`✅ Created test artist: ${result.id}`);
    return result;
  } catch (error) {
    console.error('Error creating test artists:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Cleanup test artists from the database
 */
export async function cleanupTestArtists() {
  console.log('Cleaning up test artists...');
  
  try {
    // Delete all test artists by their IDs
    const result = await prisma.artist.deleteMany({
      where: {
        id: {
          in: testArtists.map((artist) => artist.id),
        },
      },
    });
    
    console.log(`✅ Removed ${result.count} test artists`);
  } catch (error) {
    console.error('Error cleaning up test artists:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
