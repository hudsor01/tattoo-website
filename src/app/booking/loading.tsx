/**
 * Booking page loading state
 * Uses form loading component for consistency
 */
import { LoadingUI } from '@/components/admin/layout/Loading';

export default function BookingLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <LoadingUI type="form" />
    </div>
  );
}
