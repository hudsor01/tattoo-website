import type { Metadata } from 'next';
import BookingClient from './booking-client';

export const metadata: Metadata = {
  title: 'Book a Consultation | Fernando Govea Tattoo',
  description: 'Schedule your tattoo consultation with Fernando Govea. Professional tattoo services in the Dallas/Fort Worth metroplex. Easy online booking available.',
  keywords: 'book tattoo appointment, tattoo consultation dallas fort worth, schedule tattoo session, tattoo artist booking, fernando govea appointment',
  openGraph: {
    title: 'Book a Tattoo Consultation - Fernando Govea',
    description: 'Ready to get your custom tattoo? Schedule a consultation with Fernando Govea in Austin, TX.',
    url: '/booking',
    siteName: 'Fernando Govea Tattoo',
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
    description: 'Schedule your custom tattoo consultation with Fernando Govea in Austin, TX.',
    images: ['/images/cover-ups.jpg'],
  },
  alternates: {
    canonical: '/booking',
  },
};

export default function BookingPage() {
  return <BookingClient />;
}