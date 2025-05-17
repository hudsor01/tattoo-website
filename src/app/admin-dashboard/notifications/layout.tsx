import React from 'react';
import DashboardLayout from '@/app/admin-dashboard/components/DashboardLayout';

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
