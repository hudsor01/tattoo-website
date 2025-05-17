'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/admin-dashboard/components/DashboardLayout';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import Grid from '@/components/ui/mui-grid';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import EventIcon from '@mui/icons-material/Event';
import MessageIcon from '@mui/icons-material/Message';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from 'axios';

import { DashboardData, DashboardStatsCardProps } from '@/types/ui';

// Styled component for stat cards
const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(18, 18, 18, 0.7)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
  },
}));

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const router = useRouter();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/dashboard');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats card component
  const StatsCard = ({
    title,
    value,
    description,
    icon,
    color,
    change,
  }: DashboardStatsCardProps) => (
    <StatCard elevation={2}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'white' }}>
            {title}
          </Typography>
          <Box
            sx={{
              bgcolor: `${color}20`,
              p: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getIconComponent(icon, color)}
          </Box>
        </Box>

        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
          {value}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {description}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              backgroundColor: color,
              py: 0.5,
              px: 1,
              borderRadius: 1,
              fontWeight: 'medium',
            }}
          >
            {change}
          </Typography>
        </Box>
      </CardContent>
    </StatCard>
  );

  // Helper function to get the icon component based on icon name
  function getIconComponent(iconName: string, color: string) {
    switch (iconName) {
      case 'PersonIcon':
        return <PersonIcon sx={{ color, fontSize: 32 }} />;
      case 'EventIcon':
        return <EventIcon sx={{ color, fontSize: 32 }} />;
      case 'MessageIcon':
        return <MessageIcon sx={{ color, fontSize: 32 }} />;
      case 'PaymentIcon':
        return <PaymentIcon sx={{ color, fontSize: 32 }} />;
      default:
        return <DashboardIcon sx={{ color, fontSize: 32 }} />;
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <DashboardLayout>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}
        >
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading dashboard...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
            flexDirection: 'column',
          }}
        >
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 500 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'white',
          }}
        >
          <DashboardIcon sx={{ fontSize: 32, color: '#d62828' }} />
          Welcome to your Tattoo Studio Dashboard
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ maxWidth: 800, color: 'rgba(255, 255, 255, 0.7)' }}
        >
          Manage your tattoo business, track clients, schedule appointments, and process payments
          all in one place.
        </Typography>
      </Box>

      {/* Statistics cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {dashboardData?.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Appointments */}
      {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <EventIcon sx={{ color: '#d62828' }} />
              Recent Appointments
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleIcon />}
              onClick={() => router.push('/admin/appointments/new')}
            >
              Schedule New Session
            </Button>
          </Box>

          <Paper
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'rgba(20, 20, 20, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Client
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Time
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Service
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Deposit
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.upcomingAppointments.map(appointment => {
                    const startDate = new Date(appointment.startTime);
                    const formattedDate = startDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                    const formattedTime = startDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <TableRow
                        key={appointment.id}
                        hover
                        sx={{ '&:hover': { backgroundColor: 'rgba(30, 30, 30, 0.9)' } }}
                      >
                        <TableCell sx={{ color: 'white' }}>{appointment.client}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{formattedDate}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{formattedTime}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{appointment.service}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor:
                                appointment.status === 'confirmed'
                                  ? 'rgba(16, 185, 129, 0.8)'
                                  : appointment.status === 'scheduled'
                                    ? 'rgba(245, 158, 11, 0.8)'
                                    : 'rgba(239, 68, 68, 0.8)',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 'medium',
                            }}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          {appointment.depositPaid
                            ? `$${appointment.deposit.toFixed(2)}`
                            : 'Not paid'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: '#d62828',
                              color: 'white',
                              mr: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(214, 40, 40, 0.1)',
                                borderColor: '#d62828',
                              },
                            }}
                            onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() =>
                              router.push(`/admin/appointments/${appointment.id}/edit`)
                            }
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <AssignmentIcon sx={{ color: '#d62828' }} />
          Quick Actions
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: 'rgba(20, 20, 20, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
                  borderColor: 'rgba(214, 40, 40, 0.3)',
                },
              }}
              onClick={() => router.push('/admin/appointments/new')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(214, 40, 40, 0.15)',
                    color: '#d62828',
                    p: 1.5,
                    borderRadius: 2,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EventIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#d62828', fontWeight: 'bold' }}>
                  Schedule New Appointment
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                Create a new tattoo session for a client. Schedule time, set deposit amounts, and
                manage session details.
              </Typography>

              <Box
                sx={{
                  mt: 'auto',
                  textAlign: 'center',
                  py: 1.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(214, 40, 40, 0.1)',
                  color: '#d62828',
                  fontWeight: 'medium',
                  border: '1px dashed rgba(214, 40, 40, 0.3)',
                }}
              >
                <Typography variant="body2">Click to Schedule</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: 'rgba(20, 20, 20, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                },
              }}
              onClick={() => router.push('/admin/clients/new')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    p: 1.5,
                    borderRadius: 2,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmojiPeopleIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                  Add New Client
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                Register a new client with their contact details, preferences, and tattoo style
                interests for your studio.
              </Typography>

              <Box
                sx={{
                  mt: 'auto',
                  textAlign: 'center',
                  py: 1.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  fontWeight: 'medium',
                  border: '1px dashed rgba(59, 130, 246, 0.3)',
                }}
              >
                <Typography variant="body2">Click to Register</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Footer note */}
      <Box
        sx={{ textAlign: 'center', py: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)', mt: 5 }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Ink 37 Studio Admin Dashboard • {new Date().getFullYear()} • Fernando's Tattoo Management
        </Typography>
      </Box>
    </DashboardLayout>
  );
}
