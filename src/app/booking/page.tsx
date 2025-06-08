/**
 * Booking Page - Cal.com Integration
 * 
 * Purpose: Main booking page using Cal.com for scheduling
 * Rendering: SSG for SEO with CSR hydration for booking functionality
 * Dependencies: Cal.com integration, metadata for SEO
 */

import type { Metadata } from 'next';
import BookingClient from '@/components/booking/BookingClient';

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
    <div className="min-h-screen pt-32 md:pt-36 bg-black">
      <BookingClient />
    </div>
  );
}
