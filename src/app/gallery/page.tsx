/**
 * Gallery Page
 *
 * Main gallery page that showcases tattoo designs by the artists.
 * Uses server component prefetching for optimal performance.
 */
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { createTRPCContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/app-router';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { GallerySkeleton } from '@/components/gallery/GallerySkeleton';

// Dynamic import for client component
const GalleryClient = dynamic(() => import('@/components/gallery/GalleryClient'), {
  loading: () => <GallerySkeleton />,
  ssr: true
});

export const metadata = {
  title: 'Tattoo Gallery | Ink 37',
  description:
    'Browse our collection of custom tattoo designs, showcasing the artistic talent and diverse styles available at Ink 37.',
};

// Server component that prefetches gallery data
export default async function GalleryPage() {
  // Create a new query client for this request
  const queryClient = new QueryClient();

  // Create a tRPC caller for server-side use
  const ctx = await createTRPCContext({
    req: {
      cookies: Object.fromEntries(
        cookies()
          .getAll()
          .map(c => [c.name, c.value]),
      ),
    },
    res: {} as any,
  });
  const caller = appRouter.createCaller(ctx);

  // Prefetch the gallery data on the server
  await queryClient.prefetchQuery({
    queryKey: ['trpc', 'gallery', 'getPublicDesigns'],
    queryFn: () => caller.gallery.getPublicDesigns({ limit: 12 }),
  });

  // Also prefetch the design types for filtering
  await queryClient.prefetchQuery({
    queryKey: ['trpc', 'gallery', 'getDesignTypes'],
    queryFn: () => caller.gallery.getDesignTypes(),
  });

  // Render the page with prefetched data
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Tattoo Gallery</h1>

      <p className="text-lg mb-8">
        Browse our collection of custom tattoo designs, showcasing the artistic talent and diverse
        styles available at Ink 37. Each piece reflects our commitment to quality, creativity, and
        personal expression.
      </p>

      <Suspense fallback={<GallerySkeleton />}>
        <GalleryClient dehydratedState={dehydrate(queryClient)} />
      </Suspense>
    </div>
  );
}