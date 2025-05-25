'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';

export interface GalleryDesign {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerId: string | null;
  artistId: string;
  size: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  designType: string | null;
  isApproved: boolean;
  approvedAt: Date | null;
  Artist?: {
    id: string;
    User?: {
      name: string | null;
      image: string | null;
    } | null;
  } | null;
  Customer?: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
}

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
    refetch: refetchDesigns
  } = api.gallery.getPublicDesigns.useQuery(
    {
      limit: 100,
      designType: category || undefined
    },
    {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Handle errors in useEffect instead of onError callback
  useEffect(() => {
    if (isError && error) {
      console.error('Error fetching gallery designs:', error);
      toast({
        title: 'Error loading gallery',
        description: 'Failed to load tattoo designs. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [isError, error]);

  // Get raw designs from the response - cast to our type since we know the structure includes Artist relation
  const designs = useMemo(
    () => (galleryData?.designs || []) as GalleryDesign[],
    [galleryData]
  );

  // Apply filters and sorting
  useEffect(() => {
    let result = [...designs];
    
    // Filter by artist
    if (artistId) {
      result = result.filter(design => design.Artist?.id === artistId);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(design => 
        design.name.toLowerCase().includes(query) || 
        design.description?.toLowerCase().includes(query) ||
        design.designType?.toLowerCase().includes(query)
      );
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
    setCategory(newCategory || null);
  };

  // Filter by artist
  const filterByArtist = (newArtistId?: string) => {
    setArtistId(newArtistId || null);
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

export interface UseDesignResult {
  design: GalleryDesign | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDesign(id: string): UseDesignResult {
  // Use tRPC query to fetch single design by ID
  const {
    data: design,
    isLoading,
    isError,
    error,
    refetch: refetchDesign
  } = api.gallery.getDesignById.useQuery(
    { id },
    {
      enabled: !!id,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Handle errors in useEffect
  useEffect(() => {
    if (isError && error) {
      console.error(`Error fetching design ID ${id}:`, error);
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
    design: (design as GalleryDesign) || null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch
  };
}