'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Customer stats type
interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  avgLifetimeValue: number;
}

// Fetch customer stats from API
async function fetchCustomerStats(): Promise<CustomerStats> {
  const response = await fetch('/api/admin/customers/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch customer stats');
  }
  return response.json();
}

export default function CustomerStatsCards() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-customer-stats'],
    queryFn: fetchCustomerStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
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
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    avgLifetimeValue: 0,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            All registered customers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              displayStats.activeCustomers.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Customers with recent activity
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : (
              `$${displayStats.avgLifetimeValue.toFixed(2)}`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Average customer value
          </p>
        </CardContent>
      </Card>
    </div>
  );
}