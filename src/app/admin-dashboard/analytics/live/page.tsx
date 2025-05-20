'use client';

import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { formatTimestamp, parseTimestamp, standardizeTimestamp } from '@/lib/utils/analytics-format';
import {
  Activity,
  Eye,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart,
  Sparkles,
  Info,
  Layers,
  BarChart3,
  LineChart,
  PieChart,
} from 'lucide-react';
import { AnalyticsStreamEventType } from '@/types/analytics-types';
import { useLiveAnalytics } from '@/hooks/use-live-analytics';
import { LiveActivityIndicator } from '../components/LiveActivityIndicator';
import RealtimeStatUpdater from '../components/RealtimeStatUpdater';

// Format the event category for display
const formatCategory = (category: string): string => {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get the icon for an event type
const getEventIcon = (category: string): React.ElementType => {
  switch (category) {
    case 'page_view':
      return Eye;
    case 'error':
      return AlertTriangle;
    case 'conversion':
      return ShoppingCart;
    case 'gallery':
      return Sparkles;
    case 'booking':
      return Clock;
    case 'system':
      return Layers;
    default:
      return Info;
  }
};

// Define the event type interfaces
interface BaseAnalyticsEvent {
  type: string;
  timestamp: string | number;
  data: {
    category: string;
    action: string;
    label?: string;
    path?: string;
    deviceType?: string;
    [key: string]: unknown;
  };
}

interface ErrorEvent extends BaseAnalyticsEvent {
  type: string;
  data: {
    category: string;
    action: string;
    errorMessage?: string;
    componentName?: string;
    path?: string;
    [key: string]: unknown;
  };
}

// Live events feed component
const LiveEventsFeed = ({ events }: { events: BaseAnalyticsEvent[] }) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      {!events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Activity className="h-8 w-8 mb-2" />
          <p>Waiting for events...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => {
            // Different rendering based on event type
            if (event.type === AnalyticsStreamEventType.NEW_EVENT) {
              const analyticsEvent = event.data;
              const EventIcon = getEventIcon(analyticsEvent.category);

              return (
                <Card key={index} className="relative overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${
                      analyticsEvent.category === 'error'
                        ? 'bg-destructive'
                        : analyticsEvent.category === 'conversion'
                          ? 'bg-green-500'
                          : analyticsEvent.category === 'system'
                            ? 'bg-blue-500'
                            : 'bg-primary'
                    }`}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <EventIcon className="h-4 w-4" />
                        <CardTitle className="text-sm font-medium">
                          {formatCategory(analyticsEvent.category)}
                        </CardTitle>
                      </div>
                      <Badge variant="outline">
                        {formatTimestamp(event.timestamp)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {analyticsEvent.action}{' '}
                      {analyticsEvent.label ? `- ${analyticsEvent.label}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {analyticsEvent.path && (
                        <div>
                          <span className="font-medium">Path:</span> {analyticsEvent.path}
                        </div>
                      )}
                      {analyticsEvent.deviceType && (
                        <div>
                          <span className="font-medium">Device:</span> {analyticsEvent.deviceType}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            } else if (event.type === 'stats_update') {
              return (
                <Card key={index} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        <CardTitle className="text-sm font-medium">Stats Updated</CardTitle>
                      </div>
                      <Badge variant="outline">
                        {formatTimestamp(event.timestamp)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">Dashboard statistics have been updated</div>
                  </CardContent>
                </Card>
              );
            } else if (event.type === AnalyticsStreamEventType.ERROR_OCCURRED) {
              const errorEvent = event.data as ErrorEvent['data'];

              return (
                <Card key={index} className="relative overflow-hidden border-red-200">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <CardTitle className="text-sm font-medium">Error Detected</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-red-500 border-red-200">
                        {formatDistanceToNow(new Date(event.timestamp.toString()), { addSuffix: true })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {errorEvent.errorMessage && (
                        <div>
                          <span className="font-medium">Message:</span> {errorEvent.errorMessage}
                        </div>
                      )}
                      {errorEvent.componentName && (
                        <div>
                          <span className="font-medium">Component:</span> {errorEvent.componentName}
                        </div>
                      )}
                      {errorEvent.path && (
                        <div>
                          <span className="font-medium">Path:</span> {errorEvent.path}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            } else {
              // Generic event display for other event types
              return (
                <Card key={index} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gray-500" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-sm font-medium">{event.type}</CardTitle>
                      <Badge variant="outline">
                        {formatTimestamp(event.timestamp)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      Event received at {new Date(event.timestamp.toString()).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })}
        </div>
      )}
    </ScrollArea>
  );
};

// Connection status component
const ConnectionStatus = ({
  isConnected,
  isConnecting,
  connectionError,
  lastHeartbeat,
  onConnect,
  onDisconnect,
}: {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  lastHeartbeat: Date | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) => {
  return (
    <div className="flex items-center justify-between p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <LiveActivityIndicator 
              isConnected={isConnected} 
              variant="compact" 
              pulse={true} 
            />
            {lastHeartbeat && (
              <span className="text-sm text-muted-foreground">
                Last update: {formatTimestamp(lastHeartbeat)}
              </span>
            )}
          </>
        ) : isConnecting ? (
          <>
            <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />
            <span className="font-medium">Connecting...</span>
          </>
        ) : (
          <>
            <LiveActivityIndicator 
              isConnected={false} 
              variant="compact" 
              pulse={false} 
            />
            <span className="text-sm text-muted-foreground">Disconnected from analytics stream</span>
          </>
        )}

        {connectionError && <span className="text-red-500 ml-2 text-sm">{connectionError}</span>}
      </div>

      <div className="flex gap-2">
        {isConnected ? (
          <Button variant="outline" size="sm" onClick={onDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onConnect} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </div>
  );
};

// Event distribution chart component
const EventDistributionChart = ({ 
  eventCounts 
}: { 
  eventCounts: { 
    total: number; 
    byCategory: Record<string, number>; 
  } 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Event Categories</CardTitle>
            <CardDescription>Distribution of events by category</CardDescription>
          </div>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(eventCounts.byCategory).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <BarChart3 className="h-8 w-8 mb-2" />
              <p>No events received yet</p>
            </div>
          ) : (
            Object.entries(eventCounts.byCategory).map(([category, count]) => {
              const percentage =
                eventCounts.total > 0 ? (count / eventCounts.total) * 100 : 0;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{formatCategory(category)}</span>
                    <span className="text-sm">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary overflow-hidden rounded-full">
                    <div 
                      className={`h-full ${
                        category === 'error' 
                          ? 'bg-destructive' 
                          : category === 'conversion' 
                            ? 'bg-green-500' 
                            : 'bg-primary'
                      }`} 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Recent activity component
const RecentActivity = ({ 
  recentEvents, 
  isConnected, 
  lastHeartbeat 
}: { 
  recentEvents: BaseAnalyticsEvent[];
  isConnected: boolean;
  lastHeartbeat: Date | null;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events across the platform</CardDescription>
          </div>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {recentEvents && recentEvents.length > 0 ? (
              recentEvents.slice(0, 5).map((event, index) => {
                if (event.type === AnalyticsStreamEventType.NEW_EVENT) {
                  const analyticsEvent = event.data;
                  const EventIcon = getEventIcon(analyticsEvent.category);

                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <EventIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium leading-none">
                          {formatCategory(analyticsEvent.category)} - {analyticsEvent.action}
                        </p>
                        {analyticsEvent.path && (
                          <p className="text-sm text-muted-foreground">
                            {analyticsEvent.path && analyticsEvent.path.length > 40
                              ? `${analyticsEvent.path.substring(0, 37)}...`
                              : analyticsEvent.path}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Activity className="h-8 w-8 mb-2" />
                <p>Waiting for events...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {lastHeartbeat ? (
              <span>
                Last updated:{' '}
                {formatTimestamp(lastHeartbeat)}
              </span>
            ) : (
              <span>Waiting for update...</span>
            )}
          </div>

          <div className="flex items-center">
            {isConnected ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                <span>Live</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// Main live analytics dashboard
export default function LiveAnalyticsDashboard() {
  const {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    recentEvents,
    eventCounts,
    lastHeartbeat,
    clearEvents,
  } = useLiveAnalytics();

  // Connect to analytics stream on mount
  useEffect(() => {
    // Auto-connect if not already connected
    if (!isConnected && !isConnecting) {
      connect();
    }
    
    // Disconnect on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isConnected, isConnecting]);
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-end gap-2">
          <h1 className="text-3xl font-bold">Live Analytics</h1>
          <LiveActivityIndicator 
            isConnected={isConnected}
            lastUpdated={lastHeartbeat}
            variant="compact"
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearEvents}>
            Clear Events
          </Button>
          {!isConnected && (
            <Button onClick={connect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </div>

      <ConnectionStatus
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectionError={connectionError}
        lastHeartbeat={lastHeartbeat}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      {!isConnected && !isConnecting && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not Connected</AlertTitle>
          <AlertDescription>
            Connect to the analytics stream to see real-time updates.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Realtime stats component */}
      <div className="mb-6">
        <RealtimeStatUpdater />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Live Events</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EventDistributionChart eventCounts={eventCounts} />
            <RecentActivity 
              recentEvents={recentEvents} 
              isConnected={isConnected}
              lastHeartbeat={lastHeartbeat}
            />
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Event Stream</CardTitle>
                  <CardDescription>Real-time events as they happen</CardDescription>
                </div>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <LiveEventsFeed events={recentEvents} />
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {lastHeartbeat ? (
                    <span>
                      Last updated:{' '}
                      {formatTimestamp(lastHeartbeat)}
                    </span>
                  ) : (
                    <span>Waiting for update...</span>
                  )}
                </div>

                <Button variant="outline" size="sm" onClick={clearEvents}>
                  Clear Events
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Analytics Insights</CardTitle>
                    <CardDescription>
                      Key metrics and trends from your analytics data
                    </CardDescription>
                  </div>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Coming Soon</AlertTitle>
                    <AlertDescription>
                      Advanced analytics insights and visualizations will be available in a future update.
                    </AlertDescription>
                  </Alert>
                  
                  <p className="text-sm text-muted-foreground">
                    This section will provide in-depth analysis of user behavior, conversion funnels,
                    and other key metrics to help you understand your website's performance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
