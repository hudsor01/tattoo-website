'use client';

import { Suspense } from 'react';
import { HydrationBoundary } from '@tanstack/react-query';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GallerySkeleton } from '@/components/gallery/GallerySkeleton';

interface GalleryClientProps {
  dehydratedState: any;
}

export default function GalleryClient({ dehydratedState }: GalleryClientProps) {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <HydrationBoundary state={dehydratedState}>
        <GalleryGrid />
      </HydrationBoundary>
    </Suspense>
  );
}
