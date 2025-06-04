/**
 * ISR (Incremental Static Regeneration) Helpers for Gallery
 *
 * Optimized data fetching and caching strategies for gallery pages
 * to maximize performance while ensuring fresh content.
 */
import { cache } from 'react';
import { prisma } from '@/lib/db/prisma';
import type { TattooDesign, User } from '@prisma/client';

// Cache duration constants (in seconds)
export const ISR_REVALIDATE = {
  GALLERY_LIST: 3600, // 1 hour - gallery listing page
  DESIGN_DETAIL: 21600, // 6 hours - individual design pages
  DESIGN_TYPES: 86400, // 24 hours - design type filters (rarely change)
  FEATURED_DESIGNS: 7200, // 2 hours - featured/homepage designs
} as const;

// Type definitions for optimized queries  
type GalleryDesign = TattooDesign;

type GalleryListResponse = {
  designs: GalleryDesign[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string | undefined;
};

/**
 * Cached gallery designs fetcher with optimized queries
 * Uses React cache() for request deduplication
 */
export const getGalleryDesigns = cache(
  async (options: {
    limit?: number;
    cursor?: string;
    designType?: string;
    isApproved?: boolean;
  }): Promise<GalleryListResponse> => {
    const { limit = 20, cursor, designType, isApproved = true } = options;

    // Build where clause
    const where: { isApproved: boolean; designType?: string } = { isApproved };
    if (designType) {
      where.designType = designType;
    }

    // Get total count in parallel with designs
    const [totalCount, designs] = await Promise.all([
      prisma.tattooDesign.count({ where }),
      prisma.tattooDesign.findMany({
        where,
        take: limit + 1, // Take one extra to check for more
        ...(cursor ? { cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          thumbnailUrl: true,
          fileUrl: true,
          designType: true,
          size: true,
          isApproved: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    // Determine if there are more results
    const hasMore = designs.length > limit;
    if (hasMore) {
      designs.pop(); // Remove the extra item
    }

    const nextCursor =
      hasMore && designs.length > 0
        ? designs[designs.length - 1]?.id
        : (undefined as string | undefined);

    return {
      designs: designs as GalleryDesign[],
      totalCount,
      hasMore,
      nextCursor,
    };
  }
);

/**
 * Cached individual design fetcher
 */
export const getDesignById = cache(async (id: string): Promise<GalleryDesign | null> => {
  return prisma.tattooDesign.findUnique({
    where: { id },
    // No includes needed for simplified schema
  }) as Promise<GalleryDesign | null>;
});

/**
 * Cached design types fetcher for filters
 */
export const getDesignTypes = cache(async (): Promise<string[]> => {
  const designs = await prisma.tattooDesign.findMany({
    where: {
      designType: { not: null },
      isApproved: true,
    },
    select: { designType: true },
    distinct: ['designType'],
  });

  return designs.map((d) => d.designType).filter((type): type is string => Boolean(type));
});

/**
 * Cached related designs fetcher
 */
export const getRelatedDesigns = cache(
  async (artistId: string, excludeId: string, limit = 6): Promise<GalleryDesign[]> => {
    return prisma.tattooDesign.findMany({
      where: {
        artistId,
        isApproved: true,
        id: { not: excludeId },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        designType: true,
        createdAt: true,
      },
    }) as Promise<GalleryDesign[]>;
  }
);

/**
 * Cached featured designs for homepage
 */
export const getFeaturedDesigns = cache(async (limit = 8): Promise<GalleryDesign[]> => {
  return prisma.tattooDesign.findMany({
    where: {
      isApproved: true,
      // You can add additional criteria for "featured" designs
      // e.g., isFeatured: true, or high rating, etc.
    },
    take: limit,
    orderBy: [
      { createdAt: 'desc' }, // Most recent first
    ],
    select: {
      id: true,
      name: true,
      description: true,
      thumbnailUrl: true,
      designType: true,
      createdAt: true,
    },
  }) as Promise<GalleryDesign[]>;
});

/**
 * Preload critical gallery data for faster initial renders
 */
export async function preloadGalleryData() {
  // Preload initial gallery page data
  const [designs, designTypes, featuredDesigns] = await Promise.all([
    getGalleryDesigns({ limit: 20 }),
    getDesignTypes(),
    getFeaturedDesigns(8),
  ]);

  return {
    designs,
    designTypes,
    featuredDesigns,
  };
}

/**
 * Generate static paths for top designs (for generateStaticParams)
 */
export async function getTopDesignPaths(limit = 100): Promise<{ id: string }[]> {
  const designs = await prisma.tattooDesign.findMany({
    where: { isApproved: true },
    select: { id: true },
    take: limit,
    orderBy: [{ createdAt: 'desc' }],
  });

  return designs.map((design) => ({ id: design.id }));
}
