'use client';

import { useEffect } from 'react';
import { useLiveAnalytics } from '@/hooks/use-live-analytics';
import { AnalyticsStreamEvents } from '@/lib/routers/analytics-router/live-updates';
import { EventCategory } from '@/lib/trpc/routers/types';
import { useToast } from '@/hooks/use-toast';
import { Activity, ShoppingCart, AlertTriangle, Eye } from 'lucide-react';

/**
 * Component that displays toast notifications for important analytics events
 * This helps administrators stay aware of significant events without actively monitoring
 */
export function AnalyticsNotifier() {
  const toast = useToast();
  // Connect to live updates stream
  const { isConnected, recentEvents } = useLiveAnalytics({
    autoConnect: true,
    bufferSize: 10, // Keep a reasonable buffer for notification logic
  });

  // Get event icon based on category
  const getEventIcon = (category: string) => {
    switch (category) {
      case EventCategory.CONVERSION:
        return ShoppingCart;
      case EventCategory.ERROR:
        return AlertTriangle;
      case EventCategory.PAGE_VIEW:
        return Eye;
      default:
        return Activity;
    }
  };

  // Handle incoming events for notifications
  useEffect(() => {
    if (!isConnected || recentEvents.length === 0) {
      return;
    }

    // Get the most recent event
    const latestEvent = recentEvents[0];

    // Only process new events
    if (latestEvent.type === AnalyticsStreamEvents.NEW_EVENT) {
      const analyticsEvent = latestEvent.data;

      // Determine if this event should trigger a notification
      let shouldNotify = false;
      let notificationTitle = '';
      let notificationDescription = '';
      let notificationType: 'default' | 'success' | 'error' | 'info' = 'default';
      let Icon: unknown = Activity;

      // Show notifications for all conversion events
      if (analyticsEvent.category === EventCategory.CONVERSION) {
        shouldNotify = true;
        Icon = ShoppingCart;
        notificationTitle = 'New Conversion';
        notificationDescription = `${analyticsEvent.action}: ${analyticsEvent.label || ''}`;
        notificationType = 'success';
      }

      // Show notifications for all error events
      if (analyticsEvent.category === EventCategory.ERROR) {
        shouldNotify = true;
        Icon = AlertTriangle;
        notificationTitle = 'Error Detected';
        notificationDescription = analyticsEvent.errorMessage || analyticsEvent.action;
        notificationType = 'error';
      }

      // For important booking events
      if (
        analyticsEvent.category === EventCategory.BOOKING &&
        analyticsEvent.action === 'complete'
      ) {
        shouldNotify = true;
        Icon = Activity;
        notificationTitle = 'Booking Completed';
        notificationDescription = `New booking: ${analyticsEvent.serviceName || 'Service'}`;
        notificationType = 'success';
      }

      // Display the notification if needed
      if (shouldNotify) {
        switch (notificationType) {
          case 'success':
            toast.success(notificationDescription, {
              icon: <Icon className="h-4 w-4" />,
              description: analyticsEvent.path ? `Path: ${analyticsEvent.path}` : undefined,
            });
            break;
          case 'error':
            toast.error(notificationDescription, {
              icon: <Icon className="h-4 w-4" />,
              description: analyticsEvent.path ? `Path: ${analyticsEvent.path}` : undefined,
            });
            break;
          case 'info':
            toast.info(notificationDescription, {
              icon: <Icon className="h-4 w-4" />,
              description: analyticsEvent.path ? `Path: ${analyticsEvent.path}` : undefined,
            });
            break;
          default:
            toast(notificationDescription, {
              icon: <Icon className="h-4 w-4" />,
              description: analyticsEvent.path ? `Path: ${analyticsEvent.path}` : undefined,
            });
        }
      }
    }
  }, [recentEvents, isConnected]);

  // This component doesn't render anything - it just manages notifications
  return null;
}