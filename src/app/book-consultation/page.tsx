'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CalAtomsBooker from '@/components/booking/CalAtomsBooker';
import { calConfig } from '@/lib/cal/config';

export default function BookConsultationPage() {
  const searchParams = useSearchParams();
  const designName = searchParams.get('design');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

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
              Schedule a free consultation to discuss your tattoo ideas and get a personalized quote
            </p>
          </div>

          {/* Main Content */}
          <div className="w-full">
            {/* Embedded Cal.com Calendar */}
            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Your Consultation</CardTitle>
                  <CardDescription>
                    Choose your preferred time with Fernando Govea
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Embedded Cal.com Calendar Widget */}
                  {calConfig.username ? (
                    <CalAtomsBooker
                      eventTypeSlug={calConfig.eventTypes.consultation}
                      calUsername={calConfig.username}
                      hideEventTypeDetails={true}
                      onBookingSuccess={async () => {
                        const redirectUrl = new URL('/gallery', window.location.origin);
                        redirectUrl.searchParams.set('booking', 'success');
                        
                        setTimeout(() => {
                          window.location.href = redirectUrl.toString();
                        }, 1500);
                      }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Booking system is currently being configured. Please contact us directly.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
