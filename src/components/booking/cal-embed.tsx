/**
 * Cal.com Embed Component
 * 
 * Purpose: Embed Cal.com booking calendar via iframe
 * Rendering: CSR for dynamic calendar loading
 * Dependencies: Cal.com account configuration
 * 
 * Trade-offs:
 * - Iframe vs API: Simpler implementation but less control
 * - Fixed height vs dynamic: Better UX but requires specific height
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon } from 'lucide-react';
import { ENV } from '@/lib/utils/env';
import { logger } from "@/lib/logger";

interface CalEmbedConfig {
  theme?: 'light' | 'dark';
  hideEventTypeDetails?: boolean;
  layout?: 'month_view' | 'week_view' | 'day_view';
  brandColor?: string;
}

interface CalEmbedProps {
  calLink?: string;
  eventTypeSlug?: string;
  prefillData?: Record<string, string>;
  className?: string;
  config?: CalEmbedConfig;
  height?: string;
}

/**
 * Component to embed Cal.com booking directly in the application
 */
export function CalEmbed({ 
  calLink,
  eventTypeSlug, 
  prefillData, 
  className = '',
  config = {},
  height = '800px'
}: CalEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [bookingUrl, setBookingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let url: string;
      
      if (calLink) {
        // Direct cal link provided
        url = `https://cal.com/${calLink}`;
      } else if (eventTypeSlug) {
        // Build from username and event type
        const username = ENV.NEXT_PUBLIC_CAL_USERNAME;
        
        if (!username) {
          setError('Cal.com integration is not properly configured');
          setIsLoading(false);
          return;
        }
        
        url = `https://cal.com/${username}/${eventTypeSlug}`;
      } else {
        // Default to main booking page
        const username = ENV.NEXT_PUBLIC_CAL_USERNAME;
        
        if (!username) {
          setError('Cal.com integration is not properly configured');
          setIsLoading(false);
          return;
        }
        
        url = `https://cal.com/${username}`;
      }

      // Add query parameters for config
      const params = new URLSearchParams();
      
      if (config.theme) {
        params.append('theme', config.theme);
      }
      if (config.hideEventTypeDetails !== undefined) {
        params.append('hide-event-type-details', String(config.hideEventTypeDetails));
      }
      if (config.layout) {
        params.append('layout', config.layout);
      }
      if (config.brandColor) {
        params.append('brand-color', config.brandColor);
      }
      
      // Add prefill data
      if (prefillData) {
        Object.entries(prefillData).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      // Append params to URL
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      setBookingUrl(url);
      setIsLoading(false);
    } catch (err) {
      setError('Error creating Cal.com booking link');
      logger.error('CalEmbed error:', err);
      setIsLoading(false);
    }
  }, [calLink, eventTypeSlug, prefillData, config]);

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-gray-400 animate-pulse" />
          <h3 className="text-lg font-medium">Loading Calendar...</h3>
        </div>
        <Skeleton className={`w-full`} style={{ height }} />
      </Card>
    );
  }

  if (error || !bookingUrl) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-medium text-red-500">Calendar Error</h3>
        </div>
        <div className="p-4 text-center">
          <p className="text-gray-600">{error ?? 'Unable to load booking calendar'}</p>
          <p className="text-sm text-gray-500 mt-2">
            Please contact us directly to schedule your appointment.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`cal-embed-container ${className}`}>
      <iframe
        src={bookingUrl}
        width="100%"
        height={height}
        frameBorder="0"
        title="Cal.com Booking Calendar"
        className="rounded-lg shadow-md bg-white dark:bg-gray-800"
        allow="camera; microphone; autoplay; encrypted-media; fullscreen;"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

/**
 * Preconfigured component for tattoo consultation booking
 */
export function TattooConsultationBooking({
  prefillData,
}: {
  prefillData?: Record<string, string>;
}) {
  return (
    <CalEmbed 
      eventTypeSlug="consultation" 
      prefillData={prefillData ?? {}} 
      className="mt-6"
      config={{
        theme: 'dark',
        hideEventTypeDetails: false,
      }}
    />
  );
}

/**
 * Preconfigured component for tattoo appointment booking
 */
export function TattooAppointmentBooking({
  prefillData,
}: {
  prefillData?: Record<string, string>;
}) {
  return (
    <CalEmbed 
      eventTypeSlug="tattoo-session" 
      prefillData={prefillData ?? {}} 
      className="mt-6"
      config={{
        theme: 'dark',
        hideEventTypeDetails: false,
      }}
    />
  );
}