import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | Frequently Asked Questions - Fernando Govea Tattoo',
  description: 'Find answers to common questions about tattoo care, booking process, pricing, and what to expect during your tattoo session.',
  keywords: 'tattoo faq, tattoo care, tattoo booking process, tattoo pricing, tattoo aftercare, tattoo questions',
  openGraph: {
    title: 'Tattoo FAQ - Fernando Govea',
    description: 'Common questions about tattoo care, booking, pricing, and the tattoo process answered.',
    url: '/faq',
    siteName: 'Fernando Govea Tattoo',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fernando Govea Tattoo FAQ',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tattoo FAQ - Fernando Govea',
    description: 'Common questions about tattoo care, booking, and pricing answered.',
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: '/faq',
  },
};
