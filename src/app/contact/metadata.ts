import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Fernando Govea Tattoo Studio',
  description: 'Get in touch for tattoo inquiries, consultations, or general questions. Located in Dallas/Fort Worth, Texas.',
  keywords: 'contact fernando govea, tattoo consultation dallas fort worth, tattoo inquiry, tattoo studio contact',
  openGraph: {
    title: 'Contact Fernando Govea Tattoo Studio',
    description: 'Contact us for tattoo inquiries and consultations. Located in Dallas/Fort Worth, TX.',
    url: '/contact',
    siteName: 'Fernando Govea Tattoo',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Fernando Govea Tattoo Studio Interior',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Fernando Govea Tattoo Studio',
    description: 'Contact us for tattoo inquiries and consultations.',
    images: ['/images/logo.png'],
  },
  alternates: {
    canonical: '/contact',
  },
};
