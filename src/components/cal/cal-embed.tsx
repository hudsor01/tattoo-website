'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon } from 'lucide-react';

interface CalEmbedProps {
  eventTypeSlug: string;
  prefillData?: Record<string, string>;
  className?: string;
}

/**
 * Component to embed Cal.com booking directly in the application
 */
export function CalEmbed({ eventTypeSlug, prefillData, className = '' }: CalEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [calUsername, setCalUsername] = useState<string | null>(null);
  const [bookingUrl, setBookingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get Cal.com username from environment
    const username = process.env['NEXT_PUBLIC_CAL_USERNAME'];

    if (!username) {
      setError('Cal.com integration is not properly configured');
      setIsLoading(false);
      return;
    }

    setCalUsername(username);

    try {
      // Create booking link using the URL slug
      const link = `https://cal.com/${username}/${eventTypeSlug}`;
      setBookingUrl(link);
    } catch (err) {
      setError('Error creating Cal.com booking link');
      void console.error(err);
    }

    setIsLoading(false);
  }, [eventTypeSlug, prefillData]);

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium">Loading Calendar...</h3>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </Card>
    );
  }

  if (error || !calUsername || !bookingUrl) {
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
        height="800px"
        frameBorder="0"
        title="Cal.com Booking Calendar"
        className="rounded-lg shadow-md"
        allow="camera; microphone; autoplay; encrypted-media; fullscreen;"
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
  return <CalEmbed eventTypeSlug="consultation" prefillData={prefillData ?? {}} className="mt-6" />;
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
    <CalEmbed eventTypeSlug="tattoo-session" prefillData={prefillData ?? {}} className="mt-6" />
  );
}
