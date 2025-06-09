import type { Metadata } from 'next';
import { Suspense } from 'react';
import GalleryClient from '@/components/gallery/GalleryClient';
import { GallerySkeleton } from '@/components/gallery/GallerySkeleton';
import { ClientOnly } from '@/components/ClientOnly';
import { ErrorBoundary } from '@/components/error/error-boundary';

// Static generation with ISR for gallery
export const revalidate = 1800; // Revalidate every 30 minutes


export const metadata: Metadata = {
  title: 'Tattoo Gallery - Custom Designs & Portfolio | Ink 37 Tattoos Crowley, TX',
  description:
    "Browse Ink 37 Tattoos' gallery of custom tattoo designs from Crowley, TX. See traditional, Japanese, realistic, and fine-line tattoo artwork by Fernando Govea. DFW's premier tattoo artist portfolio.",
  keywords: [
    'tattoo gallery Crowley TX',
    'custom tattoo designs',
    'Fernando Govea tattoo portfolio',
    'DFW tattoo gallery',
    'traditional tattoo examples',
    'Japanese tattoo portfolio',
    'realistic tattoo gallery',
    'fine line tattoo examples',
    'cover up tattoo gallery',
    'Crowley tattoo artist portfolio',
    'Fort Worth tattoo gallery',
    'Dallas tattoo examples',
    'custom tattoo inspiration',
    'tattoo design ideas',
    'professional tattoo artwork'
  ],
  openGraph: {
    title: 'Tattoo Gallery - Custom Designs & Portfolio | Ink 37 Tattoos',
    description:
      'Explore our comprehensive tattoo gallery featuring custom designs, traditional work, Japanese art, and realistic pieces by Fernando Govea in Crowley, Texas.',
    images: [
      {
        url: '/images/japanese.jpg',
        width: 1200,
        height: 630,
        alt: 'Japanese style tattoo artwork by Ink 37 Tattoos'
      },
      {
        url: '/images/traditional.jpg', 
        width: 1200,
        height: 630,
        alt: 'Traditional tattoo gallery by Ink 37 Tattoos'
      }
    ],
    type: 'website',
    locale: 'en_US',
    siteName: 'Ink 37 Tattoos'
  },
  alternates: {
    canonical: '/gallery'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }
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
