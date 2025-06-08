'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logger";

interface BookerProps {
  eventTypeSlug: string;
  calUsername: string;
  onBookingSuccess?: () => void | Promise<void>;
  onBookingCancelled?: () => void | Promise<void>;
  onBookingRescheduled?: () => void | Promise<void>;
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'month_view' | 'week_view' | 'column_view';
  className?: string;
  hideEventTypeDetails?: boolean;
  prefill?: Record<string, unknown>;
}

interface CalApiError {
  type: 'EMBED_LOAD_ERROR' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
  details?: unknown;
}

export default function CalAtomsBooker({ 
  eventTypeSlug, 
  calUsername, 
  theme = 'auto',
  className = '',
  hideEventTypeDetails = false,
}: BookerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CalApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const maxRetries = 3;

  const initializeCalEmbed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simple initialization - just start loading the iframe
      void logger.warn('Cal.com provider initialized in simple mode');
      
      // Set a timeout to remove loading state
      setTimeout(() => {
        setIsInitialized(true);
        setIsLoading(false);
      }, 2000);
      
    } catch (error: unknown) {
      void logger.error('Cal.com embed initialization failed:', error);
      
      setError({
        type: 'EMBED_LOAD_ERROR',
        message: 'Failed to initialize booking system',
        details: error
      });
      setIsLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      void initializeCalEmbed();
    }
  }, [retryCount, maxRetries, initializeCalEmbed]);

  useEffect(() => {
    void initializeCalEmbed();
  }, [initializeCalEmbed]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-fernando-orange" />
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-medium">Loading booking calendar...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare your booking experience
            </p>
          </div>
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Retry attempt {retryCount} of {maxRetries}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-4">
              <div>
                <strong>Booking System Error</strong>
                <p className="mt-1">{error.message}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {retryCount < maxRetries ? (
                  <Button 
                    onClick={handleRetry}
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Try Again</span>
                  </Button>
                ) : (
                  <div className="text-sm space-y-2">
                    <p>Maximum retry attempts reached.</p>
                    <p>Please try one of these alternatives:</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button asChild variant="outline" size="sm">
                        <a href="/contact">Contact Us Directly</a>
                      </Button>
                      <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline" 
                        size="sm"
                      >
                        Refresh Page
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Main embed component - try direct Cal.com link approach first
  const directCalLink = `https://cal.com/${calUsername}/${eventTypeSlug}`;
  
  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full min-h-[600px] md:min-h-[700px]">
        {/* Show loading overlay until embed is fully ready */}
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-fernando-orange" />
              <span className="text-sm text-muted-foreground">Initializing calendar...</span>
            </div>
          </div>
        )}
        
        {/* Direct Cal.com iframe embed */}
        <iframe
          src={`${directCalLink}?embed=true&theme=${theme}&hideEventTypeDetails=${hideEventTypeDetails}`}
          style={{
            width: "100%",
            height: "600px",
            border: "none",
            borderRadius: "8px"
          }}
          onLoad={() => {
            setIsInitialized(true);
            setIsLoading(false);
            setError(null);
            void logger.warn('Cal.com iframe loaded successfully');
          }}
          onError={() => {
            setError({
              type: 'EMBED_LOAD_ERROR',
              message: 'Failed to load Cal.com booking calendar',
              details: 'Iframe failed to load'
            });
            setIsLoading(false);
          }}
        />
      </div>
    </div>
  );
}
