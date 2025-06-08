import type { Prisma } from '@prisma/client';

// Use Prisma's generated type with selected fields
export type GalleryDesign = Prisma.TattooDesignGetPayload<{
  include: {
    artist: {
      include: {
        user: {
          select: {
            name: true;
            image: true;
          };
        };
      };
    };
    customer: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
      };
    };
  };
}>;

// DTO for API responses (with string dates for JSON serialization)
export interface GalleryDesignDto {
  id: string;
  name: string;
  description?: string | null;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  designType?: string | null;
  size?: string | null;
  isApproved: boolean;
  artistId: string;
  customerId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  artist?: {
    id: string;
    user?: {
      name?: string | null;
      image?: string | null;
    } | null;
  } | null;
}

// Legacy tattoo image type for backward compatibility
export interface TattooImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  likes: number;
  featured: boolean;
  artist?: string;
  dateCreated?: string;
  description?: string;
}

// Video process type for gallery videos
export interface VideoProcess {
  id: number;
  thumbnail: string;
  title: string;
  duration: string;
  videoUrl: string;
  views: number;
  date: string;
  artist?: string;
  description?: string;
}

// Gallery filter options
export interface GalleryFilter {
  designType?: string;
  artistId?: string;
  searchQuery?: string;
  sortOrder?: 'latest' | 'oldest' | 'popular';
}

// Gallery pagination options
export interface GalleryPaginationOptions {
  limit: number;
  cursor?: number;
  designType?: string;
}

// Hook return type for gallery functionality
export interface UseGalleryInfiniteResult {
  designs: GalleryDesign[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  error: Error | null;
  hasMore: boolean;
  fetchNextPage: () => void;
  refetch: () => Promise<void>;
  filterByCategory: (category?: string) => void;
  filterByArtist: (artistId?: string) => void;
  sortDesigns: (sortBy: 'latest' | 'oldest' | 'popular') => void;
  searchDesigns: (query: string) => void;
  totalCount: number;
}

// Media item for gallery display
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

// Base gallery item
export interface BaseGalleryItem {
  src: string;
  alt?: string;
  title?: string;
  category?: string;
  width?: number;
  height?: number;
  type: 'image' | 'video';
}

// Image gallery item
export interface ImageGalleryItem extends BaseGalleryItem {
  type: 'image';
}

// Video gallery item
export interface VideoGalleryItem extends BaseGalleryItem {
  type: 'video';
  videoSrc?: string;
}

// Gallery item union type
export type GalleryItem = ImageGalleryItem | VideoGalleryItem;

// Gallery grid component props
export interface GalleryGridProps {
  limit?: number;
  mediaType?: 'image' | 'video' | 'all';
}
