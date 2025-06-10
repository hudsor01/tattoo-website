/**
 * Booking Page - Cal.com Integration
 * 
 * Purpose: Main booking page using Cal.com for scheduling
 * Rendering: SSG for SEO with CSR hydration for booking functionality
 * Dependencies: Cal.com integration, metadata for SEO
 */

import type { Metadata } from 'next';
import { BookingPopupButton } from '@/components/booking/BookingPopupButton';
import { Calendar, Clock, Video, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen pt-32 md:pt-36 bg-gradient-to-b from-white to-platinum/10 dark:from-ink-black dark:to-charcoal/50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-montserrat font-bold mb-4">
              <span className="bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange bg-clip-text text-transparent">Book Your</span>
              <span className="block text-ink-black dark:text-white">Tattoo Session</span>
            </h1>
            <p className="text-xl text-steel dark:text-silver max-w-2xl mx-auto">
              Ready to bring your tattoo vision to life? Schedule your consultation or session today.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Booking */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-fernando-red" />
                    Schedule Your Appointment
                  </CardTitle>
                  <CardDescription>
                    Book your consultation or tattoo session with our secure booking system
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <BookingPopupButton
                    eventSlug="consultation"
                    size="lg"
                    className="w-full bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange hover:opacity-90 transition-opacity text-white font-montserrat font-semibold py-6 text-lg"
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    Book Your Consultation
                  </BookingPopupButton>
                  <p className="text-sm text-steel dark:text-silver mt-4">
                    Secure booking powered by Cal.com
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-fernando-red" />
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-0.5 text-fernando-red shrink-0" />
                    <div>
                      <p className="font-medium">30-60 minutes</p>
                      <p className="text-sm text-muted-foreground">Flexible duration based on your needs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-0.5 text-fernando-red font-bold shrink-0">✓</span>
                    <div>
                      <p className="font-medium">Free consultation</p>
                      <p className="text-sm text-muted-foreground">No obligation to book</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Video className="w-4 h-4 mt-0.5 text-fernando-red shrink-0" />
                    <div>
                      <p className="font-medium">In-person or video call</p>
                      <p className="text-sm text-muted-foreground">Choose what works for you</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-fernando-red" />
                    What We'll Discuss
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-0.5 text-fernando-red font-bold shrink-0">✓</span>
                    <div>
                      <p className="font-medium">Your design ideas</p>
                      <p className="text-sm text-muted-foreground">Share your vision and inspiration</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-0.5 text-fernando-red font-bold shrink-0">✓</span>
                    <div>
                      <p className="font-medium">Size & placement</p>
                      <p className="text-sm text-muted-foreground">Find the perfect spot for your tattoo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-4 mt-0.5 text-fernando-red font-bold shrink-0">✓</span>
                    <div>
                      <p className="font-medium">Pricing & timeline</p>
                      <p className="text-sm text-muted-foreground">Get a clear quote and schedule</p>
                    </div>
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
