/**
 * Gallery fixtures for E2E tests
 */
import { PrismaClient } from '@prisma/client';
import { TEST_PREFIX, TEST_GALLERY_ITEM } from '../test-constants';

const prisma = new PrismaClient();

// Define test gallery items
export const galleryItems = [
  {
    id: 'test-gallery-1',
    name: TEST_GALLERY_ITEM.title,
    description: TEST_GALLERY_ITEM.description,
    designType: TEST_GALLERY_ITEM.category,
    fileUrl: '/images/gallery/test-image-1.jpg',
    thumbnailUrl: '/images/gallery/test-image-1.jpg',
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'test-gallery-2',
    name: 'Japanese Dragon',
    description: 'Traditional Japanese dragon sleeve tattoo',
    designType: 'japanese',
    fileUrl: '/images/gallery/test-image-2.jpg',
    thumbnailUrl: '/images/gallery/test-image-2.jpg',
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'test-gallery-3',
    name: 'Black and Grey Portrait',
    description: 'Photorealistic portrait in black and grey',
    designType: 'portrait',
    fileUrl: '/images/gallery/test-image-3.jpg',
    thumbnailUrl: '/images/gallery/test-image-3.jpg',
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Create test gallery items for E2E testing
 */
export async function createTestGalleryItems() {
  console.log('Creating test gallery items...');
  
  try {
    // Look for a test artist or use the default ID
    let artistId = 'test-artist-id';
    try {
      const artist = await prisma.artist.findFirst({
        where: {
          id: 'test-user-artist'
        }
      });
      
      if (artist) {
        artistId = artist.id;
      }
    } catch (error) {
      console.warn('No artist found, using default test artist ID');
    }
    
    // Create gallery items as TattooDesigns
    const designs = galleryItems.map(item => ({
      ...item,
      artistId
    }));
    
    // Use upsert to handle potential existing records
    const result = await prisma.$transaction(
      designs.map(design => 
        prisma.tattooDesign.upsert({
          where: { id: design.id },
          update: design,
          create: design
        })
      )
    );
    
    console.log(`✅ Created ${result.length} test gallery items`);
    return result;
  } catch (error) {
    console.error('Error creating test gallery items:', error);
    throw error;
  }
}

/**
 * Clean up test gallery items after tests
 */
export async function cleanupTestGalleryItems() {
  console.log('Cleaning up test gallery items...');
  
  try {
    // Delete test gallery items
    const result = await prisma.tattooDesign.deleteMany({
      where: {
        id: {
          in: galleryItems.map(item => item.id)
        }
      }
    });
    
    console.log(`✅ Removed ${result.count} test gallery items`);
  } catch (error) {
    console.error('Error cleaning up test gallery items:', error);
    throw error;
  }
}
