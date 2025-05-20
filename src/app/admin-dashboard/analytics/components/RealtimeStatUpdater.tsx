/**
 * RealtimeStatUpdater Component
 * 
 * This component manages real-time updates for analytics stats using tRPC subscription
 */
'use client';

import { useEffect, useState } from 'react';
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
    // Initialize with mock data
    const initMockData = () => {
      const mockStats: RealtimeStat[] = [
        {
          id: '1',
          name: 'Active Visitors',
          value: Math.floor(Math.random() * 25) + 5,
          trend: 'up',
          updated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Page Views',
          value: Math.floor(Math.random() * 100) + 50,
          trend: 'up',
          updated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Conversion Rate',
          value: Math.random() * 10,
          trend: 'neutral',
          updated: new Date().toISOString()
        }
      ];
      
      setStats(mockStats);
    };

    initMockData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prevStats => {
        return prevStats.map(stat => {
          // Generate random change with 70% chance of increase
          const isIncrease = Math.random() > 0.3;
          const changeAmount = stat.id === '3' 
            ? Math.random() * 0.5 // Smaller changes for conversion rate
            : Math.floor(Math.random() * 5) + 1;
          
          const oldValue = stat.value;
          const newValue = isIncrease 
            ? oldValue + changeAmount
            : Math.max(0, oldValue - changeAmount);
          
          // Calculate trend and change
          let trend: 'up' | 'down' | 'neutral';
          let change: number;
          let changePercentage: number;
          
          if (newValue > oldValue) {
            trend = 'up';
            change = newValue - oldValue;
            changePercentage = oldValue > 0 ? (change / oldValue) * 100 : 100;
          } else if (newValue < oldValue) {
            trend = 'down';
            change = oldValue - newValue;
            changePercentage = oldValue > 0 ? (change / oldValue) * 100 : 0;
          } else {
            trend = 'neutral';
            change = 0;
            changePercentage = 0;
          }
          
          return {
            ...stat,
            value: newValue,
            trend,
            change,
            changePercentage,
            updated: new Date().toISOString()
          };
        });
      });
      
      // Set connected after first update
      if (!isConnected) {
        setIsConnected(true);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isConnected]);

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