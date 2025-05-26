import React from 'react';
import type { Metadata } from 'next';
import FAQClient from '@/components/faq/FAQClient';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'FAQ | Ink 37 Tattoos',
  description: 'Find answers to frequently asked questions about tattoo services, consultations, pricing, aftercare, and policies at Ink 37 Tattoos.',
  keywords: ['tattoo FAQ', 'tattoo questions', 'tattoo consultation', 'tattoo aftercare', 'Dallas tattoo', 'Fort Worth tattoo'],
  openGraph: {
    title: 'Frequently Asked Questions | Ink 37',
    description: 'Everything you need to know about the tattoo experience at Ink 37',
  },
};

/**
 * FAQ Page - Server Component
 * 
 * Provides SEO metadata and wraps the client component.
 */
export default function FAQPage() {
  return <FAQClient />;
}