/**
 * Custom hook for dashboard metrics with optimized calculations
 * Provides memoized dashboard statistics and real-time updates
 */
import { useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { DashboardStatsResponse } from '@/types/dashboard-types';
import type { DatabasePayment } from '@/types/payments-types';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface MetricsPeriod {
  current: DateRange;
  previous: DateRange;
}

interface UseDashboardMetricsReturn {
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

export function useDashboardMetrics(period: MetricsPeriod): UseDashboardMetricsReturn {
  // Multiple tRPC queries for different data sources
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = trpc.dashboard.getStats.useQuery({
    period: 'month',
    compareToPrevious: true,
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

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = trpc.dashboard.getRecentBookings.useQuery({
    limit: 100, // Get enough for calculations
  });

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
    const summary = dashboardStats?.summary;
    if (!summary) return { total: 0, new: 0, growth: 0, trend: 'neutral' as const };

    const total = summary.customers.total;
    const newCustomers = summary.customers.new;
    const growth = summary.customers.change;

    const trend: 'up' | 'down' | 'neutral' = growth > 5 ? 'up' : growth < -5 ? 'down' : 'neutral';

    return {
      total,
      new: newCustomers,
      growth,
      trend,
    };
  }, [dashboardStats?.summary]);

  // Memoized booking metrics
  const bookingMetrics = useMemo(() => {
    const bookings = bookingsData?.bookings ?? [];

    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const pending = bookings.filter(
      (b) => b.status === 'pending' || b.status === 'scheduled'
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate trend based on recent bookings vs older ones
    const recentBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookingDate >= weekAgo;
    }).length;

    const olderBookings = total - recentBookings;
    const trend: 'up' | 'down' | 'neutral' =
      recentBookings > olderBookings ? 'up' : recentBookings < olderBookings ? 'down' : 'neutral';

    return {
      total,
      completed,
      pending,
      completionRate,
      trend,
    };
  }, [bookingsData?.bookings]);

  // Optimized refresh function
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refetchStats(),
      refetchPayments(),
      refetchPreviousPayments(),
      refetchBookings(),
    ]);
  }, [refetchStats, refetchPayments, refetchPreviousPayments, refetchBookings]);

  const getMetricsForPeriod = useCallback((newPeriod: MetricsPeriod) => {
    // This would typically update query parameters
    console.warn('Updating metrics for period:', newPeriod);
  }, []);

  const isLoading = (statsLoading ?? false) || paymentsLoading || bookingsLoading;
  const error = statsError;

  return {
    stats: dashboardStats,
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
 */
export function useRealtimeDashboard() {
  const utils = trpc.useUtils();

  const invalidateAll = useCallback(() => {
    // Invalidate all dashboard-related queries
    void utils.dashboard.getStats.invalidate();
    void utils.payments.getPaymentStats.invalidate();
    void utils.dashboard.getRecentBookings.invalidate();
    void utils.admin.customers.invalidate();
  }, [utils]);

  const invalidatePayments = useCallback(() => {
    void utils.payments.getAllPayments.invalidate();
    void utils.payments.getPaymentStats.invalidate();
  }, [utils]);

  const invalidateBookings = useCallback(() => {
    void utils.dashboard.getRecentBookings.invalidate();
    void utils.appointments.invalidate();
  }, [utils]);

  return {
    invalidateAll,
    invalidatePayments,
    invalidateBookings,
  };
}

/**
 * Hook for dashboard chart data preparation
 */
export function useDashboardCharts(payments: DatabasePayment[]) {
  const chartData = useMemo(() => {
    // Revenue over time chart data
    const revenueByMonth = payments.reduce(
      (acc, payment) => {
        if (payment.status !== 'completed' && payment.status !== 'paid') return acc;

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
      paymentMethods: Object.entries(paymentMethods).map(([method, count]) => ({
        method,
        count,
        percentage: Math.round((count / payments.length) * 100),
      })),
      statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / payments.length) * 100),
      })),
    };
  }, [payments]);

  return chartData;
}
