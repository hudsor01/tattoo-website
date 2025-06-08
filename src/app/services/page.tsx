import type { Metadata } from 'next';
import ServicesClient from '@/components/services/ServicesClient';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Tattoo Services | Ink 37 Tattoos',
  description:
    'Explore our premium tattoo services including custom designs, realistic portraits, fine line work, and expert cover-ups. Each tattoo is a unique piece of art crafted with precision and passion.',
  keywords: [
    'tattoo services',
    'custom tattoos',
    'portrait tattoos',
    'fine line tattoos',
    'tattoo cover-ups',
    'Dallas tattoo artist',
    'Fort Worth tattoo artist',
    'professional tattoo services',
    'Ink 37 Tattoos',
  ],
  openGraph: {
    title: 'Premium Tattoo Services | Ink 37 Tattoos',
    description:
      'Discover our range of professional tattoo services. From custom designs to cover-ups, we bring your vision to life with artistic excellence.',
    images: [
      {
        url: '/images/traditional.jpg',
        width: 1200,
        height: 630,
        alt: 'Ink 37 Tattoos Services',
      },
    ],
    url: '/services',
    siteName: 'Ink 37 Tattoos',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Tattoo Services | Ink 37 Tattoos',
    description:
      'Custom designs, portraits, fine line work & cover-ups. Professional tattoo services in Dallas/Fort Worth.',
    images: ['/images/traditional.jpg'],
  },
  alternates: {
    canonical: '/services',
  },
};

export default function ServicesPage() {
return <ServicesClient />;
}
