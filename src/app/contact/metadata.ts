import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Ink 37 Tattoos',
  description:
    'Get in touch for tattoo inquiries, consultations, or general questions. Located in Dallas/Fort Worth, Texas.',
  keywords:
    'contact ink 37 tattoos, tattoo consultation dallas fort worth, tattoo inquiry, tattoo studio contact',
  openGraph: {
    title: 'Contact Ink 37 Tattoos',
    description:
      'Contact us for tattoo inquiries and consultations. Located in Dallas/Fort Worth, TX.',
    url: '/contact',
    siteName: 'Ink 37 Tattoos',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Ink 37 Tattoos Interior',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Ink 37 Tattoos',
    description: 'Contact us for tattoo inquiries and consultations.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/contact',
  },
};
