'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logger } from "@/lib/logger";
import { 
  Activity, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  DollarSign,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { 
  DashboardPeriod, 
  AnalyticsDashboardData,
  HealthCheck,
  FunnelStage,
  ServicePerformance,
  BatchStatsData,
  HealthStatusData,
  CalAnalyticsDashboardProps
} from '@prisma/client';
import {
  AreaChart,
  Area,
  XAxis, 
  YAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { MetricCard } from './MetricCard';
import { CustomTooltip, CustomLegend } from './ChartComponents';
import { MetricCardSkeleton, ChartSkeleton, ServiceCardSkeleton } from './SkeletonLoaders';

// Define interface for daily stat data
interface DailyStat {
  date: string;
  revenue: number;
  bookings: number;
  views: number;
}

export function AnalyticsDashboard({ 
  period: _period = 'week', 
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: CalAnalyticsDashboardProps) {
  const [selectedPeriod] = useState<DashboardPeriod>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Main dashboard data
  const { 
    data: dashboardData, 
    refetch: refetchDashboard,
    isLoading: isDashboardLoading 
  } = trpc.calAnalytics.getDashboardData.useQuery<AnalyticsDashboardData>(
    { period: selectedPeriod },
    { 
      refetchInterval: autoRefresh ? refreshInterval : false,
      refetchOnWindowFocus: false 
    }
  );

  // Health status
  const { 
    data: healthStatus, 
    refetch: refetchHealth  } = trpc.calAnalytics.getHealthStatus.useQuery<HealthStatusData>(
    undefined,
    { 
      refetchInterval: autoRefresh ? 10000 : false, // Check health every 10 seconds
      refetchOnWindowFocus: false 
    }
  );

  // Batch processor stats
  const { 
    data: batchStats, 
    refetch: refetchBatchStats 
  } = trpc.calAnalytics.getBatchStats.useQuery<BatchStatsData>(
    undefined,
    { 
      refetchInterval: autoRefresh ? 5000 : false, // Check batch stats every 5 seconds
      refetchOnWindowFocus: false 
    }
  );

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchDashboard(),
        refetchHealth(),
        refetchBatchStats()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Health status indicator
  const getHealthStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  // Create safe chart data from dashboard data
  const getChartData = () => {
    // Return empty array if data isn't loaded yet
    if (!dashboardData?.bookingAnalytics) {
      return [];
    }
    
    // Use actual data if available, otherwise return empty array
    try {
      if (Array.isArray(dashboardData.dailyStats) && dashboardData.dailyStats.length > 0) {
        return dashboardData.dailyStats.map((stat: DailyStat) => {
          // Ensure all properties exist and are valid numbers
          return {
            name: stat.date ?? 'Unknown',
            revenue: typeof stat.revenue === 'number' ? stat.revenue : 0,
            bookings: typeof stat.bookings === 'number' ? stat.bookings : 0,
            customers: typeof stat.views === 'number' ? stat.views : 0
          };
        }).filter((item: { name: string; }) => item.name !== 'Unknown'); // Filter out items with missing dates
      }
      
      return [];
    } catch (error) {
      void logger.error('Error processing chart data:', error);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-base lg:text-lg text-white/40">
            Real-time Cal.com booking insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="gap-1 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Badge variant="outline" className="flex items-center gap-1 bg-gray-800 text-gray-300 border-gray-700">
            {getHealthStatusIcon(healthStatus?.status)}
            <span className="hidden sm:inline">System {healthStatus?.status ?? 'Unknown'}</span>
          </Badge>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isDashboardLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Revenue"
              value={`$${dashboardData?.bookingAnalytics?.totalRevenue?.toFixed(0) ?? 0}`}
              icon={<DollarSign className="h-5 w-5" />}
              change={10.2}
              trend="up"
              description="vs last month"
            />
            
            <MetricCard
              title="New Customers" 
              value={
                Array.isArray(dashboardData?.servicePerformance) 
                  ? dashboardData.servicePerformance.reduce((sum: number, service: ServicePerformance) => sum + (service.uniqueUsers ?? 0), 0) 
                  : 0
              }
              icon={<Users className="h-5 w-5" />}
              change={5.3}
              trend="up"
              description="from Cal.com"
            />
            
            <MetricCard
              title="Active Accounts"
              value={dashboardData?.bookingAnalytics?.totalBookings ?? 0}
              icon={<Calendar className="h-5 w-5" />}
              change={-2.1}
              trend="down"
              description="total bookings"
            />
            
            <MetricCard
              title="Growth Rate"
              value={
                `${dashboardData?.funnelMetrics?.overallConversionRate?.toFixed(1) ?? 0}%`
              }
              icon={<TrendingUp className="h-5 w-5" />}
              change={1.5}
              trend="up"
              description="conversion rate"
            />
          </>
        )}
      </div>

      {/* Chart Section */}
      {isDashboardLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-white text-xl lg:text-2xl font-semibold">Total Visitors</h3>
              <p className="text-gray-400 text-base lg:text-lg">Cal.com booking analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-600 text-white">
                  3 Months
                </button>
                <button className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-white">
                  30 Days
                </button>
                <button className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-400 hover:text-white">
                  7 Days
                </button>
              </div>
              <button className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:text-white">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:text-white">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Chart Component */}
          <div className="h-80">
            {getChartData().length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No data available</p>
              </div>
            ) : (
              <React.Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              }>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#333" 
                      horizontal={true}
                      vertical={false}
                      opacity={0.2}
                    />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      tickFormatter={(value) => `${value}`}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="customers"
                      stroke="#dc2626"
                      strokeWidth={2}
                      fill="url(#colorCustomers)"
                      dot={{ fill: '#dc2626', strokeWidth: 2, r: 2 }}
                      activeDot={{ r: 4, stroke: '#dc2626', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#colorBookings)"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 2 }}
                      activeDot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 2 }}
                      activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </React.Suspense>
            )}
          </div>
          <CustomLegend />
        </div>
      )}

      {/* Funnel and Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Metrics */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <h3 className="text-white text-xl lg:text-2xl font-semibold">Conversion Funnel</h3>
            </div>
            <Badge variant="outline" className="text-gray-300 border-gray-700 bg-gray-800">
              {dashboardData?.funnelMetrics?.overallConversionRate?.toFixed(1) ?? 0}% Overall
            </Badge>
          </div>
          
          <div className="space-y-4 mt-4">
            {Array.isArray(dashboardData?.funnelMetrics?.stageBreakdown) && dashboardData.funnelMetrics.stageBreakdown.length > 0 ? (
              dashboardData.funnelMetrics.stageBreakdown.map((stage: FunnelStage, index: number) => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      index === 0 ? 'bg-[#dc2626]' : 
                      index === 1 ? 'bg-purple-500' : 
                      index === 2 ? 'bg-emerald-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-gray-300 text-base">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-gray-400">
                      {stage.users} users
                    </span>
                    <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
                      {stage.conversionRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">No funnel data available</div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-gray-400" />
            <h3 className="text-white text-xl lg:text-2xl font-semibold">System Health</h3>
          </div>
          
          <div className="space-y-4 mt-4">
            {/* Health Checks */}
            {healthStatus?.checks?.map((check: HealthCheck) => (
              <div key={check.name} className="flex items-center justify-between">
                <span className="text-base text-gray-300">{check.name.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  {getHealthStatusIcon(check.status)}
                  <span className="text-sm text-gray-400">
                    {check.duration}ms
                  </span>
                </div>
              </div>
            ))}

            {/* Batch Stats */}
            {batchStats && (
              <div className="pt-4 border-t border-gray-700">
                <div className="text-base font-medium text-gray-300 mb-2">Batch Processor</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div>Queue: {batchStats.queueSize}</div>
                  <div>Batch Size: {batchStats.batchSize}</div>
                  <div>Processing: {batchStats.isProcessing ? 'Yes' : 'No'}</div>
                  <div>Interval: {batchStats.flushInterval}ms</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Performance */}
      {isDashboardLoading ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-700 gap-4">
            <div className="h-6 bg-gray-700 rounded w-48 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-[#dc2626] rounded w-28 animate-pulse"></div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <div className="h-4 bg-gray-700 rounded w-40 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-40 animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-700 gap-4">
            <div className="flex items-center">
              <h3 className="text-white text-xl lg:text-2xl font-semibold">Cal.com Bookings</h3>
              <div className="ml-3 px-2.5 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                {dashboardData?.bookingAnalytics?.totalBookings ?? 0} total
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm rounded-lg">
                <RefreshCw className="h-4 w-4" />
                Sync Cal.com
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              {Array.isArray(dashboardData?.servicePerformance) && dashboardData.servicePerformance.length > 0 ? (
                dashboardData.servicePerformance.map((service: ServicePerformance, _index: number) => (
                  <div 
                    key={service.serviceId} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/50"
                  >
                    <div>
                      <h4 className="font-medium text-white text-lg">{service.serviceName ?? service.serviceId}</h4>
                      <p className="text-base text-gray-400 mt-1">
                        {service.views} views • {service.totalBookings} bookings
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-3 sm:mt-0">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          {service.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">
                          Conversion
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          ${service.revenue.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Revenue
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">No service data available</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <div className="text-gray-400 text-xs">
              Showing {dashboardData?.servicePerformance?.length ?? 0} Cal.com services
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Cal.com Integration Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <p>Total Bookings: {dashboardData?.bookingAnalytics?.totalBookings ?? 0}</p>
          <p>Confirmed: {dashboardData?.bookingAnalytics?.confirmedBookings ?? 0}</p>
          <p>Cancelled: {dashboardData?.bookingAnalytics?.cancelledBookings ?? 0}</p>
          <p>Revenue: ${dashboardData?.bookingAnalytics?.totalRevenue?.toFixed(0) ?? 0}</p>
        </div>
        <div className="text-gray-500 text-xs">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
