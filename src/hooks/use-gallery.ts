'use client';

import { api } from '@/lib/trpc/client';
import { useGalleryAnalytics } from '@/hooks/use-analytics';

/**
 * Re-export useGalleryAnalytics from use-analytics.ts
 * 
 * This hook provides the following tracking functions:
 * - trackDesignView
 * - trackDesignViewEnded
 * - trackDesignFavorite
 * - trackDesignUnfavorite
 * - trackDesignShare
 * - trackDesignZoom
 * - trackDesignSwipe
 * - trackGalleryFilter
 * - trackGallerySearch
 */
export { useGalleryAnalytics }

/**
 * Hook to fetch a single design by ID
 */
export function useDesign(id: string) {
  const { data, isLoading, error } = api.gallery.getDesignById.useQuery(
    { id },
    {
      enabled: !!id,
    }
  );

  return {
    design: data,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch public designs with pagination and filtering
 */
export function usePublicDesigns(params: {
  limit?: number;
  offset?: number;
  type?: string;
  artist?: string;
}) {
  const { data, isLoading, error } = api.gallery.getPublicDesigns.useQuery(params);

  return {
    designs: data?.designs ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch design types
 */
export function useDesignTypes() {
  const { data, isLoading, error } = api.gallery.getDesignTypes.useQuery();

  return {
    types: data ?? [],
    isLoading,
    error,
  };
}

/**
 * Hook to track design interactions
 */
export function useTrackDesignInteraction() {
  const mutation = api.gallery.trackInteraction.useMutation();

  return {
    track: (designId: string, action: string) => {
      return mutation.mutate({ designId, action });
    },
    isLoading: mutation.isLoading,
    error: mutation.error,
  };
}

/**
 * Hook to like/unlike a design
 */
export function useToggleDesignLike() {
  const mutation = api.gallery.toggleLike.useMutation();

  return {
    toggle: (designId: string) => {
      return mutation.mutate({ designId });
    },
    isLoading: mutation.isLoading,
    error: mutation.error,
  };
}

/**
 * Hook to share a design
 */
export function useShareDesign() {
  const mutation = api.gallery.shareDesign.useMutation();

  return {
    share: (designId: string, platform: string) => {
      return mutation.mutate({ designId, platform });
    },
    isLoading: mutation.isLoading,
    error: mutation.error,
  };
}

/**
 * Hook to fetch related designs
 */
export function useRelatedDesigns(designId: string, limit = 6) {
  const { data, isLoading, error } = api.gallery.getRelatedDesigns.useQuery(
    { designId, limit },
    {
      enabled: !!designId,
    }
  );

  return {
    designs: data ?? [],
    isLoading,
    error,
  };
}