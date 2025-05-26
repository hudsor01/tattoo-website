import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appointments | Admin Dashboard',
  description: 'Manage tattoo appointments',
  robots: 'noindex, nofollow',
};

const AppointmentsPage = dynamic(() => import('@/components/admin/appointments/AppointmentsPage'), {
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Loading appointments...</div>
    </div>
  ),
});

export default function Page() {
  return <AppointmentsPage />;
}
