import type { Metadata } from 'next';
import BookingClient from './booking-client';

export const metadata: Metadata = {
  title: 'Book a Consultation | Ink 37 Tattoos',
  description: 'Schedule your tattoo consultation with Ink 37 Tattoos. Professional tattoo services in the Dallas/Fort Worth metroplex. Easy online booking available.',
  keywords: 'book tattoo appointment, tattoo consultation dallas fort worth, schedule tattoo session, tattoo artist booking, ink 37 tattoos appointment',
  openGraph: {
    title: 'Book a Tattoo Consultation - Ink 37 Tattoos',
    description: 'Ready to get your custom tattoo? Schedule a consultation with Ink 37 Tattoos in the Dallas/Fort Worth area.',
    url: '/booking',
    siteName: 'Ink 37 Tattoos',
    images: [
      {
        url: '/images/cover-ups.jpg',
        width: 1200,
        height: 630,
        alt: 'Book Your Tattoo Consultation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Your Tattoo Consultation',
    description: 'Schedule your custom tattoo consultation with Ink 37 Tattoos in the Dallas/Fort Worth area.',
    images: ['/images/cover-ups.jpg'],
  },
  alternates: {
    canonical: '/booking',
  },
};

export default function BookingPage() {
  return <BookingClient />;
}