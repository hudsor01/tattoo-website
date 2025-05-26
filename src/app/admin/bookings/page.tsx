import dynamic from 'next/dynamic';
import { AdminBookingsLoading } from '@/components/admin/AdminLoadingStates';

const BookingsPageContent = dynamic(() => import('./BookingsPageContent'), {
  loading: () => <AdminBookingsLoading />,
});

export default function BookingsPage() {
  return <BookingsPageContent />;
}
