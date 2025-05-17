/**
 * Gallery Design Detail Page
 * 
 * Displays details for a specific tattoo design with metadata and artist information.
 */
import { Suspense } from 'react';
import { dehydrate, QueryClient, HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { createTRPCContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/routers';
import { cookies } from 'next/headers';
import { DesignDetail } from '@/components/gallery/DesignDetail';
import { DesignDetailSkeleton } from '@/components/gallery/DesignDetailSkeleton';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const ctx = await createTRPCContext({ 
    req: { cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value])) }, 
    res: {} as any 
  });
  const caller = appRouter.createCaller(ctx);
  
  try {
    const design = await caller.gallery.getDesignById({ id: params.id });
    
    return {
      title: `${design.name} | Tattoo Gallery | Ink 37`,
      description: design.description || `View details of the ${design.name} tattoo design by Ink 37.`,
      openGraph: {
        images: design.thumbnailUrl ? [design.thumbnailUrl] : [],
      },
    };
  } catch (error) {
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
  const ctx = await createTRPCContext({ 
    req: { cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value])) }, 
    res: {} as any 
  });
  const caller = appRouter.createCaller(ctx);
  
  try {
    // Prefetch the design data on the server
    await queryClient.prefetchQuery({
      queryKey: ['trpc', 'gallery', 'getDesignById', { id: params.id }],
      queryFn: () => caller.gallery.getDesignById({ id: params.id }),
    });
  } catch (error) {
    // If design not found, return 404
    notFound();
  }
  
  // Render the page with prefetched data
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<DesignDetailSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DesignDetail id={params.id} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
