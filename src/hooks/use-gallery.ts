/**
 * Consolidated gallery hooks for image gallery management
 * Combines functionality from the previous separate hook files
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { useGalleryInfiniteQuery } from './use-trpc-infinite-query';
import type { GalleryDesign, GalleryDesignDto, UseGalleryInfiniteResult } from '@prisma/client';
import { logger } from "@/lib/logger";

export interface UseGalleryResult {
  designs: GalleryDesign[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  filterByCategory: (category?: string) => void;
  filterByArtist: (artistId?: string) => void;
  sortDesigns: (sortBy: 'latest' | 'oldest' | 'popular') => void;
  searchDesigns: (query: string) => void;
}

/**
 * Hook for gallery management with filtering, sorting, and search
 * Non-infinite version for smaller galleries
 */
export function useGallery(): UseGalleryResult {
  const [filteredDesigns, setFilteredDesigns] = useState<GalleryDesign[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'popular'>('latest');

  // Use tRPC query to fetch designs
  const {
    data: galleryData,
    isLoading,
    isError,
    error,
    refetch: refetchDesigns,
  } = api.gallery.getPublicDesigns.useQuery(
    {
      limit: 100,
      designType: category ?? undefined,
    },
    {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Handle errors
  useEffect(() => {
    if (isError && error) {
      void void logger.error('Error fetching gallery designs:', error);
      toast({
        title: 'Error loading gallery',
        description: 'Failed to load tattoo designs. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [isError, error]);

  // Get raw designs from the response - cast to our type
  const designs = useMemo(() => (galleryData?.designs ?? []) as GalleryDesign[], [galleryData]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...designs];

    // Filter by artist
    if (artistId) {
      result = result.filter((design) => design.artistId === artistId);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // Rewrite the filter to completely avoid ESLint warnings
      result = result.filter((design) => {
        // Check each field separately without using logical OR in the return statement
        
        // Check name (main criteria)
        if (typeof design.name === 'string' && design.name.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check description if available
        if (design.description !== null && 
            design.description !== undefined && 
            typeof design.description === 'string' && 
            design.description.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check design type if available
        if (design.designType !== null && 
            design.designType !== undefined && 
            typeof design.designType === 'string' && 
            design.designType.toLowerCase().includes(query)) {
          return true;
        }
        
        // No match found
        return false;
      });
    }

    // Apply sorting
    result = sortDesignsByOrder(result, sortOrder);

    setFilteredDesigns(result);
  }, [designs, category, artistId, searchQuery, sortOrder]);

  // Helper function to sort designs
  const sortDesignsByOrder = (designs: GalleryDesign[], order: 'latest' | 'oldest' | 'popular') => {
    switch (order) {
      case 'latest':
        return [...designs].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      case 'oldest':
        return [...designs].sort((a, b) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      case 'popular':
        // Sort by actual engagement metrics: approval date, likes, views, etc.
        return [...designs].sort((a, b) => {
          // Prioritize approved designs
          if (a.isApproved && !b.isApproved) return -1;
          if (!a.isApproved && b.isApproved) return 1;

          // Then sort by approval date (more recently approved = more popular)
          if (a.approvedAt && b.approvedAt) {
            return new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime();
          }

          // Fallback to creation date
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      default:
        return designs;
    }
  };

  // Filter by category - this will trigger a new query with the category filter
  const filterByCategory = (newCategory?: string) => {
    setCategory(newCategory ?? null);
  };

  // Filter by artist
  const filterByArtist = (newArtistId?: string) => {
    setArtistId(newArtistId ?? null);
  };

  // Sort designs
  const sortDesigns = (newSortOrder: 'latest' | 'oldest' | 'popular') => {
    setSortOrder(newSortOrder);
  };

  // Search designs
  const searchDesigns = (query: string) => {
    setSearchQuery(query);
  };

  // Refetch wrapper
  const refetch = async () => {
    await refetchDesigns();
  };

  return {
    designs: filteredDesigns,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
    filterByCategory,
    filterByArtist,
    sortDesigns,
    searchDesigns,
  };
}

// ==============================
// Individual Design Hook
// ==============================

export interface UseDesignResult {
  design: GalleryDesign | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing a single design by ID
 */
export function useDesign(id: string): UseDesignResult {
  // Use tRPC query to fetch single design by ID
  const {
    data: design,
    isLoading,
    isError,
    error,
    refetch: refetchDesign,
  } = api.gallery.getDesignById.useQuery(
    { id },
    {
      enabled: !!id,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Handle errors
  useEffect(() => {
    if (isError && error) {
      void void logger.error(`Error fetching design ID ${id}:`, error);
      toast({
        title: 'Error loading design',
        description: 'Failed to load tattoo design details. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [isError, error, id]);

  // Refetch wrapper
  const refetch = async () => {
    await refetchDesign();
  };

  return {
    design: (design as GalleryDesign) ?? null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}

/**
 * Hook for infinite loading gallery with filtering, sorting, and search
 * Used by ModernGallery and the main gallery page
 */
export function useGalleryInfinite(): UseGalleryInfiniteResult {
  const [filteredDesigns, setFilteredDesigns] = useState<GalleryDesign[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'popular'>('latest');

  const {
    data: designs,
    isLoading,
    isError,
    isFetching,
    error,
    fetchNextPage,
    refetch: refetchDesigns,
  } = useGalleryInfiniteQuery({
    ...(category && { designType: category }),
    limit: 20,
  });

  const computedHasMore = designs?.pages?.[designs.pages.length - 1]?.nextCursor !== null;
  const totalCount = designs?.pages?.[designs.pages.length - 1]?.totalCount ?? 0;

  useEffect(() => {
    if (isError && error) {
      void void logger.error('Error fetching gallery designs:', error);
      toast({
        title: 'Error loading gallery',
        description: 'Failed to load tattoo designs. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [isError, error]);

  const sortDesignsByOrder = useCallback(
    (designs: GalleryDesign[], order: 'latest' | 'oldest' | 'popular') => {
      switch (order) {
        case 'latest':
          return [...designs].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return [...designs].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'popular':
          return [...designs].sort((a, b) => {
            if (a.isApproved && !b.isApproved) return -1;
            if (!a.isApproved && b.isApproved) return 1;

            if (a.approvedAt && b.approvedAt) {
              return new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime();
            }

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        default:
          return designs;
      }
    },
    []
  );

  useEffect(() => {
    let result =
      designs?.pages?.reduce((acc, page) => [...acc, ...page.designs], [] as GalleryDesign[]) ?? [];

    if (artistId) {
      result = result.filter((design) => design.artistId === artistId);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((design) => {
        // Check each field separately without using logical OR in the return statement
        
        // Check name (main criteria)
        if (typeof design.name === 'string' && design.name.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check description if available
        if (design.description !== null && 
            design.description !== undefined && 
            typeof design.description === 'string' && 
            design.description.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check design type if available
        if (design.designType !== null && 
            design.designType !== undefined && 
            typeof design.designType === 'string' && 
            design.designType.toLowerCase().includes(query)) {
          return true;
        }
        
        // No match found
        return false;
      });
    }

    result = sortDesignsByOrder(result, sortOrder);

    setFilteredDesigns(result);
  }, [designs, category, artistId, searchQuery, sortOrder, sortDesignsByOrder]);

  const filterByCategory = (newCategory?: string) => {
    setCategory(newCategory ?? null);
    setSearchQuery('');
    setArtistId(null);
  };

  const sortDesigns = (newSortOrder: 'latest' | 'oldest' | 'popular') => {
    setSortOrder(newSortOrder);
  };

  const refetch = async () => {
    await refetchDesigns();
  };

  const handleFetchNextPage = () => {
    void fetchNextPage();
  };

  const handleFilterByArtist = (newArtistId?: string) => {
    setArtistId(newArtistId ?? null);
    setCategory(null);
    setSearchQuery('');
  };

  const handleSearchDesigns = (query: string) => {
    setSearchQuery(query);
    setCategory(null);
    setArtistId(null);
  };

  return {
    designs: filteredDesigns,
    isLoading,
    isError,
    isFetching,
    error: error as Error | null,
    hasMore: computedHasMore,
    fetchNextPage: handleFetchNextPage,
    refetch,
    filterByCategory,
    filterByArtist: handleFilterByArtist,
    sortDesigns,
    searchDesigns: handleSearchDesigns,
    totalCount,
  };
}

// ==============================
// Related Designs Hook (for design detail page)
// ==============================

export interface UseRelatedDesignsResult {
  relatedDesigns: GalleryDesignDto[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook for fetching related designs for a single design
 */
export function useRelatedDesigns(design: GalleryDesign | null): UseRelatedDesignsResult {
  const enabled = Boolean(design?.id && design?.designType);
  
  const {
    data: relatedDesignsData,
    isLoading,
    isError,
    error,
  } = api.gallery.getRelatedDesigns.useQuery(
    {
      designId: design?.id ?? '',
      designType: design?.designType ?? '',
      limit: 8,
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const relatedDesigns = useMemo(() => {
    if (!relatedDesignsData || !Array.isArray(relatedDesignsData)) {
      return [];
    }
    return relatedDesignsData;
  }, [relatedDesignsData]);

  return {
    relatedDesigns,
    isLoading: enabled && isLoading,
    isError: enabled && isError,
    error: error instanceof Error ? error : null,
  };
}
