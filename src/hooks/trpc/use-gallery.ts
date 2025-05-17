/**
 * Gallery Hooks
 * 
 * This file provides custom React hooks for working with the gallery using tRPC.
 * These hooks provide an easy-to-use interface for components to interact
 * with the gallery API.
 */
import { trpc } from '@/lib/trpc/client';
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { RouterInputs, RouterOutputs } from '@/lib/trpc/types';

// Types
type Design = RouterOutputs['gallery']['getDesignById'];
type CreateDesignInput = RouterInputs['gallery']['create'];
type UpdateDesignInput = Omit<RouterInputs['gallery']['update'], 'id'>;

/**
 * Hook for fetching public designs with pagination and filtering
 */
export function usePublicDesigns(initialLimit = 20) {
  const toast = useToast();
  const [limit] = useState(initialLimit);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [designType, setDesignType] = useState<string | undefined>(undefined);
  
  // Query for public designs
  const query = trpc.gallery.getPublicDesigns.useQuery(
    { limit, cursor, designType },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      keepPreviousData: true,
    }
  );
  
  // Load more handler
  const loadMore = useCallback(() => {
    if (query.data?.nextCursor) {
      setCursor(query.data.nextCursor);
    }
  }, [query.data?.nextCursor]);
  
  // Filter by design type
  const filterByType = useCallback((type: string | undefined) => {
    setDesignType(type);
    setCursor(undefined);
  }, []);
  
  // Get design types for filtering
  const designTypesQuery = trpc.gallery.getDesignTypes.useQuery(undefined, {
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Provide a clean interface for components
  return {
    designs: query.data?.designs || [],
    totalCount: query.data?.totalCount || 0,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    hasMore: Boolean(query.data?.nextCursor),
    loadMore,
    filterByType,
    designType,
    designTypes: designTypesQuery.data || [],
    isLoadingDesignTypes: designTypesQuery.isLoading,
  };
}

/**
 * Hook for fetching a specific design by ID
 */
export function useDesign(id: string | undefined) {
  const utils = trpc.useUtils();
  
  // Query for a specific design
  const query = trpc.gallery.getDesignById.useQuery(
    { id: id || '' },
    {
      enabled: Boolean(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  // Mutation for updating a design
  const updateMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      toast.success('Design updated successfully');
      if (id) {
        utils.gallery.getDesignById.invalidate({ id });
        utils.gallery.getPublicDesigns.invalidate();
      }
    },
    onError: (error) => {
      toast.error(`Error updating design: ${error.message}`);
    },
  });
  
  // Mutation for deleting a design
  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success('Design deleted successfully');
      utils.gallery.getPublicDesigns.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting design: ${error.message}`);
    },
  });
  
  // Handler for updating a design
  const updateDesign = useCallback(
    (data: UpdateDesignInput) => {
      if (id) {
        updateMutation.mutate({ id, ...data });
      }
    },
    [id, updateMutation]
  );
  
  // Handler for deleting a design
  const deleteDesign = useCallback(() => {
    if (id && window.confirm('Are you sure you want to delete this design?')) {
      deleteMutation.mutate({ id });
    }
  }, [id, deleteMutation]);
  
  // Handler for approving a design
  const approveDesign = useCallback(() => {
    if (id) {
      updateMutation.mutate({ id, isApproved: true });
    }
  }, [id, updateMutation]);
  
  // Provide a clean interface for components
  return {
    design: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    updateDesign,
    deleteDesign,
    approveDesign,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Hook for creating a new design
 */
export function useCreateDesign() {
  const utils = trpc.useUtils();
  
  // Mutation for creating a design
  const mutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      toast.success('Design created successfully');
      utils.gallery.getPublicDesigns.invalidate();
    },
    onError: (error) => {
      toast.error(`Error creating design: ${error.message}`);
    },
  });
  
  // Handler for creating a design
  const createDesign = useCallback(
    (data: CreateDesignInput) => {
      mutation.mutate(data);
    },
    [mutation]
  );
  
  // Provide a clean interface for components
  return {
    createDesign,
    isCreating: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for gallery statistics (admin only)
 */
export function useGalleryStats() {
  // Query for gallery stats
  const query = trpc.gallery.getStats.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Provide a clean interface for components
  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
