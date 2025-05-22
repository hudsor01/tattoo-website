import type { Photo } from 'react-photo-album';

// Define media type interface
export interface MediaItem extends Omit<Photo, 'width' | 'height'> {
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  category?: string;
  type: 'image' | 'video';
  videoSrc?: string;
  thumbnailSrc?: string;
}

// Helper to get CDN or static path based on environment
const getImagePath = (path: string): string => {
  // If using a CDN or image hosting service in production, prefix the path
  const cdnPrefix = process.env['NEXT_PUBLIC_MEDIA_CDN'] || '';
  return `${cdnPrefix}${path}`;
};

// Define the photos array with real image paths
export const galleryPhotos: MediaItem[] = [
  // Images
  {
    src: getImagePath('/images/christ-crosses.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Christ crosses tattoo design',
    title: 'Christ Crosses',
    category: 'Religious',
    type: 'image',
  },
  {
    src: getImagePath('/images/realism.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Realistic tattoo design',
    title: 'Realism Work',
    category: 'Portrait',
    type: 'image',
  },
  {
    src: getImagePath('/images/traditional.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Traditional style tattoo',
    title: 'Traditional Style',
    category: 'Traditional',
    type: 'image',
  },
  {
    src: getImagePath('/images/japanese.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Japanese style tattoo',
    title: 'Japanese Art',
    category: 'Japanese',
    type: 'image',
  },
  {
    src: getImagePath('/images/cover-ups.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Cover-up tattoo design',
    title: 'Cover-Up Work',
    category: 'Cover-up',
    type: 'image',
  },
  {
    src: getImagePath('/images/praying-nun-left-arm.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Praying nun tattoo on left arm',
    title: 'Praying Nun',
    category: 'Religious',
    type: 'image',
  },
  {
    src: getImagePath('/images/leg-piece.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Detailed leg tattoo artwork',
    title: 'Leg Piece',
    category: 'Sleeve',
    type: 'image',
  },
  {
    src: getImagePath('/images/custom-designs.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Custom tattoo design',
    title: 'Custom Design',
    category: 'Custom',
    type: 'image',
  },
  {
    src: getImagePath('/images/dragonballz-left-arm.jpg'),
    width: 1200,
    height: 1800,
    alt: 'Dragon Ball Z themed tattoo',
    title: 'Anime Inspired',
    category: 'Custom',
    type: 'image',
  },
  // Video entries with correct thumbnails and video paths
  {
    src: getImagePath('/images/christ-crosses.jpg'), // Thumbnail
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
    src: getImagePath('/images/dragonballz-left-arm.jpg'), // Using a different image
    width: 1200,
    height: 800,
    alt: 'Dragon Ball Z tattoo process video',
    title: 'Anime Tattoo Process',
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
    src: getImagePath('/images/praying-nun-left-arm.jpg'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Praying nun tattoo process video',
    title: 'Praying Nun Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/praying-nun.mov'),
  },
];

// Tab types for the gallery
export const mediaTypes = [
  { id: 'images', label: 'Tattoo Gallery' },
  { id: 'videos', label: 'Process Videos' },
];

// Add custom fields to the Photo type from react-photo-album
declare module 'react-photo-album' {
  interface Photo {
    title?: string;
    category?: string;
  }
}