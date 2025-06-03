'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { GalleryDesign } from '@prisma/client';

function preloadImage(url: string): void {
  if (typeof window === 'undefined') return;
  
  const img = new Image();
  img.src = url;
}

function calculateRelevanceScore(design: GalleryDesign, referenceDesign: GalleryDesign): number {
  let score = 0;
  
  if (design.designType === referenceDesign.designType) {
    score += 10;
  }
  
  if (design.artistId === referenceDesign.artistId) {
    score += 5;
  }
  
  // Note: GalleryDesign type doesn't have tags property
  // If tags are needed, they should be added to the type definition
  
  const designDate = design.createdAt instanceof Date ? design.createdAt : new Date(design.createdAt);
  const refDate = referenceDesign.createdAt instanceof Date ? 
    referenceDesign.createdAt : new Date(referenceDesign.createdAt);
  
  const timeDiff = Math.abs(designDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  if (timeDiff < 30) {
    score += Math.max(0, 3 - (timeDiff / 10));
  }
  
  return score;
}

export function useDesign(
  designId: string | null,
  options: {
    prefetchRelated?: boolean;
    preloadImages?: boolean;
    staleTime?: number;
    onSuccess?: (design: GalleryDesign) => void;
    onError?: (error: unknown) => void;
  } = {}
) {
  const {
    prefetchRelated = true,
    preloadImages = true,
    staleTime = 5 * 60 * 1000,
    onSuccess,
    onError
  } = options;
  
  const previousIdRef = useRef<string | null>(null);
  const utils = trpc.useUtils();
  const isValidId = typeof designId === 'string' && designId.trim().length > 0;
  
  const { 
    data: design,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
    isRefetching,
    isSuccess
  } = trpc.gallery.getDesignById.useQuery(
    { id: isValidId ? designId : '' },
    { 
      enabled: isValidId,
      staleTime: staleTime,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.message?.includes('not found')) return false;
        return failureCount < 2;
      }
    }
  );
  
  // Handle onSuccess callback
  useEffect(() => {
    if (design && onSuccess) {
      onSuccess(design);
    }
  }, [design, onSuccess]);
  
  // Handle onError callback
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);
  
  // Handle image preloading
  useEffect(() => {
    if (preloadImages && design?.fileUrl) {
      preloadImage(design.fileUrl);

      if (design.thumbnailUrl) {
        preloadImage(design.thumbnailUrl);
      }
    }
  }, [preloadImages, design?.fileUrl, design?.thumbnailUrl]);
  
  useEffect(() => {
    async function prefetchRelatedDesigns() {
      if (isValidId && prefetchRelated && designId !== previousIdRef.current && design?.designType) {
        await utils.gallery.getPublicDesigns.prefetch({
          designType: design.designType,
          limit: 4
        });
        
        previousIdRef.current = designId;
      }
    }
    
    void prefetchRelatedDesigns();
  }, [designId, isValidId, prefetchRelated, design?.designType, utils.gallery.getPublicDesigns]);
  
  const normalizedDesign = useMemo(() => {
    if (!design) return null;
    
    return {
      ...design,
      name: design.name ?? 'Untitled Design',
      description: design.description ?? '',
      designType: design.designType ?? 'other',
      createdAt: design.createdAt instanceof Date ? design.createdAt : new Date(design.createdAt),
      updatedAt: design.updatedAt instanceof Date ? design.updatedAt : new Date(design.updatedAt)
    } as GalleryDesign;
  }, [design]);

  return {
    design: normalizedDesign,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isRefetching,
    hasDesign: design !== null,
    designId,
    isValidId,
    isSuccess,
    isEmpty: !design
  };
}

