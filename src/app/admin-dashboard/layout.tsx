'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Use dynamic import for the dashboard layout to avoid SSR hydration issues
const DashboardLayout = dynamic(() => import('@/app/admin-dashboard/components/DashboardLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mb-4 mx-auto text-primary" />
        <h2 className="text-lg font-semibold">Loading Dashboard...</h2>
      </div>
    </div>
  ),
});

// Custom client-only wrapper to avoid hydration issues
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mb-4 mx-auto text-primary" />
          <h2 className="text-lg font-semibold">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnly>
      <DashboardLayout>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          {children}
        </Suspense>
      </DashboardLayout>
    </ClientOnly>
  );
}