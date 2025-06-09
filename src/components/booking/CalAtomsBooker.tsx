'use client';

import { useCallback } from 'react';
import { Booker } from '@calcom/atoms';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

interface BookerProps {
  // Required props based on Cal.com Atoms documentation
  username: string;
  eventSlug: string;
  
  // Optional customization props
  view?: 'MONTH_VIEW' | 'WEEK_VIEW' | 'COLUMN_VIEW';
  hideBranding?: boolean;
  isTeamEvent?: boolean;
  teamId?: number; // Required when isTeamEvent is true
  defaultFormValues?: {
    name?: string;
    email?: string;
    guests?: string[];
    notes?: string;
  };
  metadata?: Record<string, string>;
  
  // Callback props
  onCreateBookingSuccess?: (event: any) => void | Promise<void>;
  onCreateBookingError?: (event: any) => void | Promise<void>;
  
  // Component props
  className?: string;
  customClassNames?: {
    bookerContainer?: string;
    eventMetaCustomClassNames?: {
      eventMetaContainer?: string;
      eventMetaTitle?: string;
      eventMetaTimezoneSelect?: string;
    };
    datePickerCustomClassNames?: {
      datePickerContainer?: string;
      datePickerTitle?: string;
      datePickerDays?: string;
      datePickerDate?: string;
      datePickerDatesActive?: string;
      datePickerToggle?: string;
    };
    availableTimeSlotsCustomClassNames?: {
      availableTimeSlotsContainer?: string;
      availableTimeSlotsHeaderContainer?: string;
      availableTimeSlotsTitle?: string;
      availableTimeSlotsTimeFormatToggle?: string;
      availableTimes?: string;
    };
    confirmStep?: {
      confirmButton?: string;
      backButton?: string;
    };
  };
}

export default function CalAtomsBooker({ 
  username,
  eventSlug,
  view = 'MONTH_VIEW',
  hideBranding = false,
  isTeamEvent = false,
  teamId,
  defaultFormValues,
  metadata,
  onCreateBookingSuccess,
  onCreateBookingError,
  className = '',
  customClassNames
}: BookerProps) {
  // Handle booking success
  const handleBookingSuccess = useCallback((event: any) => {
    logger.warn('Booking created successfully:', event);
    
    if (onCreateBookingSuccess) {
      void onCreateBookingSuccess(event);
    } else {
      // Default success handling - redirect to gallery with success message
      const params = new URLSearchParams({
        booking_success: 'true',
        booking_id: event?.bookingId ?? event?.id ?? 'unknown',
        event_slug: event?.eventSlug ?? event?.slug ?? 'consultation'
      });
      window.location.href = `/gallery?${params.toString()}`;
    }
  }, [onCreateBookingSuccess]);

  // Handle booking error
  const handleBookingError = useCallback((event: any) => {
    logger.error('Booking creation failed:', event);
    
    if (onCreateBookingError) {
      void onCreateBookingError(event);
    } else {
      // Default error handling - show error message
      const errorMessage = event?.message ?? event?.error?.message ?? event?.error ?? 'Unknown error';
      console.error(`Booking failed: ${errorMessage}`);
      // Could show a toast or alert here instead
    }
  }, [onCreateBookingError]);

  // Default custom class names for branding
  const defaultCustomClassNames = {
    bookerContainer: "border border-border rounded-lg overflow-hidden",
    eventMetaCustomClassNames: {
      eventMetaTitle: "text-foreground font-montserrat font-semibold",
    },
    datePickerCustomClassNames: {
      datePickerDatesActive: "!bg-primary text-primary-foreground",
    },
    availableTimeSlotsCustomClassNames: {
      availableTimeSlotsHeaderContainer: "bg-muted/50",
      availableTimes: "hover:bg-primary/10",
    },
    confirmStep: {
      confirmButton: "!bg-primary hover:!bg-primary/90 !text-primary-foreground",
      backButton: "text-muted-foreground hover:!bg-muted hover:!text-foreground"
    }
  };

  // Merge custom class names with defaults
  const finalCustomClassNames = customClassNames ? {
    ...defaultCustomClassNames,
    ...customClassNames,
    eventMetaCustomClassNames: {
      ...defaultCustomClassNames.eventMetaCustomClassNames,
      ...customClassNames.eventMetaCustomClassNames
    },
    datePickerCustomClassNames: {
      ...defaultCustomClassNames.datePickerCustomClassNames,
      ...customClassNames.datePickerCustomClassNames
    },
    availableTimeSlotsCustomClassNames: {
      ...defaultCustomClassNames.availableTimeSlotsCustomClassNames,
      ...customClassNames.availableTimeSlotsCustomClassNames
    },
    confirmStep: {
      ...defaultCustomClassNames.confirmStep,
      ...customClassNames.confirmStep
    }
  } : defaultCustomClassNames;

  try {
    return (
      <div className={`cal-atoms-booker-wrapper ${className}`}>
        {isTeamEvent && teamId ? (
          <Booker
            isTeamEvent={true}
            teamId={teamId}
            eventSlug={eventSlug}
            view={view}
            hideBranding={hideBranding}
            defaultFormValues={defaultFormValues}
            metadata={metadata}
            onCreateBookingSuccess={handleBookingSuccess}
            onCreateBookingError={handleBookingError}
            customClassNames={finalCustomClassNames}
          />
        ) : (
          <Booker
            username={username}
            eventSlug={eventSlug}
            view={view}
            hideBranding={hideBranding}
            isTeamEvent={false}
            defaultFormValues={defaultFormValues}
            metadata={metadata}
            onCreateBookingSuccess={handleBookingSuccess}
            onCreateBookingError={handleBookingError}
            customClassNames={finalCustomClassNames}
          />
        )}
      </div>
    );
  } catch (error) {
    logger.error('Failed to render Cal.com Atoms Booker:', error);
    
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-4">
              <div>
                <strong>Booking System Error</strong>
                <p className="mt-1">
                  There was an error loading the booking system. Please try refreshing the page.
                </p>
                {error instanceof Error && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    Error: {error.message}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/contact'}
                  variant="secondary" 
                  size="sm"
                >
                  Contact Support
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
}

// Error fallback component for the booking system
export function CalBookerErrorFallback({ 
  error, 
  resetErrorBoundary,
  className = ''
}: { 
  error: Error; 
  resetErrorBoundary: () => void;
  className?: string;
}) {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className='py-8'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='space-y-4'>
            <div>
              <strong>Booking System Error</strong>
              <p className='mt-1'>
                There was an error loading the booking system. Please try refreshing the page.
              </p>
              {error.message && (
                <p className='text-xs mt-2 text-muted-foreground'>
                  Error: {error.message}
                </p>
              )}
            </div>
            
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button 
                onClick={resetErrorBoundary}
                variant='outline' 
                size='sm'
                className='flex items-center space-x-2'
              >
                <RefreshCw className='h-4 w-4' />
                <span>Try Again</span>
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/contact'}
                variant='secondary' 
                size='sm'
              >
                Contact Support
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}