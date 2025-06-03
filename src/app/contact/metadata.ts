import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/seo-config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Contact | Book Your Tattoo Consultation Today',
  description: 'Contact our professional tattoo artist in Dallas/Fort Worth, Texas for consultations, custom designs, and bookings. Serving Dallas-Fort Worth area with expert tattoo services and personalized artwork.',
  keywords: [
    'contact tattoo artist Crowley TX',
    'tattoo consultation DFW',
    'book tattoo appointment',
    'tattoo inquiry',
    'custom tattoo quote',
    'custom tattoo design',
    'custom tattoo contact',
    'professional tattoo artist contact',
    'Dallas Fort Worth tattoo booking'
  ],
  canonical: 'https://ink37tattoos.com/contact',
  ogImage: '/images/realism.jpg',
});
