import { Photo } from 'react-photo-album';

// Define media type interface
export interface MediaItem extends Photo {
  src: string;
  alt: string;
  width: unknown;
  height: unknown;
  title?: string;
  category?: string;
  type: 'image' | 'video';
  videoSrc?: string;
  thumbnailSrc?: string;
}

// For production, gallery photos should be loaded from a dynamic source like a CMS or database
// This is a fallback static implementation that can be replaced later

// Helper to get CDN or static path based on environment
const getImagePath = (path: string): string => {
  // If using a CDN or image hosting service in production, prefix the path
  const cdnPrefix = process.env.NEXT_PUBLIC_MEDIA_CDN || '';
  return `${cdnPrefix}${path}`;
};

// Define the photos array with the real images from the public folder
export const galleryPhotos: MediaItem[] = [
  {
    src: getImagePath('/images/christ-crosses.JPG'),
    width: 1200,
    height: 1200,
    alt: 'Christ crosses tattoo design',
    title: 'Christ Crosses',
    category: 'Religious',
    type: 'image',
  },
  {
    src: getImagePath('/images/realism.jpg'),
    width: 1200,
    height: 1200,
    alt: 'Realistic tattoo design',
    title: 'Realism Work',
    category: 'Portrait',
    type: 'image',
  },
  {
    src: getImagePath('/images/clock-lion-left-arm.jpg'),
    width: 1200,
    height: 1200,
    alt: 'Clock with lion on left arm',
    title: 'Clock & Lion',
    category: 'Sleeve',
    type: 'image',
  },
  {
    src: getImagePath('/images/traditional.jpg'),
    width: 1200,
    height: 1200,
    alt: 'Traditional style tattoo',
    title: 'Traditional Style',
    category: 'Traditional',
    type: 'image',
  },
  {
    src: getImagePath('/images/dragonballz-left-arm.JPG'),
    width: 1200,
    height: 1200,
    alt: 'Dragon Ball Z themed tattoo on left arm',
    title: 'Dragon Ball Z',
    category: 'Anime',
    type: 'image',
  },
  {
    src: getImagePath('/images/japanese.jpg'),
    width: 1200,
    height: 1200,
    alt: 'Japanese style tattoo',
    title: 'Japanese Art',
    category: 'Japanese',
    type: 'image',
  },
  {
    src: getImagePath('/images/cover-ups.jpg'),
    width: 1200,
    height: 1200,
    alt: 'Cover-up tattoo design',
    title: 'Cover-Up Work',
    category: 'Cover-up',
    type: 'image',
  },
  {
    src: getImagePath('/images/praying-nun-left-arm.JPG'),
    width: 1200,
    height: 1200,
    alt: 'Praying nun tattoo on left arm',
    title: 'Praying Nun',
    category: 'Religious',
    type: 'image',
  },
  {
    src: getImagePath('/images/leg-piece.jpg'),
    width: 1200,
    height: 1200,
    alt: 'Detailed leg tattoo artwork',
    title: 'Leg Piece',
    category: 'Sleeve',
    type: 'image',
  },
  // Video entries - using available images as thumbnails
  {
    src: getImagePath('/images/christ-crosses.JPG'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Christ crosses tattoo video',
    title: 'Christ Crosses Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/christ-crosses-left-arm-sleeve.mov'),
  },
  {
    src: getImagePath('/images/japanese.jpg'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Japanese style tattoo process',
    title: 'Japanese Style Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/christ-crosses-right-arm.mov'),
  },
  {
    src: getImagePath('/images/clock-lion-left-arm.jpg'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Clock and lion tattoo process video',
    title: 'Clock & Lion Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/clock-lion-left-arm.mov'),
  },
  {
    src: getImagePath('/images/traditional.jpg'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Traditional tattoo process video',
    title: 'Traditional Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/clock-roses.mov'),
  },
  {
    src: getImagePath('/images/dragonballz-left-arm.JPG'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Dragon Ball Z tattoo process video',
    title: 'Dragon Ball Z Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/dragonballz-left-arm.mov'),
  },
  {
    src: getImagePath('/images/realism.jpg'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Realism tattoo process video',
    title: 'Realism Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/praying-hands-left-arm.mov'),
  },
  {
    src: getImagePath('/images/praying-nun-left-arm.JPG'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Praying nun tattoo process video',
    title: 'Praying Nun Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/praying-nun.mov'),
  },
];

/**
 * Production Note: For a real production app, this static data should be replaced with:
 * 1. A database query to fetch the gallery items
 * 2. Integration with a CMS like Contentful, Sanity, or similar
 * 3. An API that returns optimized images with proper dimensions
 *
 * Example implementation:
 * export async function fetchGalleryItems() {
 *   // Fetch from database or CMS API
 *   const response = await fetch('/api/gallery-items');
 *   const data = await response.json();
 *   return data.items;
 * }
 */

// Categories for filtering
export const categories = [
  'All',
  'Sleeve',
  'Portrait',
  'Traditional',
  'Blackwork',
  'Watercolor',
  'Japanese',
  'Fine Line',
  'Cover-up',
  'Process',
];

// Add custom fields to the Photo type from react-photo-album
declare module 'react-photo-album' {
  interface Photo {
    title?: string;
    category?: string;
  }
}
