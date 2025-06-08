import type { Metadata } from 'next';
import { Suspense } from 'react';
import GalleryClient from '@/components/gallery/GalleryClient';
import { GallerySkeleton } from '@/components/gallery/GallerySkeleton';
import { ClientOnly } from '@/components/ClientOnly';
import { ErrorBoundary } from '@/components/error/error-boundary';

// Static generation with ISR for gallery
export const revalidate = 1800; // Revalidate every 30 minutes


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
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Gallery Temporarily Unavailable</h1>
            <p className="text-muted-foreground">Please try refreshing the page or contact us if the issue persists.</p>
            <a
              href="/gallery"
              className="inline-block px-4 py-2 bg-fernando-gradient text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Refresh Page
            </a>
          </div>
        </div>
      }
    >
      <ClientOnly fallback={<GallerySkeleton />}>
        <Suspense fallback={<GallerySkeleton />}>
          <GalleryClient />
        </Suspense>
      </ClientOnly>
    </ErrorBoundary>
  );
}
