import React from 'react';
import type { Metadata } from 'next';
import FAQClient from '@/components/faq/FAQClient';
import { generateFAQStructuredData } from '@/lib/seo/structured-data';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

const faqStructuredData = generateFAQStructuredData();

export const metadata: Metadata = {
  title: 'Tattoo FAQ - Common Questions Answered | Ink 37 Tattoos Crowley TX',
  description:
    'Get answers to frequently asked questions about tattoo services, pricing, aftercare, and booking at Ink 37 Tattoos in Crowley, TX. Expert guidance from Fernando Govea for DFW tattoo clients.',
  keywords: [
    'tattoo FAQ Crowley TX',
    'tattoo questions and answers',
    'tattoo pricing information',
    'tattoo aftercare guide',
    'tattoo appointment booking',
    'tattoo consultation process',
    'DFW tattoo FAQ',
    'Fernando Govea tattoo questions',
    'custom tattoo FAQ',
    'professional tattoo advice',
    'tattoo pain questions',
    'tattoo healing process',
    'first tattoo questions'
  ],
  openGraph: {
    title: 'Tattoo FAQ - Common Questions Answered | Ink 37 Tattoos',
    description: 'Complete guide to tattoo questions and answers from Crowley, TX\'s premier tattoo artist Fernando Govea. Get expert advice for your tattoo journey.',
    images: ['/images/services/neon-sign.jpg'],
    type: 'website',
    locale: 'en_US',
    siteName: 'Ink 37 Tattoos'
  },
  alternates: {
    canonical: '/faq'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large'
    }
  }
};

/**
 * FAQ Page - Server Component with FAQ Structured Data
 *
 * Provides SEO metadata and wraps the client component.
 */
export default function FAQPage() {
  return (
    <>
      {/* FAQ Structured Data for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <FAQClient />
    </>
  );
}
