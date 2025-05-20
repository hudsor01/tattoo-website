/**
 * Gallery Design Detail Page
 * 
 * Displays details for a specific tattoo design with metadata and artist information.
 * Uses server components for data fetching and client components for interactivity.
 * @see {@link /src/components/gallery/DesignDetail.tsx}
 */
import { Suspense } from 'react';
import { dehydrate, QueryClient, HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { createTRPCContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/app-router';
import { cookies } from 'next/headers';
import { DesignDetail } from '@/components/gallery/DesignDetail';
import { DesignDetailSkeleton } from '@/components/gallery/DesignDetailSkeleton';

// Add fallback TypeScript types for better compatibility
type Cookies = {
  getAll: () => Array<{ name: string; value: string }>;
};

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }) {
  // Type-safe cookie handling
  const cookieStore = cookies();
  const cookieEntries = (cookieStore as unknown as Cookies).getAll().map(c => [c.name, c.value]);
  
  const ctx = await createTRPCContext({ 
    req: { cookies: Object.fromEntries(cookieEntries) }, 
    resHeaders: new Headers(),
  } as any);
  const caller = appRouter.createCaller(ctx);
  
  try {
    const design = await caller.gallery.getDesignById({ id: params.id as string });
    
    return {
      title: `${design.name} | Tattoo Gallery | Ink 37`,
      description: design.description || `View details of the ${design.name} tattoo design by Ink 37.`,
      openGraph: {
        images: design.thumbnailUrl ? [design.thumbnailUrl] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Design Not Found | Ink 37',
      description: 'The requested tattoo design could not be found.',
    };
  }
}

// Server component
export default async function DesignDetailPage({ params }: { params: { id: string } }) {
  // Create a new query client for this request
  const queryClient = new QueryClient();
  
  // Create a tRPC caller for server-side use
  // Type-safe cookie handling
  const cookieStore = cookies();
  const cookieEntries = (cookieStore as unknown as Cookies).getAll().map(c => [c.name, c.value]);
  
  const ctx = await createTRPCContext({ 
    req: { cookies: Object.fromEntries(cookieEntries) }, 
    resHeaders: new Headers(),
  } as any);
  const caller = appRouter.createCaller(ctx);
  
  try {
    // Prefetch the design data on the server
    await queryClient.prefetchQuery({
      queryKey: ['trpc', 'gallery', 'getDesignById', { id: params.id }],
      queryFn: async () => await caller.gallery.getDesignById({ id: params.id as string }),
    });
  } catch (error) {
    console.error('Error fetching design:', error);
    // If design not found, return 404
    notFound();
  }
  
  // Ensure the query client is correctly dehydrated
  const dehydratedState = dehydrate(queryClient);
  
  // Render the page with prefetched data
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<DesignDetailSkeleton />}>
        <HydrationBoundary state={dehydratedState}>
          <DesignDetail id={params.id} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
