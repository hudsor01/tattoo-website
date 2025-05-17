/**
 * Gallery Subscription Hook
 *
 * Custom hook for receiving real-time updates when gallery designs change.
 * Integrates with tRPC subscriptions to provide live updates.
 */
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { usePublicDesigns } from './use-gallery';
import { useToast } from '@/hooks/use-toast';

export interface GalleryEvent {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'approved';
  data: unknown;
  timestamp: Date;
}

export function useGallerySubscription(enabled = false) {
  const toast = useToast();
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<GalleryEvent | null>(null);
  const [hasNewDesigns, setHasNewDesigns] = useState(false);
  const { refetch } = usePublicDesigns();
  const utils = trpc.useUtils();

  // Subscribe to gallery events
  trpc.subscription.galleryEvents.useSubscription(undefined, {
    enabled,
    onData: data => {
      // Create event with timestamp
      const event: GalleryEvent = {
        ...data,
        timestamp: new Date(),
      };

      // Update latest event
      setLatestEvent(event);

      // Add to events list
      setEvents(prev => [event, ...prev].slice(0, 20));

      // If we have a new or approved design, mark for refresh
      if (event.type === 'created' || event.type === 'approved') {
        setHasNewDesigns(true);

        // Show toast notification
        toast(
          event.type === 'created'
            ? 'New design added to gallery'
            : 'Design was approved and published',
          {
            description: `${event.data.name} by ${event.data.artistName || 'Artist'}`,
            action: {
              label: 'View',
              onClick: () => {
                // Navigate to design detail page
                window.location.href = `/gallery/${event.data.id}`;
              },
            },
          },
        );

        // Invalidate the gallery queries to trigger a refresh
        utils.gallery.getPublicDesigns.invalidate();
      }
    },
    onError: err => {
      console.error('Gallery subscription error:', err);
    },
  });

  // Function to refresh designs when new ones are available
  const refreshDesigns = () => {
    if (hasNewDesigns) {
      refetch();
      setHasNewDesigns(false);
    }
  };

  // Add cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up state to prevent memory leaks
      setEvents([]);
      setLatestEvent(null);
      setHasNewDesigns(false);
    };
  }, []);

  return {
    events,
    latestEvent,
    hasNewDesigns,
    refreshDesigns,
  };
}
