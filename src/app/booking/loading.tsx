/**
 * Booking page loading state
 */
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function BookingLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}
