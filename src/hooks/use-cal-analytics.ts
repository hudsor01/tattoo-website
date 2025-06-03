'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { logger } from '@/lib/logger';
import type { DashboardPeriod, DateRange } from '@prisma/client';

export function useCalAnalytics(defaultPeriod: DashboardPeriod = 'week') {
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>(defaultPeriod);
  
  // Calculate date range based on period
  const getDateRange = (): DateRange => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch(selectedPeriod) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate.setDate(startDate.getDate() - 365);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    return { startDate, endDate };
  };

  // Main dashboard metrics query
  const { 
    data: dashboardMetrics, 
    isLoading: isMetricsLoading, 
    error: metricsError,
    refetch: refetchMetrics
  } = trpc.calAnalytics.getDashboardMetrics.useQuery(
    getDateRange(),
    {
      refetchInterval: 60000,
      refetchOnWindowFocus: true
    }
  );

  // Service performance query
  const { 
    data: servicePerformance,
    isLoading: isServiceLoading,
    refetch: refetchService
  } = trpc.calAnalytics.getServicePerformance.useQuery(
    getDateRange(),
    {
      refetchInterval: 300000, // Refresh every 5 minutes
      refetchOnWindowFocus: true
    }
  );

  // Today's real-time metrics
  const { 
    data: todayMetrics,
    isLoading: isTodayLoading,
    refetch: refetchToday
  } = trpc.calAnalytics.getTodayMetrics.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      refetchOnWindowFocus: true
    }
  );

  // Health status query
  const {
    data: healthStatus,
    isLoading: isHealthLoading,
    refetch: refetchHealth
  } = trpc.calAnalytics.getHealthStatus.useQuery(
    undefined,
    {
      refetchInterval: 120000, // Refresh every 2 minutes
      refetchOnWindowFocus: true
    }
  );

  // Sync Cal.com data mutation
  const syncMutation = trpc.calAnalytics.syncCalData.useMutation();

  // Custom bookings query with filters
  const getBookingsQuery = (filters: {
    status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ACCEPTED' | 'REJECTED';
    attendeeEmail?: string;
    eventTypeId?: number;
    dateRange?: DateRange;
  }) => {
    return trpc.calAnalytics.getBookings.useQuery({
      ...filters,
      limit: 10,
      offset: 0
    });
  };

  // Calculate loading state
  const isLoading = isMetricsLoading ?? isServiceLoading ?? isTodayLoading ?? isHealthLoading;

  // Log errors when they occur
  if (metricsError) {
    logger.error('Error fetching dashboard metrics:', metricsError);
  }

  // Function to sync Cal.com data with enhanced error handling
  const syncCalData = async (options = { forceFullSync: false, batchSize: 100, syncType: 'all' as const }) => {
    try {
      await syncMutation.mutateAsync(options);
      // Refetch all data after sync
      await Promise.all([
        refetchMetrics(),
        refetchService(),
        refetchToday(),
        refetchHealth()
      ]);
      
      // Log success for debugging
      logger.info('Cal.com data sync completed successfully');
      return true;
    } catch (error) {
      logger.error('Error syncing Cal.com data:', error);
      
      // Attempt to recover by retrying the metrics fetch
      try {
        await refetchMetrics();
      } catch (secondError) {
        logger.error('Failed to recover after sync error:', secondError);
      }
      
      return false;
    }
  };

  // Function to refresh all data
  const refreshAll = async () => {
    await Promise.all([
      refetchMetrics(),
      refetchService(),
      refetchToday(),
      refetchHealth()
    ]);
  };

  // Change period and refresh data
  const changePeriod = (period: DashboardPeriod) => {
    setSelectedPeriod(period);
    // Data will automatically refresh due to query dependency change
  };

  return {
    // Data
    dashboardMetrics,
    servicePerformance,
    todayMetrics,
    healthStatus,
    selectedPeriod,
    
    // State
    isLoading,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
    metricsError,
    
    // Actions
    syncCalData,
    refreshAll,
    changePeriod,
    getBookingsQuery
  };
}