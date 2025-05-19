'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Activity,
  BarChart3,
  Circle,
  Eye,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart,
  Sparkles,
  Info,
} from 'lucide-react';
import { AnalyticsStreamEvents } from '@/lib/trpc/routers/analytics-router/live-updates';
import { EventCategory } from '@/lib/trpc/routers/types';

// Live updating counter component
const LiveCounter = ({
  value,
  label,
  icon: Icon,
  className = '',
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  className?: string;
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Flash animation on value change
  useEffect(() => {
    if (value > 0) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <Card
      className={`${className} ${isHighlighted ? 'shadow-lg border-primary' : ''} transition-all duration-500`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{label}</CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-3xl font-bold ${isHighlighted ? 'text-primary' : ''} transition-colors duration-500`}
        >
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

// Format the event category for display
const formatCategory = (category: string) => {
  return category
    .replace('_', ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get the icon for an event type
const getEventIcon = (category: string) => {
  switch (category) {
    case EventCategory.PAGE_VIEW:
      return Eye;
    case EventCategory.ERROR:
      return AlertTriangle;
    case EventCategory.CONVERSION:
      return ShoppingCart;
    case EventCategory.GALLERY:
      return Sparkles;
    case EventCategory.BOOKING:
      return Clock;
    default:
      return Info;
  }
};

// Live events feed component
const LiveEventsFeed = ({ events }: { events: unknown[] }) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Activity className="h-8 w-8 mb-2" />
          <p>Waiting for events...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => {
            // Different rendering based on event type
            if (event.type === AnalyticsStreamEvents.NEW_EVENT) {
              const analyticsEvent = event.data;
              const EventIcon = getEventIcon(analyticsEvent.category);

              return (
                <Card key={index} className="relative overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 w-1 h-full bg-${
                      analyticsEvent.category === EventCategory.ERROR
                        ? 'destructive'
                        : analyticsEvent.category === EventCategory.CONVERSION
                          ? 'green-500'
                          : 'primary'
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
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
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
            } else if (event.type === AnalyticsStreamEvents.STATS_UPDATE) {
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
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">Dashboard statistics have been updated</div>
                  </CardContent>
                </Card>
              );
            } else if (event.type === AnalyticsStreamEvents.ERROR_OCCURRED) {
              const errorEvent = event.data;

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
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div>
                        <span className="font-medium">Message:</span> {errorEvent.errorMessage}
                      </div>
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
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      Event received at {new Date(event.timestamp).toLocaleTimeString()}
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
  onConnect,
  onDisconnect,
}: {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) => {
  return (
    <div className="flex items-center justify-between p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
            <span className="font-medium">Connected</span>
          </>
        ) : isConnecting ? (
          <>
            <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />
            <span className="font-medium">Connecting...</span>
          </>
        ) : (
          <>
            <Circle className="h-3 w-3 fill-red-500 text-red-500" />
            <span className="font-medium">Disconnected</span>
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

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearEvents}>
            Clear Events
          </Button>
        </div>
      </div>

      <ConnectionStatus
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectionError={connectionError}
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

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Live Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <LiveCounter value={eventCounts.total} label="Total Events" icon={Activity} />
            <LiveCounter value={eventCounts.pageViews} label="Page Views" icon={Eye} />
            <LiveCounter value={eventCounts.conversions} label="Conversions" icon={ShoppingCart} />
            <LiveCounter
              value={eventCounts.errors}
              label="Errors"
              icon={AlertTriangle}
              className={eventCounts.errors > 0 ? 'border-red-300' : ''}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Categories</CardTitle>
                <CardDescription>Distribution of events by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(eventCounts.byCategory).map(([category, count]) => {
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
                          <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest events across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {recentEvents.slice(0, 5).map((event, index) => {
                      if (event.type === AnalyticsStreamEvents.NEW_EVENT) {
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
                                  {analyticsEvent.path.length > 40
                                    ? `${analyticsEvent.path.substring(0, 37)}...`
                                    : analyticsEvent.path}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(event.timestamp), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {recentEvents.length === 0 && (
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
                        {formatDistanceToNow(new Date(lastHeartbeat), { addSuffix: true })}
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
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Live Event Stream</CardTitle>
              <CardDescription>Real-time events as they happen</CardDescription>
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
                      {formatDistanceToNow(new Date(lastHeartbeat), { addSuffix: true })}
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
      </Tabs>
    </div>
  );
}
