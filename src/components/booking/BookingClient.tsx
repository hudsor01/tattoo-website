/**
 * Booking Client Component
 * 
 * Purpose: Client-side booking component with Cal.com Atoms integration
 * Features: Modern Cal.com Atoms booker with custom styling and authentication
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import Cal.com Atoms Booker to avoid SSR issues
const CalAtomsBooker = dynamic(
  () => import('./CalAtomsBooker'),
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

// Simple booking form component
function BookingForm() {
  return (
    <div className="min-h-[600px] w-full rounded-lg overflow-hidden">
      <CalAtomsBooker
        username="ink37tattoos"
        eventSlug="consultation"
      />
    </div>
  );
}

export default function BookingClient() {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Book Your Tattoo Session</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your service and book your appointment with Ink 37 Tattoos
            </p>
          </div>

          {/* Main Booking Area */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cal.com Atoms Booker */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Book: Free Consultation</CardTitle>
                  <CardDescription>Discuss your tattoo ideas and get a quote</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Cal.com Atoms Booker */}
                  <BookingForm />
                  
                  {/* Alternative Booking Methods */}
                  <div className="pt-4 border-t mt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Having trouble? You can also:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://cal.com/ink37tattoos/tattoo-consultation" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Open in Cal.com
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="tel:+15551234567">
                          <Phone className="mr-2 h-4 w-4" />
                          Call Us
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/contact">
                          <Mail className="mr-2 h-4 w-4" />
                          Email Us
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tattoo Artist Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">
                        Dallas/Fort Worth Area
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">(555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">hello@ink37tattoos.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Hours</p>
                      <p className="text-muted-foreground">
                        Tue-Sat: 12PM-8PM<br />
                        Sun-Mon: By Appointment
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Consultation</p>
                    <p className="text-muted-foreground">
                      Free 30-minute consultation to discuss your vision, placement, and pricing.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Design Process</p>
                    <p className="text-muted-foreground">
                      Custom designs created based on your ideas with revisions included.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">During Your Session</p>
                    <p className="text-muted-foreground">
                      Professional, sterile environment with top-quality equipment and inks.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Aftercare</p>
                    <p className="text-muted-foreground">
                      Detailed aftercare instructions and support for optimal healing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}
