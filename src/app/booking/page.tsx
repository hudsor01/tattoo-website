/**
 * Booking Page
 *
 * This page demonstrates using tRPC in a Server Component with prefetching,
 * and then hydrating the client component with the prefetched data.
 */
import { Suspense } from 'react';
import { dehydrate, QueryClient, HydrationBoundary } from '@tanstack/react-query';
import { BookingForm } from '../../components/booking/BookingForm';
import { createTRPCContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/routers';
import { cookies } from 'next/headers';
import { prefetchTRPCQuery } from '@/lib/trpc/server-action';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Book Your Tattoo Appointment | Ink 37',
  description:
    'Schedule a consultation for your next tattoo with our experienced artists. Bring your vision to life with custom designs.',
};

// Loading skeleton for the booking page
function BookingLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Skeleton className="h-12 w-2/3 mb-6" />
      <Skeleton className="h-6 w-full mb-8" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-36 w-full" />
        </div>
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
}

// Server component
export default async function BookingPage() {
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

  // Prefetch the artists data on the server
  await queryClient.prefetchQuery({
    queryKey: ['trpc', 'user', 'getArtists'],
    queryFn: () => caller.user.getArtists({ includeUnavailable: false }),
  });

  // Alternatively, we could use the helper function
  // await prefetchTRPCQuery('user.getArtists', { includeUnavailable: false });

  // Render the page with prefetched data
  return (
    <Suspense fallback={<BookingLoading />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="container max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-4xl font-bold mb-6">Book Your Appointment</h1>
          <p className="text-lg mb-8">
            Fill out the form below to schedule a consultation for your tattoo. Our artists will
            review your request and contact you to finalize the details.
          </p>
          <BookingForm />
        </div>
      </HydrationBoundary>
    </Suspense>
  );
}
