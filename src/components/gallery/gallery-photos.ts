// Define media type interface for gallery items
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

// Helper to get CDN or static path based on environment
const getImagePath = (path: string): string => {
  // If using a CDN or image hosting service in production, prefix the path
  const cdnPrefix = process.env['NEXT_PUBLIC_MEDIA_CDN'] ?? '';
  return `${cdnPrefix}${path}`;
};

// DEPRECATED: Gallery data is now stored in the database via TattooDesign model
// This static array has been migrated to the database. The gallery now pulls from:
// - Database table: TattooDesign 
// - API endpoint: /api/trpc/gallery.getPublicDesigns
// - Component: GalleryInfinite with useGalleryInfiniteQuery hook
//
// If you need to add new gallery items, use the admin panel or tRPC API instead
// of modifying this file.

export const galleryPhotos: MediaItem[] = [];

// Export helper function for backward compatibility
export { getImagePath };