/**
 * Customer Detail Page
 *
 * Shows comprehensive information about a customer including
 * history, bookings, appointments, and allows adding notes/tags.
 */
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { dehydrate, QueryClient, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/routers';
import { cookies } from 'next/headers';
import { CustomerDetail } from '@/app/admin-dashboard/components/CustomerDetail';
import { CustomerDetailSkeleton } from '@/app/admin-dashboard/components/CustomerDetailSkeleton';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const ctx = await createTRPCContext({
    req: {
      cookies: Object.fromEntries(
        cookies()
          .getAll()
          .map(c => [c.name, c.value]),
      ),
    },
    res: {} as unknown,
  });
  const caller = appRouter.createCaller(ctx);

  try {
    const customer = await caller.admin.getCustomerById({ id: params.id });

    return {
      title: `${customer.firstName} ${customer.lastName} | Customer Details`,
      description: `Customer profile and history for ${customer.firstName} ${customer.lastName}`,
    };
  } catch (error) {
    return {
      title: 'Customer Not Found',
      description: 'The requested customer profile could not be found.',
    };
  }
}

// Server component
export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

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
    res: {} as unknown,
  });

  try {
    const caller = appRouter.createCaller(ctx);

    // Prefetch customer data
    await queryClient.prefetchQuery({
      queryKey: ['trpc', 'admin', 'getCustomerById', { id }],
      queryFn: () => caller.admin.getCustomerById({ id }),
    });

    // Prefetch tags
    await queryClient.prefetchQuery({
      queryKey: ['trpc', 'admin', 'getTags'],
      queryFn: () => caller.admin.getTags(),
    });
  } catch (error) {
    // If customer not found, return 404
    notFound();
  }

  // Render the page with prefetched data
  return (
    <div className="container p-8">
      <Suspense fallback={<CustomerDetailSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <CustomerDetail id={id} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
