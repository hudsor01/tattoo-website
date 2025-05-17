/**
 * Subscription Hooks
 * 
 * This file provides custom React hooks for real-time subscriptions using tRPC.
 * These hooks provide an easy-to-use interface for components to subscribe to
 * real-time updates from the server.
 */
import { trpc } from '@/lib/trpc/client';
import { useEffect, useState } from 'react';
import type { RouterOutputs } from '@/lib/trpc/types';

// Types
type BookingEvent = RouterOutputs['subscription']['bookingEvents'];
type AppointmentEvent = RouterOutputs['subscription']['appointmentEvents'];
type CustomerEvent = RouterOutputs['subscription']['customerEvents'];
type DashboardActivityEvent = RouterOutputs['subscription']['dashboardActivity'];

/**
 * Hook for subscribing to booking events
 */
export function useBookingSubscription(artistId?: string) {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<BookingEvent | null>(null);
  
  // Subscribe to booking events
  const subscription = trpc.subscription.bookingEvents.useSubscription(
    { artistId },
    {
      enabled: true,
      onData: (data) => {
        // Update latest event
        setLatestEvent(data);
        
        // Add to events list with timestamp
        setEvents((prev) => [data, ...prev].slice(0, 50));
      },
      onError: (err) => {
        console.error('Subscription error:', err);
      },
    }
  );
  
  // Provide a clean interface for components
  return {
    isLoading: subscription.isLoading,
    events,
    latestEvent,
    clearEvents: () => setEvents([]),
  };
}

/**
 * Hook for subscribing to appointment events
 */
export function useAppointmentSubscription(options?: { artistId?: string; customerId?: string }) {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<AppointmentEvent | null>(null);
  
  // Subscribe to appointment events
  const subscription = trpc.subscription.appointmentEvents.useSubscription(
    options || {},
    {
      enabled: true,
      onData: (data) => {
        // Update latest event
        setLatestEvent(data);
        
        // Add to events list with timestamp
        setEvents((prev) => [data, ...prev].slice(0, 50));
      },
      onError: (err) => {
        console.error('Subscription error:', err);
      },
    }
  );
  
  // Provide a clean interface for components
  return {
    isLoading: subscription.isLoading,
    events,
    latestEvent,
    clearEvents: () => setEvents([]),
  };
}

/**
 * Hook for subscribing to customer events (admin only)
 */
export function useCustomerSubscription(customerId?: string) {
  const [events, setEvents] = useState<CustomerEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<CustomerEvent | null>(null);
  
  // Subscribe to customer events
  const subscription = trpc.subscription.customerEvents.useSubscription(
    { customerId },
    {
      enabled: true,
      onData: (data) => {
        // Update latest event
        setLatestEvent(data);
        
        // Add to events list with timestamp
        setEvents((prev) => [data, ...prev].slice(0, 50));
      },
      onError: (err) => {
        console.error('Subscription error:', err);
      },
    }
  );
  
  // Provide a clean interface for components
  return {
    isLoading: subscription.isLoading,
    events,
    latestEvent,
    clearEvents: () => setEvents([]),
  };
}

/**
 * Hook for dashboard activity stream (admin only)
 * This combines all event types into a single activity stream
 */
export function useDashboardActivity() {
  const [activities, setActivities] = useState<DashboardActivityEvent[]>([]);
  
  // Subscribe to dashboard activity
  const subscription = trpc.subscription.dashboardActivity.useSubscription(
    undefined,
    {
      enabled: true,
      onData: (data) => {
        // Add to activities list, keeping the 100 most recent
        setActivities((prev) => [data, ...prev].slice(0, 100));
      },
      onError: (err) => {
        console.error('Dashboard subscription error:', err);
      },
    }
  );
  
  // Clear old activities after a certain time period
  useEffect(() => {
    const interval = setInterval(() => {
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
      
      setActivities((prev) => 
        prev.filter((activity) => new Date(activity.timestamp) > sixHoursAgo)
      );
    }, 1000 * 60 * 10); // Check every 10 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  // Provide a clean interface for components
  return {
    isLoading: subscription.isLoading,
    activities,
    clearActivities: () => setActivities([]),
  };
}
