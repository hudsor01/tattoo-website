/**
 * Admin Hooks
 * 
 * This file provides custom React hooks for admin-specific functionality using tRPC.
 * These hooks provide an easy-to-use interface for admin components to interact
 * with the admin API.
 */
import { trpc } from '@/lib/trpc/client';
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { RouterInputs } from '@/lib/trpc/types';

/**
 * Hook for getting dashboard statistics
 */
export function useDashboardStats() {
  const toast = useToast();
  // Query for dashboard stats
  const query = trpc.admin.getDashboardStats.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Provide a clean interface for components
  return {
    stats: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for getting customers with pagination and search
 */
export function useCustomers(page = 1, limit = 20, search = '') {
  const utils = trpc.useUtils();
  
  // Query for customers
  const query = trpc.admin.getCustomers.useQuery(
    { page, limit, search },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      keepPreviousData: true,
    }
  );
  
  // Provide a clean interface for components
  return {
    customers: query.data?.customers || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for getting a specific customer by ID
 */
export function useCustomer(id: string | undefined) {
  const utils = trpc.useUtils();
  
  // Query for a specific customer
  const query = trpc.admin.getCustomerById.useQuery(
    { id: id || '' },
    {
      enabled: Boolean(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  // Mutation for updating a customer
  const updateMutation = trpc.admin.updateCustomer.useMutation({
    onSuccess: () => {
      toast.success('Customer updated successfully');
      if (id) {
        utils.admin.getCustomerById.invalidate({ id });
        utils.admin.getCustomers.invalidate();
      }
    },
    onError: (error) => {
      toast.error(`Error updating customer: ${error.message}`);
    },
  });
  
  // Mutation for adding a note
  const addNoteMutation = trpc.admin.addCustomerNote.useMutation({
    onSuccess: () => {
      toast.success('Note added successfully');
      if (id) {
        utils.admin.getCustomerById.invalidate({ id });
      }
    },
    onError: (error) => {
      toast.error(`Error adding note: ${error.message}`);
    },
  });
  
  // Mutation for deleting a note
  const deleteNoteMutation = trpc.admin.deleteCustomerNote.useMutation({
    onSuccess: () => {
      toast.success('Note deleted successfully');
      if (id) {
        utils.admin.getCustomerById.invalidate({ id });
      }
    },
    onError: (error) => {
      toast.error(`Error deleting note: ${error.message}`);
    },
  });
  
  // Handler for updating a customer
  const updateCustomer = useCallback(
    (data: Omit<RouterInputs['admin']['updateCustomer'], 'id'>) => {
      if (id) {
        updateMutation.mutate({ id, ...data });
      }
    },
    [id, updateMutation]
  );
  
  // Handler for adding a note
  const addNote = useCallback(
    (content: string) => {
      if (id) {
        addNoteMutation.mutate({
          customerId: id,
          content,
        });
      }
    },
    [id, addNoteMutation]
  );
  
  // Handler for deleting a note
  const deleteNote = useCallback(
    (noteId: string) => {
      if (window.confirm('Are you sure you want to delete this note?')) {
        deleteNoteMutation.mutate({ id: noteId });
      }
    },
    [deleteNoteMutation]
  );
  
  // Provide a clean interface for components
  return {
    customer: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    updateCustomer,
    addNote,
    deleteNote,
    isUpdating: updateMutation.isLoading,
    isAddingNote: addNoteMutation.isLoading,
    isDeletingNote: deleteNoteMutation.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Hook for managing tags
 */
export function useTags() {
  const utils = trpc.useUtils();
  
  // Query for all tags
  const query = trpc.admin.getTags.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation for creating a tag
  const createMutation = trpc.admin.createTag.useMutation({
    onSuccess: () => {
      toast.success('Tag created successfully');
      utils.admin.getTags.invalidate();
    },
    onError: (error) => {
      toast.error(`Error creating tag: ${error.message}`);
    },
  });
  
  // Mutation for deleting a tag
  const deleteMutation = trpc.admin.deleteTag.useMutation({
    onSuccess: () => {
      toast.success('Tag deleted successfully');
      utils.admin.getTags.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting tag: ${error.message}`);
    },
  });
  
  // Handler for creating a tag
  const createTag = useCallback(
    (name: string, color = 'gray') => {
      createMutation.mutate({ name, color });
    },
    [createMutation]
  );
  
  // Handler for deleting a tag
  const deleteTag = useCallback(
    (id: string) => {
      if (window.confirm('Are you sure you want to delete this tag?')) {
        deleteMutation.mutate({ id });
      }
    },
    [deleteMutation]
  );
  
  // Provide a clean interface for components
  return {
    tags: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    createTag,
    deleteTag,
    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Hook for managing customer tags
 */
export function useCustomerTags(customerId: string | undefined) {
  const utils = trpc.useUtils();
  
  // Mutation for adding a tag to a customer
  const addTagMutation = trpc.admin.addTagToCustomer.useMutation({
    onSuccess: () => {
      toast.success('Tag added successfully');
      if (customerId) {
        utils.admin.getCustomerById.invalidate({ id: customerId });
      }
    },
    onError: (error) => {
      toast.error(`Error adding tag: ${error.message}`);
    },
  });
  
  // Mutation for removing a tag from a customer
  const removeTagMutation = trpc.admin.removeTagFromCustomer.useMutation({
    onSuccess: () => {
      toast.success('Tag removed successfully');
      if (customerId) {
        utils.admin.getCustomerById.invalidate({ id: customerId });
      }
    },
    onError: (error) => {
      toast.error(`Error removing tag: ${error.message}`);
    },
  });
  
  // Handler for adding a tag
  const addTag = useCallback(
    (tagId: string) => {
      if (customerId) {
        addTagMutation.mutate({ customerId, tagId });
      }
    },
    [customerId, addTagMutation]
  );
  
  // Handler for removing a tag
  const removeTag = useCallback(
    (tagId: string) => {
      if (customerId) {
        removeTagMutation.mutate({ customerId, tagId });
      }
    },
    [customerId, removeTagMutation]
  );
  
  // Provide a clean interface for components
  return {
    addTag,
    removeTag,
    isAddingTag: addTagMutation.isLoading,
    isRemovingTag: removeTagMutation.isLoading,
  };
}

/**
 * Hook for analytics data
 */
export function useAnalytics(startDate?: Date, endDate?: Date, metrics?: string[]) {
  // Query for analytics data
  const query = trpc.admin.getAnalytics.useQuery(
    { startDate, endDate, metrics },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  // Provide a clean interface for components
  return {
    chartData: query.data?.chartData || [],
    availableMetrics: query.data?.availableMetrics || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
