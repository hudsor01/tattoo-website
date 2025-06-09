'use client';

import { useCallback } from 'react';
import { Booker } from '@calcom/atoms';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

// Import types from the actual @calcom/atoms package structure
type BookerProps = Parameters<typeof Booker>[0];

// Props for our custom Booker wrapper component
interface CustomBookerProps {
  username: string; // Cal.com username
  eventSlug: string;

  // Callback props - using any for now as the exact types are complex
  onCreateBookingSuccess?: (data: any) => void | Promise<void>;
  onCreateBookingError?: (error: any) => void | Promise<void>;

  // Styling
  className?: string;

  // Passthrough props for @calcom/atoms Booker component
  defaultFormValues?: BookerProps extends { defaultFormValues?: infer T } ? T : never;
  view?: BookerProps extends { view?: infer T } ? T : never;
  metadata?: BookerProps extends { metadata?: infer T } ? T : never;
}

export default function CalAtomsBooker({
  username,
  eventSlug,
  onCreateBookingSuccess,
  onCreateBookingError,
  className = '',
  // Destructure passthrough props
  defaultFormValues,
  view,
  metadata,
}: CustomBookerProps) {
  const handleBookingSuccessful = useCallback(
    (calSuccessData: any) => {
      logger.info('Booking created successfully (via @calcom/atoms/Booker):', calSuccessData);
      if (onCreateBookingSuccess) {
        void onCreateBookingSuccess(calSuccessData);
      } else {
        toast.success('Booking successful!');
      }
    },
    [onCreateBookingSuccess]
  );

  const handleBookingError = useCallback(
    (calErrorData: any) => {
      logger.error('Booking creation failed (via @calcom/atoms/Booker):', calErrorData);
      const errorMessage = calErrorData instanceof Error 
        ? calErrorData.message 
        : calErrorData?.error?.message ?? calErrorData?.message ?? 'Unknown booking error';
      if (onCreateBookingError) {
        void onCreateBookingError(calErrorData);
      } else {
        toast.error(errorMessage);
      }
    },
    [onCreateBookingError]
  );

  // Construct the props object for the @calcom/atoms Booker component.
  const bookerPropsForAtom: BookerProps = {
    username: username,
    eventSlug: eventSlug,
    isTeamEvent: false,

    // Callbacks expected by @calcom/atoms Booker
    onCreateBookingSuccess: handleBookingSuccessful,
    onCreateBookingError: handleBookingError,

    // Pass through other supported props
    ...(defaultFormValues && { defaultFormValues }),
    ...(view && { view }),
    ...(metadata && { metadata }),
  };

  return (
    <Card className={`cal-atoms-booker-wrapper ${className}`}>
      <CardContent className='p-4'>
        <Booker
          {...bookerPropsForAtom}
        />
      </CardContent>
    </Card>
  );
}
