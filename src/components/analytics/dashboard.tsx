'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from "@/lib/logger";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  DollarSign,
  Download
} from 'lucide-react';

// Simplified analytics types
type DashboardPeriod = 'today' | 'week' | 'month' | 'year';

interface AnalyticsDashboardData {
  period: DashboardPeriod;
  totalBookings: number;
  completedBookings: number;
  revenue: number;
  conversionRate: number;
  customerCount: number;
  trends: {
    bookings: number;
    revenue: number;
    customers: number;
  };
}

interface HealthCheck {
  status: 'healthy' | 'warning' | 'critical';
  database: boolean;
  api: boolean;
  lastSync?: Date;
}

interface CalAnalyticsDashboardProps {
  initialData?: AnalyticsDashboardData;
}

export default function CalAnalyticsDashboard({ 
  initialData
}: CalAnalyticsDashboardProps) {
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for simplified version
  const dashboardData: AnalyticsDashboardData = initialData ?? {
    period,
    totalBookings: 45,
    completedBookings: 38,
    revenue: 5700,
    conversionRate: 84.4,
    customerCount: 156,
    trends: {
      bookings: 12.5,
      revenue: 18.2,
      customers: 8.7,
    },
  };

  const healthStatus: HealthCheck = {
    status: 'healthy',
    database: true,
    api: true,
    lastSync: new Date(),
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh analytics data from API
      const response = await fetch(`/api/analytics/dashboard?period=${period}`);
      if (response.ok) {
        void logger.info('Dashboard refreshed successfully', { period });
      } else {
        throw new Error('Failed to refresh dashboard data');
      }
    } catch (error) {
      void logger.error('Failed to refresh dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
    void handleRefresh();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (value: number) => {
    return value > 0 ? 
      <TrendingUp className="h-3 w-3 text-green-500" /> : 
      <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your booking performance and customer insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(['today', 'week', 'month', 'year'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange(p)}
                className="h-7 px-3 text-xs"
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => void handleRefresh()} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon(healthStatus.status)}
            System Health - {healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${healthStatus.database ? 'bg-green-500' : 'bg-red-500'}`} />
              Database
            </div>
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${healthStatus.api ? 'bg-green-500' : 'bg-red-500'}`} />
              API
            </div>
            {healthStatus.lastSync && (
              <span>Last sync: {healthStatus.lastSync.toLocaleTimeString()}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalBookings}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(dashboardData.trends.bookings)}
              <span className="ml-1">+{dashboardData.trends.bookings}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.revenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(dashboardData.trends.revenue)}
              <span className="ml-1">+{dashboardData.trends.revenue}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.conversionRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {dashboardData.completedBookings}/{dashboardData.totalBookings} completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.customerCount}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(dashboardData.trends.customers)}
              <span className="ml-1">+{dashboardData.trends.customers}% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Trends</CardTitle>
          <CardDescription>
            Booking performance over time for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chart visualization coming soon</p>
              <p className="text-xs">Analytics charts will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}