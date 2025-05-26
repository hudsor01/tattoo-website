import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useGalleryInfiniteQuery } from './use-trpc-infinite-query';
import { GalleryDesign, UseGalleryInfiniteResult } from '@/types/gallery-types';

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
      console.error('Error fetching gallery designs:', error);
      toast({
        title: 'Error loading gallery',
        description: 'Failed to load tattoo designs. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [isError, error]);

  const sortDesignsByOrder = useCallback((designs: GalleryDesign[], order: 'latest' | 'oldest' | 'popular') => {
    switch (order) {
      case 'latest':
        return [...designs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return [...designs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
  }, []);

  useEffect(() => {
    let result = designs?.pages.reduce((acc, page) => [...acc, ...page.designs], [] as GalleryDesign[]) ?? [];

    if (artistId) {
      result = result.filter(design => design.artistId === artistId);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(design =>
        (design.name.toLowerCase().includes(query) ??
        (design.description?.toLowerCase().includes(query) ?? false)) ||
        (design.designType?.toLowerCase().includes(query) ?? false)
      );
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