'use client';

import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/useAuthStore';
import { Grid } from '@/components/ui/mui-grid';

/**
 * Admin Dashboard Page
 *
 * Central hub for admin functionality with stats, recent activity,
 * and quick access to common actions
 */
export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingBookings: 0,
    completedAppointments: 0,
    recentMessages: 0,
  });

  // Load dashboard data
  useEffect(() => {
    async function loadDashboardData() {
      if (!user || !isAdmin) return;

      try {
        setIsLoading(true);

        // Load stats from Supabase
        // In a real implementation, this would fetch actual data
        // For now, we'll use placeholder values

        // Allow some time to simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));

        setStats({
          totalCustomers: 128,
          pendingBookings: 12,
          completedAppointments: 457,
          recentMessages: 8,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user, isAdmin]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 4,
          color: 'primary.main',
          fontFamily: 'var(--font-montserrat)',
        }}
      >
        Admin Dashboard
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Customers" value={stats.totalCustomers} icon="👥" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Pending Bookings" value={stats.pendingBookings} icon="📅" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Completed Appointments" value={stats.completedAppointments} icon="✅" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="New Messages" value={stats.recentMessages} icon="✉️" />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 6, mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
            title="Manage Appointments"
            description="View and manage upcoming appointments"
            link="/admin/appointments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
            title="Customer Messages"
            description="Respond to customer inquiries"
            link="/admin/messages"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActionCard
            title="Update Gallery"
            description="Add or remove portfolio items"
            link="/admin/gallery"
          />
        </Grid>
      </Grid>
    </Container>
  );
}

/**
 * Stats Card Component
 */
function StatsCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          fontSize: 80,
          opacity: 0.1,
          transform: 'rotate(15deg)',
          color: 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" component="h2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography
        component="p"
        variant="h3"
        sx={{
          fontWeight: 'bold',
          mt: 'auto',
          zIndex: 1,
          color: 'primary.main',
        }}
      >
        {value.toLocaleString()}
      </Typography>
    </Paper>
  );
}

/**
 * Action Card Component
 */
function ActionCard({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 180,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
          borderColor: 'primary.main',
        },
      }}
      onClick={() => (window.location.href = link)}
    >
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {description}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 'auto',
          color: 'primary.main',
          fontWeight: 'medium',
        }}
      >
        Open →
      </Typography>
    </Paper>
  );
}
