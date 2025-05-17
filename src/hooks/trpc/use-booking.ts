/**
 * Booking Hooks
 * 
 * This file provides custom React hooks for working with bookings using tRPC.
 * These hooks provide an easy-to-use interface for components to interact
 * with the booking API.
 */
import { trpc } from '@/lib/trpc/client';
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { RouterInputs, RouterOutputs } from '@/lib/trpc/types';

// Types
type Booking = RouterOutputs['booking']['getById'];
type CreateBookingInput = RouterInputs['booking']['create'];
type UpdateBookingInput = RouterInputs['booking']['update'];

/**
 * Hook for getting all bookings (admin only)
 */
export function useBookings() {
  const toast = useToast();
  const utils = trpc.useUtils();
  
  // Query for all bookings
  const query = trpc.booking.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation for updating a booking
  const updateMutation = trpc.booking.update.useMutation({
    onSuccess: () => {
      toast.success('Booking updated successfully');
      utils.booking.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating booking: ${error.message}`);
    },
  });
  
  // Mutation for deleting a booking
  const deleteMutation = trpc.booking.delete.useMutation({
    onSuccess: () => {
      toast.success('Booking deleted successfully');
      utils.booking.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting booking: ${error.message}`);
    },
  });
  
  // Handler for updating a booking
  const updateBooking = useCallback(
    (data: UpdateBookingInput) => {
      updateMutation.mutate(data);
    },
    [updateMutation]
  );
  
  // Handler for deleting a booking
  const deleteBooking = useCallback(
    (id: number) => {
      if (window.confirm('Are you sure you want to delete this booking?')) {
        deleteMutation.mutate({ id });
      }
    },
    [deleteMutation]
  );
  
  // Provide a clean interface for components
  return {
    bookings: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    updateBooking,
    deleteBooking,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Hook for getting a specific booking by ID
 */
export function useBooking(id: number) {
  const utils = trpc.useUtils();
  
  // Query for a specific booking
  const query = trpc.booking.getById.useQuery({ id }, {
    enabled: id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation for updating a booking
  const updateMutation = trpc.booking.update.useMutation({
    onSuccess: () => {
      toast.success('Booking updated successfully');
      utils.booking.getById.invalidate({ id });
      utils.booking.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating booking: ${error.message}`);
    },
  });
  
  // Handler for updating a booking
  const updateBooking = useCallback(
    (data: Omit<UpdateBookingInput, 'id'>) => {
      updateMutation.mutate({ id, ...data });
    },
    [id, updateMutation]
  );
  
  // Provide a clean interface for components
  return {
    booking: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    updateBooking,
    isUpdating: updateMutation.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Hook for creating a new booking
 */
export function useCreateBooking() {
  const utils = trpc.useUtils();
  
  // Mutation for creating a booking
  const mutation = trpc.booking.create.useMutation({
    onSuccess: () => {
      toast.success('Booking created successfully');
      utils.booking.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Error creating booking: ${error.message}`);
    },
  });
  
  // Handler for creating a booking
  const createBooking = useCallback(
    (data: CreateBookingInput) => {
      mutation.mutate(data);
    },
    [mutation]
  );
  
  // Provide a clean interface for components
  return {
    createBooking,
    isCreating: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for bookings of the current user
 */
export function useMyBookings() {
  const utils = trpc.useUtils();
  
  // Query for user's bookings
  const query = trpc.booking.getMine.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Provide a clean interface for components
  return {
    bookings: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
