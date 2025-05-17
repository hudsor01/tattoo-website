/**
 * IMPORTANT: This file provides metadata for the homepage
 * Since the homepage is a client component (with 'use client'),
 * we need to store metadata in a separate server file
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ink 37 - Custom Tattoos by Fernando Govea',
  description:
    'Experience custom tattoo artistry in a home-like environment in the Dallas/Fort Worth metroplex. Book your consultation today.',
  keywords:
    'tattoo, custom tattoos, Fernando Govea, Ink 37, Dallas, Fort Worth, tattoo artist, tattoo studio',
  authors: [{ name: 'Fernando Govea', url: 'https://ink37.com' }],
  creator: 'Fernando Govea',
  publisher: 'Ink 37 Tattoo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ink37.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ink 37 - Custom Tattoos by Fernando Govea',
    description:
      'Experience custom tattoo artistry in a home-like environment in the Dallas/Fort Worth metroplex. Book your consultation today.',
    url: 'https://ink37.com',
    siteName: 'Ink 37 Tattoo',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Ink 37 Tattoo by Fernando Govea',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ink 37 - Custom Tattoos by Fernando Govea',
    description:
      'Experience custom tattoo artistry in a home-like environment in the Dallas/Fort Worth metroplex. Book your consultation today.',
    images: ['/logo.png'],
    creator: '@ink37tattoo',
  },
  robots: {
    index: true,
    follow: true,
  },
};
