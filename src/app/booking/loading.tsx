import { Skeleton } from '@/components/ui/skeleton';

export default function BookingLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Skeleton className="h-12 w-2/3 mb-6" />
      <Skeleton className="h-6 w-full mb-8" />

      <div className="booking-loading-container rounded-lg overflow-hidden shadow-lg p-8 space-y-6">
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
          <Skeleton className="h-36 w-full rounded" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-12 w-48 mt-8" />
      </div>
    </div>
  );
}
