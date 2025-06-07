/**
 * Consolidated gallery hooks for image gallery management
 * No tRPC - using REST API calls instead
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { TattooDesign } from '@prisma/client';
import { logger } from "@/lib/logger";

export interface UseGalleryResult {
  designs: TattooDesign[];
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
  const [designs, setDesigns] = useState<TattooDesign[]>([]);
  const [filteredDesigns, setFilteredDesigns] = useState<TattooDesign[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'popular'>('latest');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch designs from API
  const fetchDesigns = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch('/api/gallery/designs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch designs');
      }

      const data = await response.json();
      setDesigns(data.designs ?? []);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      setIsError(true);
      logger.error('Error fetching gallery designs:', errorObj);
      toast({
        title: 'Error loading gallery',
        description: 'Failed to load tattoo designs. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load designs on mount
  useEffect(() => {
    void fetchDesigns();
  }, [fetchDesigns]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...designs];

    // Filter by category
    if (category) {
      result = result.filter((design) => design.designType === category);
    }

    // Filter by artist
    if (artistId) {
      result = result.filter((design) => design.artistId === artistId);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((design) => {
        if (typeof design.name === 'string' && design.name.toLowerCase().includes(query)) {
          return true;
        }
        
        if (design.description !== null && 
            design.description !== undefined && 
            typeof design.description === 'string' && 
            design.description.toLowerCase().includes(query)) {
          return true;
        }
        
        if (design.designType !== null && 
            design.designType !== undefined && 
            typeof design.designType === 'string' && 
            design.designType.toLowerCase().includes(query)) {
          return true;
        }
        
        return false;
      });
    }

    // Apply sorting
    result = sortDesignsByOrder(result, sortOrder);

    setFilteredDesigns(result);
  }, [designs, category, artistId, searchQuery, sortOrder]);

  // Helper function to sort designs
  const sortDesignsByOrder = (designs: TattooDesign[], order: 'latest' | 'oldest' | 'popular') => {
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
        return [...designs].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      default:
        return designs;
    }
  };

  // Filter by category
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
    await fetchDesigns();
  };

  return {
    designs: filteredDesigns,
    isLoading,
    isError,
    error,
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
  design: TattooDesign | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing a single design by ID
 */
export function useDesign(id: string): UseDesignResult {
  const [design, setDesign] = useState<TattooDesign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch design from API
  const fetchDesign = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch(`/api/gallery/designs/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch design');
      }

      const data = await response.json();
      setDesign(data.design ?? null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      setIsError(true);
      logger.error(`Error fetching design ID ${id}:`, errorObj);
      toast({
        title: 'Error loading design',
        description: 'Failed to load tattoo design details. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Load design on mount or ID change
  useEffect(() => {
    void fetchDesign();
  }, [fetchDesign]);

  // Refetch wrapper
  const refetch = async () => {
    await fetchDesign();
  };

  return {
    design,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for infinite loading gallery with filtering, sorting, and search
 */
export function useGalleryInfinite() {
  const [designs, setDesigns] = useState<TattooDesign[]>([]);
  const [isLoading] = useState(false);
  const [hasMore] = useState(true);
  const [_page, setPage] = useState(1);

  // Placeholder implementation - infinite scroll would need pagination API
  const fetchNextPage = () => {
    setPage(prev => prev + 1);
  };

  const refetch = async () => {
    setPage(1);
    setDesigns([]);
  };

  return {
    designs,
    isLoading,
    isError: false,
    error: null,
    hasMore,
    fetchNextPage,
    refetch,
    filterByCategory: () => {},
    filterByArtist: () => {},
    sortDesigns: () => {},
    searchDesigns: () => {},
    totalCount: designs.length,
  };
}

/**
 * Hook for fetching related designs for a single design
 */
export function useRelatedDesigns(_design: TattooDesign | null) {
  return {
    relatedDesigns: [] as TattooDesign[],
    isLoading: false,
    isError: false,
    error: null,
  };
}