/**
 * Submit Booking Button Component
 * 
 * Enhanced submit button for the booking form that includes analytics tracking.
 * Tracks when bookings are started and completed.
 */
'use client';

import { useEffect, useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useEventTracking } from '@/hooks/trpc/use-analytics';
import { useSearchParams } from 'next/navigation';

interface SubmitBookingButtonProps extends ButtonProps {
  isSubmitting: boolean;
  isValid: boolean;
  tattooType?: string;
  designId?: string;
}

export function SubmitBookingButton({
  isSubmitting,
  isValid,
  tattooType,
  designId,
  children,
  ...props
}: SubmitBookingButtonProps) {
  const { track } = useEventTracking();
  const searchParams = useSearchParams();
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  
  // Track booking started when component mounts
  useEffect(() => {
    if (!hasTrackedStart) {
      // Get design ID from URL if not provided as prop
      const urlDesignId = searchParams?.get('designId') || designId;
      
      // Track booking started event
      track('booking_started', urlDesignId, {
        source: urlDesignId ? 'gallery' : 'direct',
        tattooType: tattooType || 'unknown',
      });
      
      setHasTrackedStart(true);
    }
  }, [hasTrackedStart, searchParams, designId, tattooType, track]);
  
  // Track booking completed when form is submitted
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isValid && !isSubmitting && props.onClick) {
      // Track completion before actual submit
      track('booking_completed', designId, {
        tattooType: tattooType || 'unknown',
      });
      
      // Call original onClick handler
      props.onClick(e);
    }
  };
  
  return (
    <Button
      type="submit"
      disabled={isSubmitting || !isValid || props.disabled}
      onClick={handleSubmit}
      {...props}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        children
      )}
    </Button>
  );
}