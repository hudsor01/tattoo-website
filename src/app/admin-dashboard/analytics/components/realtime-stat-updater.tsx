'use client';

import { useEffect } from 'react';
import { useLiveAnalytics } from '@/hooks/use-live-analytics';
import { trpc } from '@/lib/trpc';
import { AnalyticsStreamEvents } from '@/lib/routers/analytics-router/live-updates';

/**
 * Component that automatically refetches analytics data when relevant events occur
 * This allows the dashboard to stay up-to-date without manual refreshing
 */
import { type RealtimeStatUpdaterProps } from '@/types/component-types';

export function RealtimeStatUpdater({ dateRange }: RealtimeStatUpdaterProps) {
  // Get analytics query hooks
  const utils = trpc.useContext();

  // Connect to live updates stream with minimal options
  const { isConnected, recentEvents } = useLiveAnalytics({
    autoConnect: true,
    bufferSize: 5, // Only keep a small buffer since we just need events for triggering
  });

  // Set up effect to refetch data when specific events are received
  useEffect(() => {
    if (!isConnected || recentEvents.length === 0) {
      return;
    }

    // Get the most recent event
    const latestEvent = recentEvents[0];

    // Determine which queries to invalidate based on event type
    if (
      latestEvent.type === AnalyticsStreamEvents.NEW_EVENT ||
      latestEvent.type === AnalyticsStreamEvents.STATS_UPDATE
    ) {
      // Invalidate summary data to trigger refetch
      utils.analytics.getSummary.invalidate({
        startDate: dateRange.from,
        endDate: dateRange.to,
      });
    }

    // For booking events, invalidate booking funnel data
    if (
      latestEvent.type === AnalyticsStreamEvents.NEW_EVENT &&
      latestEvent.data?.category === 'booking'
    ) {
      utils.analytics.getBookingFunnel.invalidate({
        startDate: dateRange.from,
        endDate: dateRange.to,
      });
    }

    // For gallery events, invalidate top designs data
    if (
      latestEvent.type === AnalyticsStreamEvents.NEW_EVENT &&
      latestEvent.data?.category === 'gallery'
    ) {
      utils.analytics.getTopDesigns.invalidate();
    }

    // When designs change explicitly
    if (latestEvent.type === AnalyticsStreamEvents.TOP_DESIGNS_CHANGE) {
      utils.analytics.getTopDesigns.invalidate();
    }
  }, [recentEvents, utils, dateRange, isConnected]);

  // This component doesn't render anything - it just handles the data refetching
  return null;
}