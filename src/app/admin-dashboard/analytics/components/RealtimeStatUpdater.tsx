/**
 * RealtimeStatUpdater Component
 * 
 * This component manages real-time updates for analytics stats using tRPC subscription
 */
'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface RealtimeStat {
  id: string;
  name: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  changePercentage?: number;
  updated?: string;
}

export function RealtimeStatUpdater() {
  // const toast = useToast();
  const [stats, setStats] = useState<RealtimeStat[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize with some data
    const fetchInitialStats = async () => {
      try {
        const result = await trpc.analytics.getLiveStats.query();
        if (result) {
          setStats(result);
        }
      } catch (error) {
        console.error('Failed to fetch initial stats', error);
      }
    };

    fetchInitialStats();

    // Set up subscription for real-time updates
    const subscription = trpc.analytics.onStatsUpdate.subscribe(undefined, {
      onData(updatedStat) {
        setStats(prevStats => {
          const existingIndex = prevStats.findIndex(s => s.id === updatedStat.id);
          
          if (existingIndex >= 0) {
            // Update existing stat
            const newStats = [...prevStats];
            const oldValue = newStats[existingIndex].value;
            
            // Calculate trend
            let trend: 'up' | 'down' | 'neutral' = 'neutral';
            let change = 0;
            let changePercentage = 0;
            
            if (updatedStat.value > oldValue) {
              trend = 'up';
              change = updatedStat.value - oldValue;
              changePercentage = oldValue > 0 ? (change / oldValue) * 100 : 100;
            } else if (updatedStat.value < oldValue) {
              trend = 'down';
              change = oldValue - updatedStat.value;
              changePercentage = oldValue > 0 ? (change / oldValue) * 100 : 0;
            }
            
            newStats[existingIndex] = {
              ...updatedStat,
              trend,
              change,
              changePercentage,
              updated: new Date().toISOString()
            };
            
            return newStats;
          } else {
            // Add new stat
            return [...prevStats, {
              ...updatedStat,
              trend: 'neutral',
              updated: new Date().toISOString()
            }];
          }
        });

        // Connection is established if we're receiving data
        if (!isConnected) {
          setIsConnected(true);
          // toast.success("Real-time connection established", {
          //   description: "You're now receiving live analytics updates"
          // });
        }
      },
      onError(error) {
        console.error('Analytics subscription error:', error);
        setIsConnected(false);
        // toast.error("Connection error", {
        //   description: "Failed to connect to analytics stream"
        // });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, isConnected]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Real-time Analytics</h3>
        <Badge variant={isConnected ? "success" : "destructive"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              {stat.trend && (
                <CardDescription className="flex items-center">
                  {stat.trend === 'up' && <span className="text-green-500">↑</span>}
                  {stat.trend === 'down' && <span className="text-red-500">↓</span>}
                  {stat.changePercentage !== undefined && (
                    <span className={`ml-1 text-xs ${
                      stat.trend === 'up' ? 'text-green-500' : 
                      stat.trend === 'down' ? 'text-red-500' : ''
                    }`}>
                      {stat.changePercentage.toFixed(1)}%
                    </span>
                  )}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              {stat.updated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {new Date(stat.updated).toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RealtimeStatUpdater;