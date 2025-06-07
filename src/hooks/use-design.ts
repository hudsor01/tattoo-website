'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGallery, useDesignById } from './use-gallery-api';
import type { TattooDesign } from '@prisma/client';

function preloadImage(url: string): void {
  if (typeof window === 'undefined') return;
  
  const img = new Image();
  img.src = url;
}

function calculateRelevanceScore(design: TattooDesign, referenceDesign: TattooDesign): number {
  let score = 0;
  
  if (design.designType === referenceDesign.designType) {
    score += 10;
  }
  
  if (design.artistId === referenceDesign.artistId) {
    score += 5;
  }
  
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
    preloadImages?: boolean;
    onSuccess?: (design: TattooDesign) => void;
    onError?: (error: unknown) => void;
  } = {}
) {
  const {
    preloadImages = true,
    onSuccess,
    onError
  } = options;
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
  } = useDesignById(isValidId ? designId : null);
  
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
  
  // Note: Prefetching removed in favor of simpler TanStack Query caching
  
  const normalizedDesign = useMemo(() => {
    if (!design) return null;
    
    return {
      ...design,
      name: design.name ?? 'Untitled Design',
      description: design.description ?? '',
      designType: design.designType ?? 'other',
      createdAt: design.createdAt instanceof Date ? design.createdAt : new Date(design.createdAt),
      updatedAt: design.updatedAt instanceof Date ? design.updatedAt : new Date(design.updatedAt)
    } as TattooDesign;
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
  mainDesign: TattooDesign | null,
  options: {
    limit?: number;
    strategy?: 'strict' | 'flexible' | 'hybrid';
    preloadImages?: boolean;
    fallbackToRecent?: boolean;
    onSuccess?: (designs: TattooDesign[]) => void;
  } = {}
) {
  const {
    limit = 4,
    strategy = 'hybrid',
    preloadImages = true,
    fallbackToRecent = true,
    onSuccess
  } = options;
  
  const designType = mainDesign?.designType;
  
  const [useFallback, setUseFallback] = useState(false);
  
  const primaryQuery = useGallery({
    designType: designType ?? undefined,
    limit: limit + 1
  });
  
  const fallbackQuery = useGallery({
    limit: limit + 1
  });
  
  // Handle primary query success and fallback logic
  useEffect(() => {
    const data = primaryQuery.data;
    if (primaryQuery.isSuccess) {
      if ((!data?.designs || data.designs.length === 0) && fallbackToRecent) {
        setUseFallback(true);
      } else if (data?.designs && onSuccess) {
        const filteredDesigns = data.designs
          .filter((d: TattooDesign) => d.id !== mainDesign?.id)
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
        .filter((d: TattooDesign) => d.id !== mainDesign?.id)
        .slice(0, limit);
      onSuccess(filteredDesigns);
    }
  }, [fallbackQuery.data, fallbackQuery.isSuccess, onSuccess, mainDesign?.id, limit]);
  
  const relatedDesigns = useMemo(() => {
    const sourceData = useFallback ? fallbackQuery.data : primaryQuery.data;
    
    if (!sourceData?.designs || !mainDesign) return [];
    
    const filtered = sourceData.designs
      .filter((design: TattooDesign) => design.id !== mainDesign.id);
    
    if (strategy === 'hybrid') {
      filtered.sort((a: TattooDesign, b: TattooDesign) => {
        const scoreA = calculateRelevanceScore(a, mainDesign);
        const scoreB = calculateRelevanceScore(b, mainDesign);
        return scoreB - scoreA;
      });
    }
    
    return filtered.slice(0, limit);
  }, [primaryQuery.data, fallbackQuery.data, mainDesign, limit, useFallback, strategy]);
  
  useEffect(() => {
    if (preloadImages && relatedDesigns.length > 0) {
      relatedDesigns.forEach((design: TattooDesign, index: number) => {
        if (design.fileUrl) {
          setTimeout(() => {
            preloadImage(design.fileUrl);
          }, index * 150);
        }
      });
    }
  }, [relatedDesigns, preloadImages]);
  
  // Note: Removed prefetching in favor of TanStack Query's built-in caching

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
    onSuccess?: (designs: (TattooDesign | null)[]) => void;
    onError?: (errors: unknown[]) => void;
  } = {}
) {
  const {
    batchSize = 5,
    preloadImages = true,
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
  
  // Use a single query to fetch all designs instead of multiple hooks
  const { data: allDesigns, isLoading, isError, error } = useGallery();
  
  const batchStates = batches.map((batchIds, index) => {
    const batchDesigns = batchIds.map(id => {
      return allDesigns?.designs?.find((design: TattooDesign) => design.id === id) ?? null;
    });
    
    return { 
      batchId: index, 
      designs: batchDesigns, 
      isLoading, 
      isError, 
      errors: error ? [error] : [] 
    };
  });
  
  useEffect(() => {
    if (!preloadImages) return;
    
    const preloadDesigns = batchStates.flatMap(batch => batch.designs.filter(Boolean));
    
    preloadDesigns.forEach(design => {
      if (design?.fileUrl) {
        preloadImage(design.fileUrl);
      }
    });
  }, [batchStates, preloadImages]);
  
  const allDesignsMap = useMemo(() => {
    const designMap = new Map<string, TattooDesign | null>();
    
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
      onSuccess(allDesignsMap);
    }
  }, [allDesignsMap, batchStates, onSuccess]);
  
  useEffect(() => {
    const hasErrors = batchStates.some(batch => batch.isError);
    if (hasErrors && onError) {
      const allErrors = batchStates.flatMap(batch => batch.errors);
      onError(allErrors);
    }
  }, [batchStates, onError]);

  return {
    designs: allDesignsMap,
    isLoading: batchStates.some(batch => batch.isLoading),
    isError: batchStates.some(batch => batch.isError),
    errors: batchStates.flatMap(batch => batch.errors),
    loadedCount: allDesignsMap.filter(Boolean).length,
    totalRequested: validIds.length,
    progress: validIds.length ? Math.round((allDesignsMap.filter(Boolean).length / validIds.length) * 100) : 0,
    isPartiallyLoaded: allDesignsMap.some(Boolean) && batchStates.some(batch => batch.isLoading),
    batches: batchStates.length
  };
}
