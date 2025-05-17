/**
 * User Hooks
 * 
 * This file provides custom React hooks for working with users using tRPC.
 * These hooks provide an easy-to-use interface for components to interact
 * with the user API.
 */
import { trpc } from '@/lib/trpc/client';
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { RouterInputs, RouterOutputs } from '@/lib/trpc/types';

// Types
type User = RouterOutputs['user']['me'];
type ProfileUpdateInput = RouterInputs['user']['updateProfile'];
type ArtistProfileUpdateInput = RouterInputs['user']['updateArtistProfile'];

/**
 * Hook for the current user's profile
 */
export function useCurrentUser() {
  const toast = useToast();
  const utils = trpc.useUtils();
  
  // Query for current user
  const query = trpc.user.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
  
  // Mutation for updating profile
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully');
      utils.user.me.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating profile: ${error.message}`);
    },
  });
  
  // Mutation for updating artist profile
  const updateArtistProfileMutation = trpc.user.updateArtistProfile.useMutation({
    onSuccess: () => {
      toast.success('Artist profile updated successfully');
      utils.user.me.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating artist profile: ${error.message}`);
    },
  });
  
  // Handler for updating profile
  const updateProfile = useCallback(
    (data: ProfileUpdateInput) => {
      updateProfileMutation.mutate(data);
    },
    [updateProfileMutation]
  );
  
  // Handler for updating artist profile
  const updateArtistProfile = useCallback(
    (data: ArtistProfileUpdateInput) => {
      updateArtistProfileMutation.mutate(data);
    },
    [updateArtistProfileMutation]
  );
  
  // Provide a clean interface for components
  return {
    user: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    updateProfile,
    updateArtistProfile,
    isUpdatingProfile: updateProfileMutation.isLoading,
    isUpdatingArtistProfile: updateArtistProfileMutation.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Hook for getting all artists
 */
export function useArtists(includeUnavailable = false) {
  // Query for all artists
  const query = trpc.user.getArtists.useQuery(
    { includeUnavailable },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  // Provide a clean interface for components
  return {
    artists: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for getting an artist by ID
 */
export function useArtist(id: string | undefined) {
  // Query for an artist
  const query = trpc.user.getArtistById.useQuery(
    { id: id || '' },
    {
      enabled: Boolean(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  // Provide a clean interface for components
  return {
    artist: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for admin to manage users
 */
export function useUsers(page = 1, limit = 20, search = '') {
  const utils = trpc.useUtils();
  
  // Query for all users
  const query = trpc.user.getAllUsers.useQuery(
    { page, limit, search },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  // Mutation for updating a user
  const updateMutation = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success('User updated successfully');
      utils.user.getAllUsers.invalidate({ page, limit, search });
    },
    onError: (error) => {
      toast.error(`Error updating user: ${error.message}`);
    },
  });
  
  // Mutation for deleting a user
  const deleteMutation = trpc.user.deleteUser.useMutation({
    onSuccess: () => {
      toast.success('User deleted successfully');
      utils.user.getAllUsers.invalidate({ page, limit, search });
    },
    onError: (error) => {
      toast.error(`Error deleting user: ${error.message}`);
    },
  });
  
  // Mutation for creating a user
  const createMutation = trpc.user.createUser.useMutation({
    onSuccess: () => {
      toast.success('User created successfully');
      utils.user.getAllUsers.invalidate({ page, limit, search });
    },
    onError: (error) => {
      toast.error(`Error creating user: ${error.message}`);
    },
  });
  
  // Handler for updating a user
  const updateUser = useCallback(
    (id: string, data: Omit<RouterInputs['user']['updateUser'], 'id'>) => {
      updateMutation.mutate({ id, ...data });
    },
    [updateMutation]
  );
  
  // Handler for deleting a user
  const deleteUser = useCallback(
    (id: string) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
        deleteMutation.mutate({ id });
      }
    },
    [deleteMutation]
  );
  
  // Handler for creating a user
  const createUser = useCallback(
    (data: RouterInputs['user']['createUser']) => {
      createMutation.mutate(data);
    },
    [createMutation]
  );
  
  // Provide a clean interface for components
  return {
    users: query.data?.users || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    updateUser,
    deleteUser,
    createUser,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isCreating: createMutation.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Hook for admin to get a specific user
 */
export function useUserAdmin(id: string | undefined) {
  const utils = trpc.useUtils();
  
  // Query for a specific user
  const query = trpc.user.getUserById.useQuery(
    { id: id || '' },
    {
      enabled: Boolean(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  // Mutation for updating a user
  const updateMutation = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success('User updated successfully');
      if (id) {
        utils.user.getUserById.invalidate({ id });
      }
    },
    onError: (error) => {
      toast.error(`Error updating user: ${error.message}`);
    },
  });
  
  // Handler for updating a user
  const updateUser = useCallback(
    (data: Omit<RouterInputs['user']['updateUser'], 'id'>) => {
      if (id) {
        updateMutation.mutate({ id, ...data });
      }
    },
    [id, updateMutation]
  );
  
  // Provide a clean interface for components
  return {
    user: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    updateUser,
    isUpdating: updateMutation.isLoading,
    refetch: query.refetch,
  };
}
