'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/error/error-boundary';
import dynamic from 'next/dynamic';

// Dynamically import CalAtomsBooker to prevent SSR issues with Cal.com Atoms
const CalAtomsBooker = dynamic(
  () => import('@/components/booking/CalAtomsBooker'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[600px] w-full rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking calendar...</p>
        </div>
      </div>
    )
  }
);

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

          {/* Consultation Details Header - Centered over Cal.com Booker width */}
          <div className="w-full max-w-[1000px] mx-auto mb-8">
            <h1 className="text-4xl font-bold text-center mb-6 fernando-gradient">Consultation Details</h1>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Left Column - Centered Content */}
                <div className="flex justify-center px-4">
                  <ul className="text-muted-foreground space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>30-60 minutes duration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Free consultation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>In-person or video call</span>
                    </li>
                  </ul>
                </div>
                {/* Right Column - Centered Content */}
                <div className="flex justify-center px-4">
                  <ul className="text-muted-foreground space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Your design ideas and vision</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Size, placement, and style preferences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Pricing and timeline</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Any questions about the tattoo process</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Cal.com Atoms Booker Component */}
          <ErrorBoundary 
            fallback={
              <div className='rounded-lg shadow-lg overflow-hidden p-8 bg-destructive/10 text-center'>
                <h3 className='text-lg font-semibold mb-2'>Booking System Error</h3>
                <p className='text-muted-foreground mb-4'>Unable to load the booking calendar</p>
                <Button onClick={() => window.location.reload()}>Reload Page</Button>
              </div>
            }
          >
            <div className='w-full'>
              <CalAtomsBooker
                username='ink37tattoos'
                eventSlug='consultation'
                view='MONTH_VIEW'
                defaultFormValues={{
                  notes: designName ? `Interested in design: ${designName}` : 'Tattoo consultation request'
                }}
                metadata={{
                  source: 'website',
                  page: 'book-consultation',
                  designInterest: designName ?? 'general'
                }}
                onCreateBookingSuccess={(data) => {
                  // Custom success handling
                  const params = new URLSearchParams({
                    booking_success: 'true',
                    booking_id: data.data.id || 'unknown',
                    event_slug: 'consultation',
                    design_name: designName ?? ''
                  });
                  window.location.href = `/gallery?${params.toString()}`;
                }}
                onCreateBookingError={(error) => {
                  console.error('Booking failed:', error);
                  const errorMessage = error instanceof Error 
                    ? error.message 
                    : ('error' in error ? (error.error.message ?? 'Unknown error') : 'Unknown error');
                  console.error(`Booking failed: ${errorMessage}. Please try again or contact us directly.`);
                }}
                className='rounded-lg shadow-lg overflow-hidden'
              />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
