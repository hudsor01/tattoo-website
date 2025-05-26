import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tattoo Gallery | Ink 37 Tattoos Portfolio',
  description: 'Browse our extensive portfolio of custom tattoos including traditional, fine line, black and grey, and colored designs by Ink 37 Tattoos.',
  keywords: 'tattoo gallery, tattoo portfolio, custom tattoo designs, traditional tattoos, fine line tattoos, black and grey tattoos',
  openGraph: {
    title: 'Tattoo Gallery - Ink 37 Tattoos Portfolio',
    description: 'Explore our tattoo portfolio featuring custom designs, traditional, fine line, and unique artwork.',
    url: '/gallery',
    siteName: 'Ink 37 Tattoos',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Ink 37 Tattoos Gallery',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tattoo Gallery - Ink 37 Tattoos Portfolio',
    description: 'Browse our extensive tattoo portfolio.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/gallery',
  },
};
