'use client';

import { trpc } from '@/components/providers/TRPCProvider';

// Define media type interface
export interface MediaItem {
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

// Helper to get static path
const getImagePath = (path: string): string => {
  return path;
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
    src: getImagePath('/images/christ-left arm piece.JPG'),
    width: 1200,
    height: 1200,
    alt: 'Christ left arm tattoo',
    title: 'Christ Arm Piece',
    category: 'Religious',
    type: 'image',
  },
  {
    src: getImagePath('/images/clock-lion-left-arm.JPG'),
    width: 1200,
    height: 1200,
    alt: 'Clock with lion on left arm',
    title: 'Clock & Lion',
    category: 'Sleeve',
    type: 'image',
  },
  {
    src: getImagePath('/images/clock-roses-left-forearm.jpg'),
    width: 1200,
    height: 1200,
    alt: 'Clock with roses on left forearm',
    title: 'Clock & Roses',
    category: 'Sleeve',
    type: 'image',
  },
  {
    src: getImagePath('/images/praying-hands-left-arm.JPG'),
    width: 1200,
    height: 1200,
    alt: 'Praying hands tattoo on left arm',
    title: 'Praying Hands',
    category: 'Religious',
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
    src: getImagePath('/images/japanese.jpg'),
    width: 1200,
    height: 1200,
    alt: 'Japanese style tattoo',
    title: 'Japanese Art',
    category: 'Japanese',
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
  {
    src: getImagePath('/images/dragonballz-left-arm.JPG'),
    width: 1200,
    height: 1200,
    alt: 'Dragon Ball Z themed tattoo on left arm',
    title: 'Dragon Ball Z',
    category: 'Anime',
    type: 'image',
  },
  // Video entries
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
    src: getImagePath('/images/christ-left arm piece.JPG'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Christ crosses right arm video',
    title: 'Christ Crosses Right Arm Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/christ-crosses-right-arm.mov'),
  },
  {
    src: getImagePath('/images/clock-lion-left-arm.JPG'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Clock and lion tattoo process video',
    title: 'Clock & Lion Process',
    category: 'Process',
    type: 'video',
    videoSrc: getImagePath('/videos/clock-lion-left-arm.mov'),
  },
  {
    src: getImagePath('/images/clock-roses-left-forearm.jpg'), // Thumbnail
    width: 1200,
    height: 800,
    alt: 'Clock and roses tattoo process video',
    title: 'Clock & Roses Process',
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
];

// Categories for filtering
export const categories = [
  'All',
  'Sleeve',
  'Portrait',
  'Traditional',
  'Blackwork',
  'Watercolor',
  'Fine Line',
  'Cover-up',
  'Process',
];

// Function to fetch gallery images via tRPC
export async function fetchGalleryImages(): Promise<MediaItem[]> {
  try {
    const images = await trpc.gallery.getImages.query();
    
    // Map the API response to MediaItem format
    return images.map(image => ({
      src: image.src,
      width: 1200,
      height: 1200,
      alt: image.alt || 'Tattoo artwork',
      title: image.alt || 'Tattoo artwork',
      category: 'All',
      type: 'image',
    }));
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return galleryPhotos.filter(item => item.type === 'image');
  }
}

// Function to fetch gallery videos via tRPC
export async function fetchGalleryVideos(): Promise<MediaItem[]> {
  try {
    const videos = await trpc.gallery.getVideos.query();
    
    // Map the API response to MediaItem format
    return videos.map(video => ({
      src: video.thumbnail,
      width: 1200,
      height: 800,
      alt: 'Tattoo process video',
      title: 'Tattoo Process',
      category: 'Process',
      type: 'video',
      videoSrc: video.src,
    }));
  } catch (error) {
    console.error('Error fetching gallery videos:', error);
    return galleryPhotos.filter(item => item.type === 'video');
  }
}
