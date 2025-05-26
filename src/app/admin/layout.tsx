'use client';

import { AppSidebar } from '@/components/admin/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import '../globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const sidebarDefaultOpen = true;

  return (
    <AdminErrorBoundary>
      <div className="min-h-screen bg-black text-white dark">
        <SidebarProvider defaultOpen={sidebarDefaultOpen}>
          <AppSidebar />
          <SidebarInset className="min-h-screen bg-black text-white">
            <main className="flex-1 p-6 space-y-6 bg-black text-white">
              <AdminErrorBoundary>
                {children}
              </AdminErrorBoundary>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AdminErrorBoundary>
  );
}
