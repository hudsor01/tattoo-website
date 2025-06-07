/**
 * Book Now Button Component
 * 
 * Purpose: Consistent booking CTA button across the site
 * Features: Analytics tracking, loading states, variants, modal support
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackBusinessEvent } from '@/components/providers/AnalyticsProvider';
import dynamic from 'next/dynamic';

// Cal.com Atoms removed - using direct Cal.com links for reliability

interface BookNowButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  eventSlug?: string;
  serviceId?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  designName?: string; // For tracking which design was booked
  forcePageNavigation?: boolean; // Force navigation to /booking page instead of modal
  useModal?: boolean; // Use modal instead of page navigation (default: false for backward compatibility)
}

export function BookNowButton({
  variant = 'default',
  size = 'default',
  className,
  children = 'Book Now',
  eventSlug,
  serviceId,
  showIcon = true,
  fullWidth = false,
  onClick,
  designName,
  forcePageNavigation = false,
  useModal = false,
}: BookNowButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    
    // Track the booking intent
    trackBusinessEvent.appointmentstarted();
    
    // Call custom onClick if provided
    onClick?.();
    
    if (useModal && !forcePageNavigation) {
      // Open booking modal
      setBookingModalOpen(true);
      setIsLoading(false);
    } else {
      // Build the booking URL with query parameters
      const params = new URLSearchParams();
      if (eventSlug) params.set('event', eventSlug);
      if (serviceId) params.set('service', serviceId);
      if (designName) params.set('design', designName);
      
      // Use dedicated consultation page for better UX
      const bookingUrl = designName 
        ? `/book-consultation?design=${encodeURIComponent(designName)}`
        : params.toString() 
          ? `/booking?${params.toString()}`
          : '/booking';
      
      // Navigate to booking page
      router.push(bookingUrl);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          'group relative overflow-hidden transition-all duration-300',
          fullWidth && 'w-full',
          variant === 'default' && 'bg-fernando-gradient hover:bg-fernando-gradient-hover',
          className
        )}
        onClick={handleClick}
        disabled={isLoading}
      >
        {/* Gradient overlay on hover */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {/* Button content */}
        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              {showIcon && <Calendar className="h-4 w-4" />}
              <span>{children}</span>
            </>
          )}
        </span>
      </Button>

      {/* Booking Modal - Always render, control with open prop */}
      <Dialog open={useModal && bookingModalOpen} onOpenChange={setBookingModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    Book Your Tattoo Appointment
                  </DialogTitle>
                  {designName && (
                    <p className="text-muted-foreground mt-1">
                      Consultation for: <span className="font-medium">{designName}</span>
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBookingModalOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="mt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Click below to open our secure booking calendar
              </p>
              <Button asChild size="lg" className="w-full">
                <a 
                  href={`https://cal.com/ink37tattoos/consultation${designName ? `?description=Interested in: ${encodeURIComponent(designName)}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Open Booking Calendar
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
}

// Floating Book Now Button for mobile
export function FloatingBookNowButton() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 md:hidden transition-all duration-300 transform',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      )}
    >
      <BookNowButton
        size="lg"
        className="shadow-lg shadow-red-600/20 animate-pulse-slow"
        showIcon={true}
      >
        Book Now
      </BookNowButton>
    </div>
  );
}
