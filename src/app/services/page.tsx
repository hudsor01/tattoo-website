import type { Metadata } from 'next';
import ServicesClient from '@/components/services/ServicesClient';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Professional Tattoo Services Crowley TX | Custom Designs & Cover-ups | Ink 37',
  description:
    'Expert tattoo services in Crowley, TX including custom designs, traditional tattoos, Japanese art, realistic portraits, fine line work, and cover-ups. Serving DFW metroplex with premium tattoo artistry.',
  keywords: [
    'tattoo services Crowley TX',
    'custom tattoo design Crowley',
    'professional tattoo artist DFW',
    'traditional tattoo services',
    'Japanese tattoo artist Texas',
    'realistic portrait tattoos',
    'fine line tattoo work',
    'cover up tattoo specialist',
    'Dallas Fort Worth tattoo services',
    'Crowley tattoo shop',
    'Fernando Govea tattoo artist',
    'DFW custom tattoos',
    'Texas tattoo services',
    'professional body art',
    'tattoo consultation services'
  ],
  openGraph: {
    title: 'Professional Tattoo Services | Ink 37 Tattoos Crowley, TX',
    description:
      'Comprehensive tattoo services by Fernando Govea in Crowley, Texas. Custom designs, traditional work, Japanese art, realistic portraits & expert cover-ups serving the DFW metroplex.',
    images: [
      {
        url: '/images/services/tattoo-gun-grayscale.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional tattoo services at Ink 37 Tattoos in Crowley, Texas',
      },
      {
        url: '/images/traditional.jpg',
        width: 1200,
        height: 630,
        alt: 'Traditional tattoo services by Ink 37 Tattoos',
      },
    ],
    url: '/services',
    siteName: 'Ink 37 Tattoos',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: '/services',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }
};

export default function ServicesPage() {
return <ServicesClient />;
}
