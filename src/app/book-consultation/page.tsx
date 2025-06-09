'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CalAtomsBooker, { CalBookerErrorFallback } from '@/components/booking/CalAtomsBooker';
import { ErrorBoundary } from '@/components/error/error-boundary';

export default function BookConsultationPage() {
  const searchParams = useSearchParams();
  const designName = searchParams.get('design');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/gallery">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Gallery
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 fernando-gradient">Book Your Tattoo Consultation</h1>
            {designName && (
              <p className="text-xl text-muted-foreground mb-4">
                Design: <span className="font-semibold text-foreground">{designName}</span>
              </p>
            )}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Schedule your consultation directly on the calendar below
            </p>
          </div>

          {/* Cal.com Atoms Booker Component */}
          <ErrorBoundary 
            fallback={<CalBookerErrorFallback className='rounded-lg shadow-lg overflow-hidden' error={new Error('Cal.com booking system error')} resetErrorBoundary={() => window.location.reload()} />}
          >
            <div className='w-full'>
              <CalAtomsBooker
                username='ink37tattoos'
                eventSlug='consultation'
                view='MONTH_VIEW'
                hideBranding={false}
                isTeamEvent={false}
                defaultFormValues={{
                  notes: designName ? `Interested in design: ${designName}` : 'Tattoo consultation request'
                }}
                metadata={{
                  source: 'website',
                  page: 'book-consultation',
                  designInterest: designName ?? 'general'
                }}
                onCreateBookingSuccess={(event) => {
                  // Custom success handling
                  const params = new URLSearchParams({
                    booking_success: 'true',
                    booking_id: event?.bookingId ?? event?.id ?? 'unknown',
                    event_slug: event?.eventSlug ?? event?.slug ?? 'consultation',
                    design_name: designName ?? ''
                  });
                  window.location.href = `/gallery?${params.toString()}`;
                }}
                onCreateBookingError={(event) => {
                  console.error('Booking failed:', event);
                  const errorMessage = event?.message ?? event?.error?.message ?? event?.error ?? 'Unknown error';
                  console.error(`Booking failed: ${errorMessage}. Please try again or contact us directly.`);
                }}
                className='rounded-lg shadow-lg overflow-hidden'
              />
            </div>
          </ErrorBoundary>

          {/* Booking Info */}
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Consultation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Duration</h4>
                <p className="text-muted-foreground">30-60 minutes</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Cost</h4>
                <p className="text-muted-foreground">Free consultation</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Location</h4>
                <p className="text-muted-foreground">In-person or video call</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">What we'll discuss:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your design ideas and vision</li>
                <li>• Size, placement, and style preferences</li>
                <li>• Pricing and timeline</li>
                <li>• Any questions about the tattoo process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
