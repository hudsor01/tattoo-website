'use client';

/**
 * Gallery Page
 *
 * Main gallery page that showcases tattoo designs by the artists.
 * Uses client-side components for filtering and displaying designs.
 * @see {@link /src/components/gallery/GalleryGrid.tsx}
 */
import { Suspense } from 'react';
import { GallerySkeleton } from '@/components/gallery/GallerySkeleton';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { TRPCProvider } from '@/lib/trpc/client';
import Link from 'next/link';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Gallery Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Tattoo Portfolio</h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto mb-6 rounded-full"></div>
        
        <p className="text-lg max-w-3xl mx-auto mb-8">
          Browse our collection of custom tattoo designs showcasing a diverse range of styles. 
          From traditional to Japanese, portraits to custom pieces - each design reflects our 
          commitment to quality, creativity, and personal expression.
        </p>
        
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/booking">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Book a Consultation
          </Link>
        </Button>
      </div>

      {/* Gallery Content */}
      <Suspense fallback={<GallerySkeleton />}>
        <TRPCProvider>
          <GalleryGrid />
        </TRPCProvider>
      </Suspense>
    </div>
  );
}