/**
 * Consolidated gallery hooks for image gallery management
 * Using TanStack Query for state management and caching
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TattooDesign } from '@prisma/client';
import type { GalleryFilesResponse } from '@/lib/prisma-types';
import { logger } from "@/lib/logger";

// ==============================
// TYPES
// ==============================

interface GalleryResponse {
  designs: TattooDesign[];
  nextCursor: string | null;
  totalCount: number;
}

interface CreateDesignData {
  name: string;
  description?: string;
  fileUrl: string;
  designType?: string;
  size?: string;
}

interface UpdateDesignData {
  name?: string;
  description?: string;
  fileUrl?: string;
  designType?: string;
  size?: string;
  isApproved?: boolean;
}

interface GalleryParams {
  limit?: number;
  cursor?: string;
  designType?: string;
}

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

export interface UseDesignResult {
  design: TattooDesign | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ==============================
// API FUNCTIONS
// ==============================

async function fetchGalleryDesigns(params: GalleryParams = {}): Promise<GalleryResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.designType) searchParams.set('designType', params.designType);

  const response = await fetch(`/api/gallery?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch gallery designs');
  }
  
  return response.json();
}

async function fetchDesignById(id: string): Promise<TattooDesign> {
  const response = await fetch(`/api/gallery/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch design');
  }
  
  return response.json();
}

async function fetchGalleryFiles(): Promise<GalleryFilesResponse> {
  try {
    const response = await fetch('/api/gallery/files', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      void logger.warn('Gallery Files API error:', { status: response.status, errorDetails: errorText });
      throw new Error(`Failed to fetch gallery files: ${response.status}`);
    }
    
    const data = await response.json() as GalleryFilesResponse;
    return data;
  } catch (error) {
    void logger.error('Gallery fetch error:', error);
    throw error;
  }
}

async function createDesign(data: CreateDesignData): Promise<TattooDesign> {
  const response = await fetch('/api/gallery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create design');
  }
  
  return response.json();
}

async function updateDesign(id: string, data: UpdateDesignData): Promise<TattooDesign> {
  const response = await fetch(`/api/gallery/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update design');
  }
  
  return response.json();
}

async function deleteDesign(id: string): Promise<void> {
  const response = await fetch(`/api/gallery/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete design');
  }
}

// ==============================
// HOOKS - TANSTACK QUERY
// ==============================

export function useGalleryApi(params: GalleryParams = {}) {
  return useQuery({
    queryKey: ['gallery', params],
    queryFn: () => fetchGalleryDesigns(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDesignById(id: string | null) {
  return useQuery({
    queryKey: ['design', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Design ID is required');
      }
      return fetchDesignById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGalleryFiles() {
  return useQuery({
    queryKey: ['gallery-files'],
    queryFn: fetchGalleryFiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateDesign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDesign,
    onSuccess: () => {
      // Invalidate and refetch gallery queries
      void queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useUpdateDesign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDesignData }) =>
      updateDesign(id, data),
    onSuccess: (updatedDesign) => {
      // Update the specific design in the cache
      queryClient.setQueryData(['design', updatedDesign.id], updatedDesign);
      
      // Invalidate gallery queries to refresh lists
      void queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDesign,
    onSuccess: (_, deletedId) => {
      // Remove the design from the cache
      queryClient.removeQueries({ queryKey: ['design', deletedId] });
      
      // Invalidate gallery queries to refresh lists
      void queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

// ==============================
// LEGACY HOOKS - STATE BASED
// ==============================

/**
 * Legacy hook for gallery management with filtering, sorting, and search
 * Non-infinite version for smaller galleries
 */
export function useGallery(): UseGalleryResult {
  const [category, setCategory] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'popular'>('latest');

  // Use TanStack Query for data fetching
  const { data, isLoading, isError, error, refetch: queryRefetch } = useGalleryApi({
    designType: category ?? undefined,
    limit: 50, // Reasonable limit for non-infinite scroll
  });

  // Client-side filtering and sorting for additional parameters
  const filteredDesigns = (data?.designs ?? []).filter((design) => {
    // Filter by artist
    if (artistId && design.artistId !== artistId) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !design.name.toLowerCase().includes(query) &&
        !(design.description?.toLowerCase().includes(query)) &&
        !(design.designType?.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (sortOrder) {
      case 'latest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

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
    await queryRefetch();
  };

  return {
    designs: filteredDesigns,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    filterByCategory,
    filterByArtist,
    sortDesigns,
    searchDesigns,
  };
}

/**
 * Legacy hook for fetching and managing a single design by ID
 */
export function useDesign(id: string): UseDesignResult {
  const { data: design, isLoading, isError, error, refetch: queryRefetch } = useDesignById(id);

  // Refetch wrapper
  const refetch = async () => {
    await queryRefetch();
  };

  return {
    design: design ?? null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook for infinite loading gallery with filtering, sorting, and search
 */
export function useGalleryInfinite() {
  const [_page, setPage] = useState(1);
  
  // Use the main gallery hook as base
  const galleryData = useGallery();

  // Placeholder implementation - infinite scroll would need pagination API
  const fetchNextPage = () => {
    setPage(prev => prev + 1);
  };

  return {
    ...galleryData,
    hasMore: true,
    fetchNextPage,
    totalCount: galleryData.designs.length,
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