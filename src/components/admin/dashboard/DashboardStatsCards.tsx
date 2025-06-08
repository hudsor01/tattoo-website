'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Dashboard stats type
interface DashboardStats {
  totalAppointments: number;
  appointmentsThisMonth: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  averageTicket: number;
  growthRate: number;
}

// Fetch dashboard stats from API
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/admin/analytics/dashboard');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}

export default function DashboardStatsCards() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 text-sm">Failed to load stats</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const defaultStats = {
    totalAppointments: 0,
    appointmentsThisMonth: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    averageTicket: 0,
    growthRate: 0,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              displayStats.totalAppointments.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            ) : (
              `${displayStats.appointmentsThisMonth} this month`
            )}
          </p>
        </CardContent>
      </Card>

      {/* Total Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              displayStats.totalCustomers.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            ) : (
              `+${displayStats.newCustomersThisMonth} this month`
            )}
          </p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : (
              `$${displayStats.totalRevenue.toLocaleString()}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <div className="h-3 w-28 bg-muted animate-pulse rounded" />
            ) : (
              `$${displayStats.revenueThisMonth.toLocaleString()} this month`
            )}
          </p>
        </CardContent>
      </Card>

      {/* Growth Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              `${displayStats.growthRate >= 0 ? '+' : ''}${displayStats.growthRate.toFixed(1)}%`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            ) : (
              'vs last month'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}