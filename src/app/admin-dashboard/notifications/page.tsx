'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Button,
  Chip,
  Badge,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'appointment',
    title: 'New Appointment Request',
    message: 'Maria Rodriguez requested a tattoo consultation for next week.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    read: false,
    actionUrl: '/admin/appointments',
  },
  {
    id: 'notif-2',
    type: 'payment',
    title: 'Payment Received',
    message: 'John Smith paid a $150 deposit for his upcoming tattoo session.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    read: true,
    actionUrl: '/admin/payments',
  },
  {
    id: 'notif-3',
    type: 'client',
    title: 'New Client Registration',
    message: 'Emily Davis created a new client account.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: false,
    actionUrl: '/admin/clients',
  },
  {
    id: 'notif-4',
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'You have a tattoo session with Mike Chang tomorrow at 2:00 PM.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
    actionUrl: '/admin/appointments',
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'System Update',
    message: 'The admin dashboard has been updated with new features.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    read: true,
    actionUrl: null,
  },
  {
    id: 'notif-6',
    type: 'payment',
    title: 'Payment Reminder',
    message: "Sophie Martin's payment for her tattoo session is due tomorrow.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    read: false,
    actionUrl: '/admin/payments',
  },
  {
    id: 'notif-7',
    type: 'client',
    title: 'Client Message',
    message: 'James Wilson sent a message about his upcoming appointment.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    read: true,
    actionUrl: '/admin/clients',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map(notif => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 0) return true; // All notifications
    if (activeTab === 1) return !notif.read; // Unread notifications
    if (activeTab === 2) return notif.type === 'appointment';
    if (activeTab === 3) return notif.type === 'payment';
    if (activeTab === 4) return notif.type === 'client';
    return true;
  });

  // Format relative time (today, yesterday, or date)
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Just now';
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      return date.toLocaleDateString();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <EventIcon />;
      case 'payment':
        return <PaymentIcon />;
      case 'client':
        return <PersonIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Get notification icon color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return '#3b82f6'; // blue
      case 'payment':
        return '#10b981'; // green
      case 'client':
        return '#f59e0b'; // amber
      default:
        return '#6366f1'; // indigo
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#6366f1',
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ fontSize: 32 }} />
          </Badge>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            Notifications
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Stay updated with client activity and system alerts
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ backgroundColor: 'rgba(20, 20, 20, 0.7)', borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#6366f1',
              },
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.5)',
                '&.Mui-selected': {
                  color: '#6366f1',
                },
              },
            }}
          >
            <Tab label={`All (${notifications.length})`} sx={{ py: 2 }} />
            <Tab label={`Unread (${unreadCount})`} sx={{ py: 2 }} />
            <Tab
              label="Appointments"
              icon={<EventIcon fontSize="small" />}
              iconPosition="start"
              sx={{ py: 2 }}
            />
            <Tab
              label="Payments"
              icon={<PaymentIcon fontSize="small" />}
              iconPosition="start"
              sx={{ py: 2 }}
            />
            <Tab
              label="Clients"
              icon={<PersonIcon fontSize="small" />}
              iconPosition="start"
              sx={{ py: 2 }}
            />
          </Tabs>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
            borderBottom: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Button
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            sx={{
              mr: 1,
              color: '#6366f1',
              borderColor: 'rgba(99, 102, 241, 0.5)',
              '&:hover': {
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
              },
            }}
            variant="outlined"
          >
            Mark All as Read
          </Button>
          <Button
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            sx={{
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              '&:hover': {
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
            variant="outlined"
          >
            Clear All
          </Button>
        </Box>

        {filteredNotifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 2,
                    pl: 3,
                    pr: 8,
                    backgroundColor: notification.read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${getNotificationColor(notification.type)}20`,
                        color: getNotificationColor(notification.type),
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 'medium', color: 'white' }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              color: '#6366f1',
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              fontWeight: 'bold',
                              fontSize: '0.6rem',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: 'rgba(255, 255, 255, 0.8)', my: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <AccessTimeIcon
                            sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', mr: 0.5 }}
                          />
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {formatRelativeTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {notification.actionUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => (window.location.href = notification.actionUrl!)}
                        sx={{
                          mr: 1,
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          },
                        }}
                      >
                        View
                      </Button>
                    )}
                    {!notification.read && (
                      <IconButton
                        edge="end"
                        onClick={() => handleMarkAsRead(notification.id)}
                        sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        <DoneAllIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteNotification(notification.id)}
                      sx={{ color: 'rgba(255, 255, 255, 0.5)', ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredNotifications.length - 1 && (
                  <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
            }}
          >
            <NotificationsIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              No notifications to display
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.3)', mt: 1 }}>
              {activeTab === 0
                ? 'You don&apos;t have any notifications at the moment'
                : activeTab === 1
                  ? 'You don&apos;t have any unread notifications'
                  : 'No notifications in this category'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
