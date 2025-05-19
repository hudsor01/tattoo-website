'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, Typography } from '@mui/material';

// Use dynamic import for the dashboard layout to avoid SSR hydration issues
const DashboardLayout = dynamic(() => import('@/app/admin-dashboard/components/DashboardLayout'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#121212',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={50} sx={{ mb: 2, color: '#d62828' }} />
        <Typography variant="h6" color="white">
          Loading Dashboard...
        </Typography>
      </Box>
    </Box>
  ),
});

// Custom client-only wrapper to avoid hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#121212',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={50} sx={{ mb: 2, color: '#d62828' }} />
          <Typography variant="h6" color="white">
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}

// Apply DashboardLayout specifically to dashboard routes
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      <DashboardLayout>{children}</DashboardLayout>
    </ClientOnly>
  );
}
