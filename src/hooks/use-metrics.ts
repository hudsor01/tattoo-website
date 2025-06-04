'use client';

import { useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { DashboardStatsResponse, DatabasePayment } from '@prisma/client';

import { logger } from "@/lib/logger";
// Types
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface MetricsPeriod {
  current: DateRange;
  previous: DateRange;
}

export interface UseDashboardMetricsReturn {
  stats: DashboardStatsResponse | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;

  // Computed metrics
  revenueMetrics: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down' | 'neutral';
  };

  customerMetrics: {
    total: number;
    new: number;
    growth: number;
    trend: 'up' | 'down' | 'neutral';
  };

  bookingMetrics: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
    trend: 'up' | 'down' | 'neutral';
  };

  // Actions
  refreshAll: () => Promise<void>;
  getMetricsForPeriod: (period: MetricsPeriod) => void;
}

/**
 * Hook for dashboard metrics with optimized calculations
 * Provides memoized dashboard statistics and key performance indicators
 */
export function useDashboardMetrics(period: MetricsPeriod): UseDashboardMetricsReturn {
  // Multiple tRPC queries for different data sources
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = trpc.dashboard.stats.getStats.useQuery({
    period: 'month',
    compareWithPrevious: true,
  });

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = trpc.payments.getPaymentStats.useQuery({
    startDate: period.current.startDate,
    endDate: period.current.endDate,
  });

  const { data: previousPaymentsData, refetch: refetchPreviousPayments } =
    trpc.payments.getPaymentStats.useQuery({
      startDate: period.previous.startDate,
      endDate: period.previous.endDate,
    });

  // Note: appointments handled by Cal.com, no longer fetching from internal database
  const appointmentsLoading = false;
  const refetchappointments = useCallback(() => Promise.resolve(), []);

  // Memoized revenue metrics
  const revenueMetrics = useMemo(() => {
    const current = paymentsData?.totalRevenue ?? 0;
    const previous = previousPaymentsData?.totalRevenue ?? 0;

    const growth =
      previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;

    const trend: 'up' | 'down' | 'neutral' = growth > 5 ? 'up' : growth < -5 ? 'down' : 'neutral';

    return { current, previous, growth, trend };
  }, [paymentsData?.totalRevenue, previousPaymentsData?.totalRevenue]);

  // Memoized customer metrics
  const customerMetrics = useMemo(() => {
    const customers = dashboardStats?.customers;
    if (!customers) return { total: 0, new: 0, growth: 0, trend: 'neutral' as const };

    const total = customers.total;
    const newCustomers = customers.newInPeriod;
    const growth = customers.change;

    const trend: 'up' | 'down' | 'neutral' = growth > 5 ? 'up' : growth < -5 ? 'down' : 'neutral';

    return {
      total,
      new: newCustomers,
      growth,
      trend,
    };
  }, [dashboardStats?.customers]);

  // Memoized booking metrics (using appointments data)
  const bookingMetrics = useMemo(() => {
    const appointments = dashboardStats?.appointments;
    if (!appointments) return { total: 0, completed: 0, pending: 0, completionRate: 0, trend: 'neutral' as const };

    const total = appointments.total;
    const completed = appointments.completed;
    const pending = appointments.upcoming;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Use the change percentage from the stats to determine trend
    const change = appointments.change;
    const trend: 'up' | 'down' | 'neutral' = change > 5 ? 'up' : change < -5 ? 'down' : 'neutral';

    return {
      total,
      completed,
      pending,
      completionRate,
      trend,
    };
  }, [dashboardStats?.appointments]);

  // Optimized refresh function
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refetchStats(),
      refetchPayments(),
      refetchPreviousPayments(),
      refetchappointments(),
    ]);
  }, [refetchStats, refetchPayments, refetchPreviousPayments, refetchappointments]);

  const getMetricsForPeriod = useCallback((newPeriod: MetricsPeriod) => {
    // This would typically update query parameters
    void logger.warn('Updating metrics for period:', newPeriod);
  }, []);

  const isLoading = (statsLoading ?? false) || (paymentsLoading ?? false) || (appointmentsLoading ?? false);
  const error = statsError;

  return {
    stats: dashboardStats as unknown as DashboardStatsResponse,
    isLoading,
    error,
    refetch: refetchStats,
    revenueMetrics,
    customerMetrics,
    bookingMetrics,
    refreshAll,
    getMetricsForPeriod,
  };
}

/**
 * Hook for real-time dashboard updates
 * Provides functions to invalidate cached data and trigger refetches
 */
export function useRealtimeDashboard() {
  const utils = trpc.useUtils();

  const invalidateAll = useCallback(() => {
    // Invalidate all dashboard-related queries
    void utils.dashboard.stats.getStats.invalidate();
    void utils.payments.getPaymentStats.invalidate();
    // Note: getRecentappointments no longer exists since Cal.com handles appointments
  }, [utils]);

  const invalidatePayments = useCallback(() => {
    void utils.payments.getAllPayments.invalidate();
    void utils.payments.getPaymentStats.invalidate();
  }, [utils]);

  const invalidateappointments = useCallback(() => {
    // Note: getRecentappointments no longer exists since Cal.com handles appointments
    void utils.appointments.invalidate();
  }, [utils]);

  return {
    invalidateAll,
    invalidatePayments,
    invalidateappointments,
  };
}

/**
 * Hook for dashboard chart data preparation
 * Transforms payment data into chart-friendly formats
 */
export function useDashboardCharts(payments: DatabasePayment[]) {
  const chartData = useMemo(() => {
    // Revenue over time chart data
    const revenueByMonth = payments.reduce(
      (acc, payment) => {
        if (payment.status !== 'COMPLETED') return acc;

        const month = new Date(payment.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });

        acc[month] = (acc[month] ?? 0) + payment.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Payment methods distribution
    const paymentMethods = payments.reduce(
      (acc, payment) => {
        const method = payment.paymentMethod ?? 'unknown';
        acc[method] = (acc[method] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Status distribution
    const statusDistribution = payments.reduce(
      (acc, payment) => {
        acc[payment.status] = (acc[payment.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({
        month,
        revenue,
      })),
      paymentMethods: Object.entries(paymentMethods).map(([method, count]) => {
        const countNum = Number(count);
        return {
          method,
          count: countNum,
          percentage: payments.length ? Math.round((countNum / payments.length) * 100) : 0,
        };
      }),
      statusDistribution: Object.entries(statusDistribution).map(([status, count]) => {
        const countNum = Number(count);
        return {
          status,
          count: countNum,
          percentage: payments.length ? Math.round((countNum / payments.length) * 100) : 0,
        };
      }),
    };
  }, [payments]);

  return chartData;
}
