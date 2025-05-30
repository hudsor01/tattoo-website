import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tattoo Services | Ink 37 Tattoos',
  description:
    'Custom tattoo services including traditional, realism, Japanese, and cover-ups. Professional tattooing in the Dallas/Fort Worth metroplex.',
  keywords:
    'tattoo services dallas, custom tattoos fort worth, traditional tattoo, realism tattoo, japanese tattoo, cover-up tattoo, tattoo pricing, tattoo consultation',
  openGraph: {
    title: 'Tattoo Services - Ink 37 Tattoos',
    description:
      'Explore our custom tattoo services including traditional, realism, Japanese, and cover-ups. Professional tattooing in Austin, TX.',
    url: '/services',
    siteName: 'Ink 37 Tattoos',
    images: [
      {
        url: '/images/services-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Ink 37 Tattoos Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tattoo Services - Ink 37 Tattoos',
    description:
      'Custom tattoo services in Austin, TX. Traditional, realism, Japanese, and cover-ups.',
    images: ['/images/services-hero.jpg'],
  },
  alternates: {
    canonical: '/services',
  },
};
