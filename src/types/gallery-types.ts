export type GalleryItemType = string | null | null;
export type DesignImageFormat = 'jpg' | 'png' | 'webp' | 'svg';

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

export interface DatabaseDesignType {
  designType?: string | null;
}

export interface GalleryFilter {
  designType?: string;
  artistId?: string;
  searchQuery?: string;
  sortOrder?: 'latest' | 'oldest' | 'popular';
}

export interface GalleryPaginationOptions {
  limit: number;
  cursor?: number;
  designType?: string;
}

export interface DesignElementWithType {
  type: string;
}

export type ReducerMapType<K extends string, V> = Record<K, V>;

export interface TattooImage {
  id: number
  src: string
  alt: string
  category: string
  likes: number
  featured: boolean
  artist?: string
  dateCreated?: string
  description?: string
}

export interface VideoProcess {
  id: number
  thumbnail: string
  title: string
  duration: string
  videoUrl: string
  views: number
  date: string
  artist?: string
  description?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}
