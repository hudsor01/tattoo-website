'use client';

/**
 * Dashboard hooks
 * 
 * This file provides React hooks for accessing dashboard data with tRPC.
 * These hooks provide strong type safety and simplified data access.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import type { AppRouter } from '@/lib/trpc-app';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Type inference for tRPC router inputs and outputs
type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

// Input types for the hooks
type StatsInput = RouterInput['dashboard']['getStats'];
type AppointmentsInput = RouterInput['dashboard']['getUpcomingAppointments'];
type PaymentsInput = RouterInput['dashboard']['getRecentPayments'];
type NotificationsInput = RouterInput['dashboard']['getNotifications'];

// Output types for the hooks
type StatsOutput = RouterOutput['dashboard']['getStats'];
type AppointmentsOutput = RouterOutput['dashboard']['getUpcomingAppointments'];
type PaymentsOutput = RouterOutput['dashboard']['getRecentPayments'];
type NotificationsOutput = RouterOutput['dashboard']['getNotifications'];

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats(
  input?: StatsInput,
  options?: Parameters<typeof trpc.dashboard.getStats.useQuery>[1]
) {
  return trpc.dashboard.getStats.useQuery(input, {
    // Default options - can be overridden by passed options
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Hook to fetch upcoming appointments
 */
export function useUpcomingAppointments(
  input: AppointmentsInput,
  options?: Parameters<typeof trpc.dashboard.getUpcomingAppointments.useQuery>[1]
) {
  return trpc.dashboard.getUpcomingAppointments.useQuery(input, {
    // Default options
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Hook to fetch recent payments
 */
export function useRecentPayments(
  input: PaymentsInput,
  options?: Parameters<typeof trpc.dashboard.getRecentPayments.useQuery>[1]
) {
  return trpc.dashboard.getRecentPayments.useQuery(input, {
    // Default options
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Hook to fetch notifications and activity
 */
export function useNotifications(
  input?: NotificationsInput,
  options?: Parameters<typeof trpc.dashboard.getNotifications.useQuery>[1]
) {
  return trpc.dashboard.getNotifications.useQuery(input, {
    // Refresh more frequently for notifications
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    ...options,
  });
}

/**
 * Utility to invalidate all dashboard queries
 */
export function useInvalidateDashboard() {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate all dashboard-related queries
    return queryClient.invalidateQueries({
      queryKey: [['dashboard']],
    });
  };
}

/**
 * Hook for automatic data refresh based on visibility
 * This is useful for refreshing data when the user returns to the app
 */
export function useDashboardRefresh() {
  const queryClient = useQueryClient();
  
  // Function to refresh all dashboard data
  const refreshAllDashboardData = () => {
    return queryClient.invalidateQueries({
      queryKey: [['dashboard']],
    });
  };
  
  // Setup visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAllDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return {
    refreshAllDashboardData,
  };
}
