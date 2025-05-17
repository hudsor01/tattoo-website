'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Badge,
  CircularProgress,
  Stack,
  Button,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import {
  Notifications,
  NotificationsActive,
  MarkEmailRead,
  Delete,
  Event,
  Payment,
  Person,
  CheckCircle,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useNotifications } from '@/hooks/use-dashboard';

// Define types for component props
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  status: string;
  link: string;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  link: string;
}

interface RealtimeNotificationsProps {
  limit?: number;
  initialNotifications?: Notification[];
  initialActivity?: ActivityItem[];
}

/**
 * Real-time notifications component with tRPC
 */
export default function RealtimeNotifications({
  limit = 5,
  initialNotifications,
  initialActivity,
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity || []);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  // Fetch notifications if not provided
  const { data, isLoading, error, refetch } = useNotifications(
    { limit },
    {
      // Skip the query if initial data was provided
      enabled: !initialNotifications || !initialActivity,
      // When data is fetched, update state
      onSuccess: data => {
        if (data?.notifications) {
          setNotifications(data.notifications);
        }
        if (data?.activity) {
          setActivity(data.activity);
        }
      },
    },
  );

  // Set up Supabase realtime subscription for realtime updates
  useEffect(() => {
    const supabase = createClient();
    let subscription: ReturnType<typeof supabase.channel>;

    // Subscribe to changes in appointments, customers, payments, etc.
    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel('dashboard-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Appointment',
            },
            () => refetch(),
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Payment',
            },
            () => refetch(),
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'Customer',
            },
            () => refetch(),
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up subscription:', err);
      }
    };

    setupSubscription();

    // Cleanup
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [refetch, limit]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Format the date to be more readable
  const formatNotificationDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (err) {
      return dateStr;
    }
  };

  // Get icon for notification/activity based on type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Event fontSize="small" color="primary" />;
      case 'payment':
        return <Payment fontSize="small" color="success" />;
      case 'customer':
        return <Person fontSize="small" color="info" />;
      case 'completed':
        return <CheckCircle fontSize="small" color="success" />;
      default:
        return <Notifications fontSize="small" />;
    }
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Badge
              badgeContent={notifications.length}
              color="error"
              sx={{ mr: 1 }}
              invisible={notifications.length === 0}
            >
              {notifications.length > 0 ? (
                <NotificationsActive color="primary" />
              ) : (
                <Notifications />
              )}
            </Badge>
            <Typography variant="h6">Notifications & Activity</Typography>
          </Box>
        }
        action={
          <Button
            size="small"
            variant="text"
            onClick={() => router.push('/admin/dashboard/notifications')}
          >
            View All
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Upcoming" />
        <Tab label="Activity" />
      </Tabs>

      <CardContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            Error loading data: {error.message}
          </Typography>
        ) : activeTab === 0 ? (
          notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              No upcoming appointments or events.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {notifications.map(notification => (
                <Box
                  key={notification.id}
                  sx={{
                    position: 'relative',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 1,
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                  onClick={() => router.push(notification.link)}
                >
                  <Box display="flex">
                    <Box sx={{ mr: 1.5 }}>{getItemIcon(notification.type)}</Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {formatNotificationDate(notification.time)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          )
        ) : activity.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
            No recent activity.
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {activity.map(item => (
              <Box
                key={item.id}
                sx={{
                  position: 'relative',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  p: 1.5,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                }}
                onClick={() => router.push(item.link)}
              >
                <Box display="flex">
                  <Box sx={{ mr: 1.5 }}>{getItemIcon(item.type)}</Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {formatNotificationDate(item.time)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
