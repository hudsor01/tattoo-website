import type { Metadata } from 'next';
import { Suspense } from 'react';
import GalleryClient from '@/components/gallery/GalleryClient';
import { GallerySkeleton } from '@/components/gallery/GallerySkeleton';

// Enable Partial Prerendering (PPR) for optimal performance
export const experimental_ppr = true;

// Static parts will be prerendered, dynamic parts will stream
export const dynamic = 'auto';

export const metadata: Metadata = {
  title: 'Gallery | Ink 37 Tattoos',
  description:
    "Explore our tattoo gallery showcasing Ink 37 Tattoos' custom designs, Japanese style, traditional, and realism tattoos. Get inspired for your next ink.",
  keywords: [
    'tattoo gallery',
    'custom tattoos',
    'Ink 37 Tattoos',
    'Dallas tattoo',
    'Fort Worth tattoo',
    'ink inspiration',
  ],
  openGraph: {
    title: 'Tattoo Gallery | Ink 37',
    description:
      'Browse our collection of custom tattoo artwork by Ink 37 Tattoos. Find inspiration for your next tattoo piece.',
    images: ['/images/gallery-banner.jpg'],
  },
};

export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryClient />
    </Suspense>
  );
}
