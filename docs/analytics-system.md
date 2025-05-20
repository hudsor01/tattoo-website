# Analytics System Documentation

This document provides an overview of the analytics system implemented in the Ink 37 tattoo website. The system tracks user interactions, page views, and other important events to provide insights into user behavior.

## Architecture Overview

The analytics system consists of several key components:

1. **Client-Side Tracking**: Components and hooks for capturing events
2. **Server-Side API**: tRPC procedures for processing and storing events
3. **Real-Time Dashboard**: Live monitoring of site activity
4. **Data Storage**: Prisma models for storing analytics data
5. **Analytics Provider**: Context provider for making tracking available throughout the app

## Event Types

The system tracks several categories of events:

- **Page Views**: User visits to different pages
- **Interactions**: User interactions with UI elements
- **Bookings**: Actions related to booking appointments
- **Gallery**: Interactions with the design gallery
- **Conversions**: Completed goals (bookings, sign-ups, etc.)
- **Errors**: Application errors and exceptions

## Implementation Details

### Analytics Provider

The `AnalyticsProvider` component wraps the application and provides tracking methods via context. It also handles global error tracking.

```tsx
// src/components/providers/AnalyticsProvider.tsx
import { createContext, useContext, useEffect } from 'react';
import { useAnalytics, useErrorTracking } from '@/hooks/use-analytics';

// ...

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const analytics = useAnalytics();
  const error = useErrorTracking();
  
  // Setup global error tracking
  useEffect(() => {
    // Error tracking logic...
  }, [analytics]);
  
  return (
    <AnalyticsContext.Provider value={{ ...analytics, error }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
```

### Page View Tracking

Automatic page view tracking is implemented via the `PageViewTracker` component and the `usePageViewTracking` hook.

```tsx
// src/components/PageViewTracker.tsx
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useAnalyticsContext();
  
  useEffect(() => {
    // Track page view logic...
  }, [pathname, searchParams, trackPageView]);
  
  return null;
}
```

### Gallery Tracking

The gallery tracking system tracks user interactions with the design gallery:

- Design views
- View duration
- Sharing
- Favorites
- Conversions from gallery to booking

Example implementation in the `DesignDetail` component:

```tsx
// Track design view when component mounts
useEffect(() => {
  if (design && !isLoading) {
    viewStartTimeRef.current = new Date();
    
    trackGalleryEvent({
      action: 'view',
      designId: id,
      designType: design.designType,
      artist: design.artist?.user?.name,
      tags: design.tags?.map(tag => tag.name),
    });
  }
  
  // Track view ended when component unmounts
  return () => {
    if (viewStartTimeRef.current && design) {
      const viewTime = new Date().getTime() - viewStartTimeRef.current.getTime();
      
      trackGalleryEvent({
        action: 'view',
        designId: id,
        designType: design.designType,
        viewTime,
      });
    }
  };
}, [design, id, isLoading, trackGalleryEvent]);
```

### Real-Time Analytics

The real-time analytics dashboard uses Server-Sent Events (SSE) to stream updates to the client. This is implemented with:

1. `createAnalyticsStream` function in the API
2. `useLiveAnalytics` hook for client-side consumption
3. `RealtimeStatUpdater` and `LiveActivityIndicator` components for visualization

```tsx
// src/hooks/use-live-analytics.ts
export function useLiveAnalytics() {
  const [isConnected, setIsConnected] = useState(false);
  const [recentEvents, setRecentEvents] = useState<AnalyticsStreamEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const connect = useCallback(() => {
    // Connect to SSE endpoint
    const eventSource = new EventSource('/api/analytics/stream');
    // Event handling logic...
  }, [isConnected, isConnecting]);
  
  // ...
  
  return {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    recentEvents,
    eventCounts,
    lastHeartbeat,
    clearEvents,
  };
}
```

### tRPC Router

The analytics API is implemented as a tRPC router with procedures for tracking different types of events:

```typescript
// src/lib/trpc/routers/analytics-router.ts
export const analyticsRouter = router({
  track: publicProcedure
    .input(AnalyticsEventSchema)
    .mutation(async ({ input, ctx }) => {
      // Store event in database
    }),
  
  trackPageView: publicProcedure
    .input(PageViewEventSchema)
    .mutation(async ({ input, ctx }) => {
      // Store page view in database
    }),
  
  // Other procedures...
});
```

## User Session Tracking

User sessions are tracked using a session ID stored in a cookie:

```typescript
// Get the current session ID from cookie or create a new one
const getSessionId = useCallback(() => {
  const existingSessionId = getCookie('tattoo_session_id');

  if (existingSessionId) {
    return existingSessionId as string;
  }

  const newSessionId = uuidv4();

  // Set session ID cookie, expires in 30 minutes
  setCookie('tattoo_session_id', newSessionId, {
    maxAge: 30 * 60, // 30 minutes
    path: '/',
  });

  return newSessionId;
}, []);
```

## Error Tracking

The system automatically captures client-side errors:

```typescript
// Set up global error tracking
useEffect(() => {
  if (typeof window !== 'undefined') {
    const originalOnError = window.onerror;

    // Handle global errors
    window.onerror = (message, source, lineno, colno, error) => {
      // Track the error
      analytics.trackError({
        errorMessage: message.toString(),
        errorStack: error?.stack,
        severity: 'medium',
        timestamp: undefined,
      });

      // Additional error handling...
    };

    // Handle promise rejections
    // ...
  }
}, [analytics]);
```

## Dashboard Implementation

The real-time dashboard displays:

1. Active users
2. Page views
3. Conversion rates
4. Booking requests
5. Recent events stream

This is implemented with the `RealtimeStatUpdater` component and uses the `useLiveAnalytics` hook to connect to the SSE stream.

## Extending the System

To track new types of events:

1. Add the event type to `EventCategory` enum in `analytics-types.ts`
2. Create an interface for the event extending `BaseEventType`
3. Add a Zod schema for validation
4. Add a tracking method to the `useAnalytics` hook
5. Add a tRPC procedure in the analytics router

## Best Practices

1. **Performance**: Minimize tracking frequency to avoid performance impact
2. **Privacy**: Do not track personally identifiable information without consent
3. **Security**: Validate all inputs before storing
4. **Cleanup**: Implement data retention policies
5. **Error Handling**: Gracefully handle tracking failures to avoid breaking the UI