export function useRelatedDesigns(
  mainDesign: GalleryDesign | null,
  options: {
    limit?: number;
    strategy?: 'strict' | 'flexible' | 'hybrid';
    preloadImages?: boolean;
    fallbackToRecent?: boolean;
    onSuccess?: (designs: GalleryDesign[]) => void;
  } = {}
) {
  const {
    limit = 4,
    strategy = 'hybrid',
    preloadImages = true,
    fallbackToRecent = true,
    onSuccess
  } = options;
  
  const utils = trpc.useUtils();
  
  const designType = mainDesign?.designType;
  
  const [useFallback, setUseFallback] = useState(false);
  
  const primaryQuery = trpc.gallery.getPublicDesigns.useQuery(
    {
      designType: designType ?? undefined,
      limit: limit + 1
    },
    { 
      enabled: !!designType && !useFallback,
      staleTime: 3 * 60 * 1000
    }
  );
  
  const fallbackQuery = trpc.gallery.getPublicDesigns.useQuery(
    {
      limit: limit + 1
    },
    { 
      enabled: useFallback && fallbackToRecent
    }
  );
  
  // Handle primary query success and fallback logic
  useEffect(() => {
    const data = primaryQuery.data;
    if (primaryQuery.isSuccess) {
      if ((!data?.designs || data.designs.length === 0) && fallbackToRecent) {
        setUseFallback(true);
      } else if (data?.designs && onSuccess) {
        const filteredDesigns = data.designs
          .filter((d: GalleryDesign) => d.id !== mainDesign?.id)
          .slice(0, limit);
        onSuccess(filteredDesigns);
      }
    }
  }, [primaryQuery.data, primaryQuery.isSuccess, fallbackToRecent, onSuccess, mainDesign?.id, limit]);
  
  // Handle fallback query success
  useEffect(() => {
    const data = fallbackQuery.data;
    if (fallbackQuery.isSuccess && data?.designs && onSuccess) {
      const filteredDesigns = data.designs
        .filter((d: GalleryDesign) => d.id !== mainDesign?.id)
        .slice(0, limit);
      onSuccess(filteredDesigns);
    }
  }, [fallbackQuery.data, fallbackQuery.isSuccess, onSuccess, mainDesign?.id, limit]);
  
  const relatedDesigns = useMemo(() => {
    const sourceData = useFallback ? fallbackQuery.data : primaryQuery.data;
    
    if (!sourceData?.designs || !mainDesign) return [];
    
    const filtered = sourceData.designs
      .filter((design: GalleryDesign) => design.id !== mainDesign.id);
    
    if (strategy === 'hybrid') {
      filtered.sort((a: GalleryDesign, b: GalleryDesign) => {
        const scoreA = calculateRelevanceScore(a, mainDesign);
        const scoreB = calculateRelevanceScore(b, mainDesign);
        return scoreB - scoreA;
      });
    }
    
    return filtered.slice(0, limit);
  }, [primaryQuery.data, fallbackQuery.data, mainDesign, limit, useFallback, strategy]);
  
  useEffect(() => {
    if (preloadImages && relatedDesigns.length > 0) {
      relatedDesigns.forEach((design: GalleryDesign, index: number) => {
        if (design.fileUrl) {
          setTimeout(() => {
            preloadImage(design.fileUrl!);
          }, index * 150);
        }
      });
    }
  }, [relatedDesigns, preloadImages]);
  
  useEffect(() => {
    relatedDesigns.forEach((design: GalleryDesign) => {
      void utils.gallery.getDesignById.prefetch({ id: design.id });
    });
  }, [relatedDesigns, utils.gallery.getDesignById]);

  return {
    relatedDesigns,
     
    isLoading: (primaryQuery.isLoading && !useFallback) || (fallbackQuery.isLoading && useFallback),
     
    isError: (primaryQuery.isError && !useFallback) || (fallbackQuery.isError && useFallback),
    hasRelated: relatedDesigns.length > 0,
    usingFallback: useFallback,
    totalFound: relatedDesigns.length,
     
    isFetching: (primaryQuery.isFetching && !useFallback) || (fallbackQuery.isFetching && useFallback)
  };
}

export function useDesignBatch(
  designIds: (string | null)[],
  options: {
    batchSize?: number;
    preloadImages?: boolean;
    staleTime?: number;
    onSuccess?: (designs: (GalleryDesign | null)[]) => void;
    onError?: (errors: unknown[]) => void;
  } = {}
) {
  const {
    batchSize = 5,
    preloadImages = true,
    staleTime = 2 * 60 * 1000,
    onSuccess,
    onError
  } = options;
  
  const validIds = useMemo(() => {
    const uniqueIds = new Set<string>();
    
    designIds.forEach(id => {
      if (typeof id === 'string' && id.trim()) {
        uniqueIds.add(id.trim());
      }
    });
    
    return Array.from(uniqueIds);
  }, [designIds]);
  
  const batches = useMemo(() => {
    const result: string[][] = [];
    
    for (let i = 0; i < validIds.length; i += batchSize) {
      result.push(validIds.slice(i, i + batchSize));
    }
    
    return result;
  }, [validIds, batchSize]);
  
  const batchStates = batches.map((batchIds, index) => {
    const batchResults = batchIds.map(id => 
      trpc.gallery.getDesignById.useQuery(
        { id },
        { 
          staleTime,
          refetchOnWindowFocus: false,
          retry: 1
        }
      )
    );
    
    const isLoading = batchResults.some(result => result.isLoading);
    const isError = batchResults.some(result => result.isError);
    const errors = batchResults.map(result => result.error).filter(Boolean);
    const designs = batchResults.map(result => result.data ?? null);
    
    return { batchId: index, designs, isLoading, isError, errors };
  });
  
  useEffect(() => {
    if (!preloadImages) return;
    
    const allDesigns = batchStates.flatMap(batch => batch.designs.filter(Boolean));
    
    allDesigns.forEach(design => {
      if (design?.fileUrl) {
        preloadImage(design.fileUrl);
      }
    });
  }, [batchStates, preloadImages]);
  
  const allDesigns = useMemo(() => {
    const designMap = new Map<string, GalleryDesign | null>();
    
    batchStates.forEach(batch => {
      batch.designs.forEach((design) => {
        if (design) {
          designMap.set(design.id, design);
        }
      });
    });
    
    return validIds.map(id => designMap.get(id) ?? null);
  }, [batchStates, validIds]);
  
  useEffect(() => {
    const isComplete = batchStates.every(batch => !batch.isLoading);
    if (isComplete && onSuccess) {
      onSuccess(allDesigns);
    }
  }, [allDesigns, batchStates, onSuccess]);
  
  useEffect(() => {
    const hasErrors = batchStates.some(batch => batch.isError);
    if (hasErrors && onError) {
      const allErrors = batchStates.flatMap(batch => batch.errors);
      onError(allErrors);
    }
  }, [batchStates, onError]);

  return {
    designs: allDesigns,
    isLoading: batchStates.some(batch => batch.isLoading),
    isError: batchStates.some(batch => batch.isError),
    errors: batchStates.flatMap(batch => batch.errors),
    loadedCount: allDesigns.filter(Boolean).length,
    totalRequested: validIds.length,
    progress: validIds.length ? Math.round((allDesigns.filter(Boolean).length / validIds.length) * 100) : 0,
    isPartiallyLoaded: allDesigns.some(Boolean) && batchStates.some(batch => batch.isLoading),
    batches: batchStates.length
  };
}
