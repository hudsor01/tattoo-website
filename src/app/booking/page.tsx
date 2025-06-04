/**
 * Booking Page - Cal.com Integration
 * 
 * Purpose: Main booking page using Cal.com Atoms for scheduling
 * Rendering: SSG for SEO with CSR hydration for booking functionality
 * Dependencies: Cal.com Atoms, metadata for SEO
 * 
 * Trade-offs:
 * - SSG vs SSR: SEO optimization vs dynamic content
 * - Cal.com integration vs custom forms: Professional scheduling vs full control
 * - Dynamic import vs static: Performance vs simplicity
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalAtomsBooking } from '@/components/cal/cal-atoms-booking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';

import { logger } from "@/lib/logger";
export const metadata: Metadata = {
  title: 'Book Your Tattoo Appointment | Ink 37 Tattoos',
  description:
    'Schedule your tattoo appointment with Ink 37 Tattoos. Professional consultations, custom designs, and expert tattoo services in the Dallas/Fort Worth metroplex. Book online now.',
  keywords:
    'book tattoo appointment, tattoo consultation dallas fort worth, schedule tattoo session, tattoo artist booking, ink 37 tattoos appointment, cal.com booking',
  openGraph: {
    title: 'Book Your Tattoo Appointment - Ink 37 Tattoos',
    description:
      'Ready to get your custom tattoo? Schedule your appointment with Ink 37 Tattoos in the Dallas/Fort Worth area. Free consultations available.',
    url: '/booking',
    siteName: 'Ink 37 Tattoos',
    images: [
      {
        url: '/images/realism.jpg',
        width: 1200,
        height: 630,
        alt: 'Book Your Tattoo Appointment',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Your Tattoo Appointment',
    description:
      'Schedule your custom tattoo appointment with Ink 37 Tattoos. Expert artists, free consultations.',
    images: ['/images/realism.jpg'],
  },
  alternates: {
    canonical: '/booking',
  },
};

// Static generation for SEO benefits
export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Book Your Tattoo Appointment
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Schedule your consultation or tattoo session with Ink 37 Tattoos. 
            Professional artists, custom designs, and exceptional service in the Dallas/Fort Worth area.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              Same Day Consultations
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <MapPin className="h-4 w-4 mr-1" />
              Dallas/Fort Worth
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Professional Artists
            </Badge>
          </div>
        </div>

        {/* Main Booking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Booking Component */}
          <div className="lg:col-span-3">
            <Suspense fallback={<BookingLoadingSkeleton />}>
              <CalAtomsBooking
                onappointmentsuccess={(booking) => {
                  // Analytics tracking handled in component
                  void logger.info('Booking completed:', booking);
                }}
                onBookingError={(error) => {
                  void logger.error('Booking failed:', error);
                }}
                className="w-full"
              />
            </Suspense>
          </div>

          {/* Sidebar Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Info</CardTitle>
                <CardDescription>Need help? Get in touch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">hello@ink37tattoos.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">Dallas/Fort Worth Metroplex</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">Consultations</p>
                  <p className="text-muted-foreground">
                    Free 30-minute consultations to discuss your tattoo ideas, placement, and pricing.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Deposits</p>
                  <p className="text-muted-foreground">
                    Deposits are required for all tattoo sessions and are applied to your final total.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Cancellations</p>
                  <p className="text-muted-foreground">
                    Please provide 24-hour notice for cancellations to avoid fees.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Age Requirement</p>
                  <p className="text-muted-foreground">
                    Must be 18+ with valid ID. No exceptions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">Before Your Session</p>
                  <p className="text-muted-foreground">
                    Get plenty of rest, eat well, and avoid alcohol 24 hours prior.
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

        {/* FAQ Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions about booking and tattoo sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">How far in advance should I book?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Consultations can often be scheduled same-day or next-day. Tattoo sessions typically 
                    require 1-2 weeks advance booking, depending on size and complexity.
                  </p>

                  <h4 className="font-medium mb-2">What should I bring to my consultation?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bring reference images, ideas, and your valid ID. We'll discuss design, 
                    placement, sizing, and pricing during your consultation.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">How much do tattoos cost?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pricing varies based on size, complexity, placement, and time required. 
                    We provide detailed quotes during your consultation.
                  </p>

                  <h4 className="font-medium mb-2">Do you offer touch-ups?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! We offer complimentary touch-ups within 30 days of your session, 
                    provided you follow our aftercare instructions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for better UX
function BookingLoadingSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
