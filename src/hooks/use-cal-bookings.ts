/**
 * Cal.com Bookings Hook
 *
 * Custom hook for managing Cal.com bookings through tRPC
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/trpc/client';
import { toast } from '@/components/ui/use-toast';

export interface CalBooking {
  uid: string;
  title: string;
  description?: string;
  status: string;
  startTime: string;
  endTime: string;
  attendees?: Array<{
    name: string;
    email: string;
    phone?: string;
  }>;
  eventType?: {
    id: number;
    title: string;
    duration: number;
  };
}

export function useCalBookings() {
  const [isSyncing, setIsSyncing] = useState(false);

  // Get Cal.com bookings
  const { data: calBookings = [], isLoading, refetch } = api.cal.getBookings.useQuery();

  // Sync bookings
  const syncBookings = useCallback(async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast({
        title: 'Success',
        description: 'Bookings synced successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to sync bookings',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [refetch]);

  // Update booking status
  const updateBookingMutation = api.cal.updateBookingStatus.useMutation({
    onSuccess: () => {
      void refetch();
      toast({
        title: 'Success',
        description: 'Booking status updated',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
    },
  });

  const updateBookingStatus = useCallback(
    (uid: string, status: 'accepted' | 'cancelled' | 'rejected') => {
      updateBookingMutation.mutate({ uid, status });
    },
    [updateBookingMutation]
  );

  return {
    calBookings,
    isLoading,
    isSyncing,
    syncBookings,
    updateBookingStatus,
    refetch,
  };
}
