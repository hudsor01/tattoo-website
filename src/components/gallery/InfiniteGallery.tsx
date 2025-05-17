'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInfiniteGalleryPhotos, useInfiniteSearchResults } from '@/hooks/useInfiniteGallery';
import { Icons } from '@/components/ui/icons';

interface InfiniteGalleryProps {
  initialLimit?: number;
  searchable?: boolean;
}

/**
 * Infinite Gallery Component
 *
 * This component demonstrates infinite scrolling with tRPC's useInfiniteQuery.
 * It loads more photos automatically as the user scrolls to the bottom of the page.
 */
export function InfiniteGallery({ initialLimit = 12, searchable = true }: InfiniteGalleryProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const loaderRef = useRef<HTMLDivElement>(null);

  // Use the appropriate infinite query hook based on search state
  const {
    data: searchData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
  } = useInfiniteSearchResults(
    searchQuery ? { query: searchQuery, limit: initialLimit } : undefined,
    {
      enabled: !!searchQuery,
      // Don't auto-fetch when query changes to prevent excessive API calls
      refetchOnMount: false,
    },
  );

  // Regular infinite photos query
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useInfiniteGalleryPhotos(
      { limit: initialLimit },
      {
        enabled: !searchQuery,
      },
    );

  // Determine which data to use
  const galleryData = searchQuery ? searchData : data;
  const isLoadingData = searchQuery ? isSearchLoading : isLoading;
  const isLoadingNext = searchQuery ? isFetchingNextSearchPage : isFetchingNextPage;
  const hasMore = searchQuery ? hasNextSearchPage : hasNextPage;
  const loadMore = searchQuery ? fetchNextSearchPage : fetchNextPage;
  const loadingError = searchQuery ? searchError : error;
  const hasError = searchQuery ? isSearchError : isError;

  // Intersection observer for infinite loading
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingNext) {
        loadMore();
      }
    },
    [hasMore, isLoadingNext, loadMore],
  );

  // Setup intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '0px 0px 500px 0px', // Trigger 500px before reaching the end
      threshold: 0.1,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleObserver, galleryData]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive thanks to the enabled option
  };

  // Empty state
  const isEmpty =
    !isLoadingData &&
    !isFetchingNextPage &&
    galleryData?.pages.every(page => page.items.length === 0);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      {searchable && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search gallery..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            variant={searchQuery ? 'default' : 'outline'}
            onClick={() => searchQuery && setSearchQuery('')}
          >
            {searchQuery ? 'Clear' : 'Search'}
          </Button>
        </form>
      )}

      {/* Loading state */}
      {isLoadingData && (
        <div className="grid place-items-center h-80">
          <div className="text-center">
            <Icons.spinner className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading gallery...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="bg-destructive/10 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-destructive">Error loading gallery</h3>
          <p>{loadingError?.message || 'An unexpected error occurred'}</p>
          <Button onClick={() => loadMore()} variant="outline" className="mt-2">
            Try again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold">
            {searchQuery ? 'No results found' : 'No photos yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Try a different search term or browse the gallery'
              : 'Check back soon for new gallery items.'}
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')} className="mt-4">
              View all photos
            </Button>
          )}
        </div>
      )}

      {/* Gallery grid */}
      {!isLoadingData && galleryData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryData.pages.map(page =>
              page.items.map(photo => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <Image
                      src={photo.url}
                      alt={photo.caption || 'Gallery image'}
                      fill
                      className="object-cover transition-all hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    {photo.caption && <p className="font-medium">{photo.caption}</p>}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {photo.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs bg-secondary rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )),
            )}
          </div>

          {/* Loading indicator */}
          <div ref={loaderRef} className="py-8 text-center">
            {isLoadingNext ? (
              <div className="flex items-center justify-center">
                <Icons.spinner className="h-6 w-6 animate-spin mr-2" />
                <span>Loading more...</span>
              </div>
            ) : hasMore ? (
              <Button onClick={() => loadMore()} variant="outline">
                Load more
              </Button>
            ) : (
              <p className="text-muted-foreground">
                {searchQuery ? 'End of search results' : "You've reached the end of the gallery"}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
