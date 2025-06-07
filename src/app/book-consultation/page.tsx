'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, ArrowLeft } from 'lucide-react';
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
            <h1 className="text-4xl font-bold mb-4">Book Your Tattoo Consultation</h1>
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Embedded Cal.com Calendar */}
            <div className="lg:col-span-2">
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
                      onBookingSuccess={async () => {
                        // Show success message and redirect to gallery with success indicator
                        const redirectUrl = new URL('/gallery', window.location.origin);
                        redirectUrl.searchParams.set('booking', 'success');
                        
                        // Add a small delay to ensure the booking is processed
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

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Artist Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fernando Govea</CardTitle>
                  <CardDescription>Professional Tattoo Artist</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="text-sm">
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">Dallas/Fort Worth Area</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="text-sm">
                      <p className="font-medium">Consultation</p>
                      <p className="text-muted-foreground">30 minutes • Free</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Design Discussion</p>
                    <p className="text-muted-foreground">
                      Review your ideas, placement, and style preferences
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Pricing Quote</p>
                    <p className="text-muted-foreground">
                      Get a detailed quote for your custom piece
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Next Steps</p>
                    <p className="text-muted-foreground">
                      Schedule your tattoo session if you decide to proceed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}