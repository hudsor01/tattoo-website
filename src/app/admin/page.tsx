// Lazy load admin components since they're not needed on initial load
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Ink 37',
  description: 'Admin dashboard for Ink 37 Tattoos',
  robots: 'noindex, nofollow', // Prevent search engines from indexing admin pages
};

const AdminDashboard = dynamic(
  () => import('@/components/admin/DashboardModern'),
  {
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    ),
  }
);

export default function AdminPage() {
  return <AdminDashboard />;
}
