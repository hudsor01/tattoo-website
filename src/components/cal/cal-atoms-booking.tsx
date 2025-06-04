/**
 * Cal.com Atoms Booking Component
 * 
 * Purpose: Modern Cal.com integration using Cal Atoms for embedded booking
 * Assumptions: Cal.com Atoms configured, event types available
 * Dependencies: @calcom/atoms, analytics tracking
 * 
 * Trade-offs:
 * - Cal Atoms vs iframe: Better UX and customization vs simpler implementation
 * - Real-time analytics vs performance: Detailed tracking vs minimal overhead
 * - Comprehensive error handling vs code complexity
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Booker, type BookerProps } from '@calcom/atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calAnalyticsService } from '@/lib/analytics/cal-analytics-service';
import { cn } from '@/lib/utils';
import type { Prisma } from '@prisma/client';

// Cal service type using Prisma.GetPayload
type CalService = Prisma.CalEventTypeGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    description: true;
    duration: true;
    price: true;
  };
}>;

const TATTOO_SERVICES: CalService[] = [
  {
    id: 'consultation',
    name: 'Tattoo Consultation',
    description: 'Free 30-minute consultation to discuss your tattoo ideas and pricing',
    duration: 30,
    price: 0,
    currency: 'USD',
    calEventTypeId: 123, // Replace with actual Cal.com event type ID
    eventTypeSlug: 'tattoo-consultation',
    category: 'consultation' as const,
    isActive: true,
    requiresApproval: false,
    defaultMeetingType: 'IN_PERSON' as const,
    allowedMeetingTypes: ['IN_PERSON' as const],
    features: ['Free consultation', '30 minutes', 'Design discussion'],
  },
  {
    id: 'small-tattoo',
    name: 'Small Tattoo Session',
    description: 'Perfect for simple designs, text, or small symbols (2-4 hours)',
    duration: 180,
    price: 200,
    currency: 'USD',
    calEventTypeId: 124, // Replace with actual Cal.com event type ID
    eventTypeSlug: 'small-tattoo-session',
    category: 'tattoo' as const,
    requiresApproval: false,
    defaultMeetingType: 'IN_PERSON' as const,
    allowedMeetingTypes: ['IN_PERSON' as const],
    features: ['Simple designs', '2-4 hours', 'Text & symbols'],
    isActive: true,
  },
  {
    id: 'large-tattoo',
    name: 'Large Tattoo Session',
    description: 'For complex designs, sleeves, or detailed work (4-8 hours)',
    duration: 480,
    price: 500,
    currency: 'USD',
    calEventTypeId: 125, // Replace with actual Cal.com event type ID
    eventTypeSlug: 'large-tattoo-session',
    category: 'tattoo' as const,
    isActive: true,
    requiresApproval: false,
    defaultMeetingType: 'IN_PERSON' as const,
    allowedMeetingTypes: ['IN_PERSON' as const],
    features: ['Complex designs', '4-8 hours', 'Sleeves & detailed work'],
  },
  {
    id: 'coverup',
    name: 'Cover-up Session',
    description: 'Transform old tattoos into beautiful new artwork',
    duration: 360,
    price: 400,
    currency: 'USD',
    calEventTypeId: 126, // Replace with actual Cal.com event type ID
    eventTypeSlug: 'coverup-session',
    category: 'specialty' as const,
    isActive: true,
    requiresApproval: false,
    defaultMeetingType: 'IN_PERSON' as const,
    allowedMeetingTypes: ['IN_PERSON' as const],
    features: ['Cover-up expertise', '6 hours', 'Transform old tattoos'],
  },
];

// Component Props
interface CalAtomsBookingProps {
  selectedServiceId?: string;
  onServiceChange?: (service: CalService) => void;
  onappointmentsuccess?: (booking: unknown) => void;
  onBookingError?: (error: unknown) => void;
  className?: string;
  showServiceSelector?: boolean;
  username?: string; // Cal.com username
}

export function CalAtomsBooking({
  selectedServiceId,
  onServiceChange,
  onappointmentsuccess,
  onBookingError,
  className,
  showServiceSelector = true,
  username = process.env.NEXT_PUBLIC_CAL_USERNAME ?? 'ink37tattoos',
}: CalAtomsBookingProps) {
  const [selectedService, setSelectedService] = useState<CalService | null>(
    selectedServiceId ? TATTOO_SERVICES.find(s => s.id === selectedServiceId) ?? TATTOO_SERVICES[0] : TATTOO_SERVICES[0]
  );
  const [appointmentstate, setappointmentstate] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const { toast } = useToast();

  // Analytics tracking
  useEffect(() => {
    // Track booking flow started
    void calAnalyticsService.publishMetricsUpdate();
  }, []);

  // Handle service selection
  const handleServiceSelect = useCallback((service: CalService) => {
    setSelectedService(service);
    onServiceChange?.(service);
    setError(null);
    
    // Track service selection
  }, [onServiceChange]);

  // Handle successful booking
  const handleappointmentsuccess = useCallback(async (bookingData: unknown) => {
    setappointmentstate('success');
    
    try {
      // Track successful booking
      await fetch('/api/analytics/booking-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventTypeId: selectedService?.calEventTypeId,
          serviceName: selectedService?.name,
          bookingData,
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: 'Booking Confirmed!',
        description: `Your ${selectedService?.name} has been booked successfully.`,
        variant: 'default',
      });

      onappointmentsuccess?.(bookingData);
    } catch {
      // Error tracking booking success
    }
  }, [selectedService, sessionId, toast, onappointmentsuccess]);

  // Handle booking error
  const handleBookingError = useCallback(async (errorData: unknown) => {
    setappointmentstate('error');
    setError((errorData as { message?: string }).message ?? 'An error occurred during booking');
    
    try {
      // Track booking error
      await fetch('/api/analytics/booking-failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventTypeId: selectedService?.calEventTypeId,
          serviceName: selectedService?.name,
          error: errorData,
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: 'Booking Failed',
        description: (errorData as { message?: string }).message ?? 'Please try again or contact us for assistance.',
        variant: 'destructive',
      });

      onBookingError?.(errorData);
    } catch {
      // Error tracking booking failure
    }
  }, [selectedService, sessionId, toast, onBookingError]);

  // Cal.com Booker configuration
  const bookerProps: BookerProps = {
    eventSlug: selectedService?.eventTypeSlug ?? '',
    username,
    onappointmentsuccessful: handleappointmentsuccess,
    onBookingFailed: handleBookingError,
    theme: 'dark',
    brandColor: '#8B4513',
    hideEventTypeDetails: false,
    layout: 'month_view',
  };

  if (!selectedService) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No booking services available. Please contact us directly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Service Selection */}
      {showServiceSelector && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Choose Your Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TATTOO_SERVICES.filter(service => service.isActive).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedService.id === service.id}
                onSelect={() => handleServiceSelect(service)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected Service Details */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{selectedService.name}</CardTitle>
              <CardDescription className="mt-2">{selectedService.description}</CardDescription>
            </div>
            <div className="text-right">
              {selectedService.price > 0 ? (
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  ${selectedService.price}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-lg px-3 py-1 text-green-600">
                  Free
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {selectedService.duration} minutes
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Book online
            </div>
            {selectedService.price > 0 && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Payment required
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {appointmentstate === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Booking confirmed! Check your email for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Cal.com Booker */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="min-h-[600px]">
            <Booker {...bookerProps} />
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you're having trouble booking online, feel free to contact us directly.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="tel:+1234567890">Call Us</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/contact">Contact Form</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Service Card Component
interface ServiceCardProps {
  service: CalService;
  isSelected: boolean;
  onSelect: () => void;
}

function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg',
        isSelected
          ? 'ring-2 ring-primary bg-primary/5 shadow-md'
          : 'hover:shadow-md'
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base leading-tight">{service.name}</CardTitle>
          {service.price > 0 ? (
            <Badge variant="secondary" className="shrink-0">
              ${service.price}
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0 text-green-600">
              Free
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs mb-3 line-clamp-2">
          {service.description}
        </CardDescription>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {Math.floor(service.duration / 60)}h {service.duration % 60}m
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export for use in other components
export { TATTOO_SERVICES };