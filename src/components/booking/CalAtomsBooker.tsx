'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

// Cal.com Embed Component using iframe
function CalEmbed({ username, eventSlug, view, defaultFormValues, metadata, className }: {
  username: string;
  eventSlug: string;
  view?: string;
  defaultFormValues?: any;
  metadata?: any;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Cal.com inline embed script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      (function (C, A, L) { 
        let p = function (a, ar) { 
          a.q.push(ar); 
        }; 
        let d = C.document; 
        C.Cal = C.Cal || function () { 
          let cal = C.Cal; 
          let ar = arguments; 
          if (!cal.loaded) { 
            cal.q = cal.q || []; 
            p(cal, ar); 
            return; 
          } 
        }; 
        C.Cal.ns = {}; 
        C.Cal.q = C.Cal.q || []; 
        d.head.appendChild(d.createElement("script")).src = A; 
        C.Cal.loaded = true; 
      })(window, "https://app.cal.com/embed/embed.js");
      
      Cal("init", { origin: "https://cal.com" });
      Cal("inline", {
        elementOrSelector: "#cal-booking-${eventSlug}",
        calLink: "${username}/${eventSlug}",
        layout: "month_view"
      });
    `;
    
    document.head.appendChild(script);
    
    // Set loading to false after a delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.head.removeChild(script);
    };
  }, [username, eventSlug]);

  return (
    <div className={`cal-embed-container min-h-[600px] ${className}`}>
      {isLoading && (
        <div className="min-h-[600px] w-full rounded-lg bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Cal.com booking system...</p>
          </div>
        </div>
      )}
      <div 
        id={`cal-booking-${eventSlug}`}
        style={{ 
          width: '100%', 
          height: '600px', 
          overflow: 'scroll',
          display: isLoading ? 'none' : 'block'
        }}
      />
    </div>
  );
}

// Cal.com Atoms compatible types
interface BookingResponse {
  id: string;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees?: Array<{
    name: string;
    email: string;
  }>;
}

interface ApiSuccessResponse<T = unknown> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  error: {
    message?: string;
    code?: string;
    details?: string | object | string[];
  };
}

interface BookerProps {
  // Required props
  username: string;
  eventSlug: string;
  
  // Optional customization props
  view?: 'MONTH_VIEW' | 'WEEK_VIEW' | 'COLUMN_VIEW';
  hideBranding?: boolean;
  isTeamEvent?: boolean;
  teamId?: number;
  
  // Form defaults
  defaultFormValues?: {
    name?: string;
    email?: string;
    guests?: string[];
    notes?: string;
  };
  
  // Metadata
  metadata?: Record<string, string>;
  
  // Callback props
  onCreateBookingSuccess?: (data: ApiSuccessResponse<BookingResponse>) => void | Promise<void>;
  onCreateBookingError?: (error: ApiErrorResponse | Error) => void | Promise<void>;
  
  // Styling
  className?: string;
}

export default function CalAtomsBooker({ 
  username,
  eventSlug,
  view = 'MONTH_VIEW',
  hideBranding = true,
  isTeamEvent = false,
  teamId,
  defaultFormValues,
  metadata,
  onCreateBookingSuccess,
  onCreateBookingError,
  className = ''
}: BookerProps) {
  // Handle booking success
  const handleBookingSuccess = useCallback((data: ApiSuccessResponse<BookingResponse>) => {
    logger.info('Booking created successfully:', data);
    
    if (onCreateBookingSuccess) {
      void onCreateBookingSuccess(data);
    } else {
      // Default success handling - redirect to gallery with success message
      const booking = data.data;
      const params = new URLSearchParams({
        booking_success: 'true',
        booking_id: booking.id || 'unknown',
        event_title: booking.title || 'consultation'
      });
      window.location.href = `/gallery?${params.toString()}`;
    }
  }, [onCreateBookingSuccess]);

  // Handle booking error
  const handleBookingError = useCallback((error: ApiErrorResponse | Error) => {
    logger.error('Booking creation failed:', error);
    
    if (onCreateBookingError) {
      void onCreateBookingError(error);
    } else {
      // Default error handling - show error message
      let errorMessage = 'An error occurred while booking your appointment';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if ('error' in error && error.error) {
        errorMessage = error.error.message ?? errorMessage;
      }
      
      // Show user-friendly error with toast
      toast.error(`Booking failed: ${errorMessage}`, {
        description: 'Please try again or contact us directly.',
        action: {
          label: 'Contact Support',
          onClick: () => window.location.href = '/contact'
        }
      });
    }
  }, [onCreateBookingError]);

  try {
    return (
      <CalEmbed
        username={username}
        eventSlug={eventSlug}
        view={view}
        defaultFormValues={defaultFormValues}
        metadata={metadata}
        className={className}
      />
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
