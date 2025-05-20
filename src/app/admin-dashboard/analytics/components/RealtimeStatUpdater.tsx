/**
 * RealtimeStatUpdater Component
 * 
 * This component manages real-time updates for analytics stats using Server-Sent Events (SSE)
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveActivityIndicator } from './LiveActivityIndicator';
import { Activity, Users, Percent, Eye } from 'lucide-react';
import { useLiveAnalytics } from '@/hooks/use-live-analytics';
import { cn } from '@/lib/utils/styling';
import { api } from '@/lib/trpc/client';
import { 
  formatTimestamp, 
  calculateTrend, 
  calculateChangePercentage,
  getTrendClasses,
  getTrendBorderClasses,
  getTrendBadgeVariant
} from '@/lib/utils/analytics-format';
import { AnalyticsStreamEventType } from '@/types/analytics-types';

/**
 * Live stats data received from the server
 */
export interface LiveStatsData {
  visitors: number;
  pageViews: number;
  activeUsers?: number;
  bookingRequests?: number;
  conversionRate: number;
  bookings: number;
  timestamp?: string;
  type?: AnalyticsStreamEventType;
}

/**
 * Structure for a single real-time statistic display
 */
export interface RealtimeStat {
  id: string;                        // Unique identifier
  name: string;                      // Display name
  value: number;                     // Current value
  trend?: 'up' | 'down' | 'neutral'; // Current trend
  change?: number;                   // Absolute change
  changePercentage?: number;         // Percentage change
  updated?: string;                  // Last update timestamp
  icon?: React.ElementType;          // Icon to display
  format?: (value: number) => string; // Custom value formatter
}

export function RealtimeStatUpdater() {
  const [stats, setStats] = useState<RealtimeStat[]>([]);
  const {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    lastHeartbeat,
    eventCounts
  } = useLiveAnalytics();
  
  // Initial stats data fetching with tRPC
  const { data: liveStats, refetch } = api.analytics.getLiveStats.useQuery(undefined, {
    refetchInterval: isConnected ? false : 30000, // Only auto-refetch if not connected to SSE
  });
  
  // Previous values for trend calculation
  const prevValuesRef = useRef<Record<string, number>>({});
  
  // Connect to analytics stream on mount
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }
    
    // Disconnect on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isConnected, isConnecting]);
  
  // Update stats from tRPC data
  useEffect(() => {
    if (liveStats) {
      // Get previous values
      const prevValues = prevValuesRef.current;
      
      // Calculate the new stats
      const newStats: RealtimeStat[] = [
        {
          id: 'activeUsers',
          name: 'Active Visitors',
          value: liveStats.visitors || 0, // Use visitors as activeUsers
          icon: Users,
          trend: calculateTrend(liveStats.visitors || 0, prevValues['activeUsers']),
          change: Math.abs((liveStats.visitors || 0) - (prevValues['activeUsers'] || 0)),
          changePercentage: calculateChangePercentage(liveStats.visitors || 0, prevValues['activeUsers']),
          updated: new Date().toISOString(),
        },
        {
          id: 'pageViews',
          name: 'Page Views',
          value: liveStats.pageViews,
          icon: Eye,
          trend: calculateTrend(liveStats.pageViews, prevValues['pageViews']),
          change: Math.abs(liveStats.pageViews - (prevValues['pageViews'] || 0)),
          changePercentage: calculateChangePercentage(liveStats.pageViews, prevValues['pageViews']),
          updated: new Date().toISOString(),
        },
        {
          id: 'conversionRate',
          name: 'Conversion Rate',
          value: liveStats.conversionRate,
          icon: Percent,
          format: (value) => `${value.toFixed(2)}%`,
          trend: calculateTrend(liveStats.conversionRate, prevValues['conversionRate']),
          change: Math.abs(liveStats.conversionRate - (prevValues['conversionRate'] || 0)),
          changePercentage: calculateChangePercentage(liveStats.conversionRate, prevValues['conversionRate']),
          updated: new Date().toISOString(),
        },
        {
          id: 'bookingRequests',
          name: 'Booking Requests',
          value: liveStats.bookings || 0, // Use bookings as bookingRequests
          icon: Activity,
          trend: calculateTrend(liveStats.bookings || 0, prevValues['bookingRequests']),
          change: Math.abs((liveStats.bookings || 0) - (prevValues['bookingRequests'] || 0)),
          changePercentage: calculateChangePercentage(liveStats.bookings || 0, prevValues['bookingRequests']),
          updated: new Date().toISOString(),
        },
      ];
      
      // Update stats
      setStats(newStats);
      
      // Update previous values
      prevValuesRef.current = {
        activeUsers: liveStats.visitors || 0,
        pageViews: liveStats.pageViews,
        conversionRate: liveStats.conversionRate,
        bookingRequests: liveStats.bookings || 0,
      };
    }
  }, [liveStats]);
  
  // Refetch on reconnection
  useEffect(() => {
    if (isConnected) {
      refetch();
    }
  }, [isConnected, refetch]);
  
  // We use the imported utility functions:
  // calculateTrend and calculateChangePercentage from analytics-format.ts

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Real-time Analytics</h3>
        <div className="flex items-center gap-2">
          {connectionError && (
            <div className="text-xs text-red-500">{connectionError}</div>
          )}
          <LiveActivityIndicator 
            isConnected={isConnected}
            activeUsers={liveStats?.visitors || 0}
            activeCount={eventCounts.total}
            lastUpdated={lastHeartbeat instanceof Date ? lastHeartbeat : lastHeartbeat ? new Date(lastHeartbeat) : null}
            variant="compact"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          // Format value based on format function or default to localeString
          const formattedValue = stat.format ? stat.format(stat.value) : stat.value.toLocaleString();
          const Icon = stat.icon;
          
          return (
            <Card 
              key={stat.id} 
              className={cn(
                "overflow-hidden transition-all duration-300",
                getTrendBorderClasses(stat.trend)
              )}
            >
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    {stat.name}
                  </CardTitle>
                  {stat.trend && (
                    <CardDescription className="flex items-center">
                      {stat.trend === 'up' && <span className="text-green-500">↑</span>}
                      {stat.trend === 'down' && <span className="text-red-500">↓</span>}
                      {stat.changePercentage !== undefined && stat.changePercentage > 0 && (
                        <span className={`ml-1 text-xs ${getTrendClasses(stat.trend)}`}>
                          {stat.changePercentage.toFixed(1)}%
                        </span>
                      )}
                    </CardDescription>
                  )}
                </div>
                
                <Badge 
                  variant={getTrendBadgeVariant(stat.trend)}
                  className="text-xs"
                >
                  {stat.trend === 'up' ? 'Increasing' : stat.trend === 'down' ? 'Decreasing' : 'Steady'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div 
                  className={cn(
                    "text-2xl font-bold", 
                    getTrendClasses(stat.trend)
                  )}
                >
                  {formattedValue}
                </div>
                {stat.updated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated: {formatTimestamp(stat.updated)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {!isConnected && !isConnecting && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => connect()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Connect to Live Analytics
          </button>
        </div>
      )}
    </div>
  );
}

export default RealtimeStatUpdater;