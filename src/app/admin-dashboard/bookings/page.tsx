'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { format } from 'date-fns';
import { VirtualizedBookingsList } from '@/app/admin-dashboard/components/VirtualizedBookingsList';
import { Booking } from '@/types/booking-types';

export default function BookingsPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Get the status based on tab index
  const getStatusFilter = () => {
    switch (selectedTab) {
      case 0:
        return null; // All
      case 1:
        return 'pending';
      case 2:
        return 'paid';
      default:
        return null;
    }
  };

  // Handle viewing booking details
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          mb: 4,
          p: 3,
          backgroundColor: '#141414',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(214, 40, 40, 0.1)',
            color: '#d62828',
            borderRadius: '12px',
            p: 1.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EventNoteIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            Booking Requests
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Manage tattoo booking requests and convert them to appointments
          </Typography>
        </Box>
      </Box>

      {/* Filters & Tabs */}
      <Box sx={{ mb: 3, backgroundColor: '#141414', p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#d62828',
              },
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                '&.Mui-selected': {
                  color: '#d62828',
                },
              },
            }}
          >
            <Tab label="All Bookings" />
            <Tab label="Pending Deposit" />
            <Tab label="Deposit Paid" />
          </Tabs>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Filter by date"
              value={dateFilter}
              onChange={newValue => setDateFilter(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {/* Virtualized Bookings List */}
      <VirtualizedBookingsList defaultStatus={getStatusFilter()} containerHeight={650} />

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#141414',
              color: 'white',
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', px: 3, py: 2 }}>
            Booking Details
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  flex: 2,
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: '#d62828' }}>
                  Customer Information
                </Typography>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    Name:
                  </Typography>
                  <Typography variant="body2">{selectedBooking.clientName}</Typography>
                </Box>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    Email:
                  </Typography>
                  <Typography variant="body2">{selectedBooking.clientEmail}</Typography>
                </Box>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    Phone:
                  </Typography>
                  <Typography variant="body2">{selectedBooking.clientPhone}</Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 2,
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: '#d62828' }}>
                  Booking Details
                </Typography>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    Tattoo Type:
                  </Typography>
                  <Typography variant="body2">{selectedBooking.tattooType}</Typography>
                </Box>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    Size:
                  </Typography>
                  <Typography variant="body2">{selectedBooking.tattooSize}</Typography>
                </Box>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    Placement:
                  </Typography>
                  <Typography variant="body2">{selectedBooking.placement}</Typography>
                </Box>

                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    Status:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: selectedBooking.depositPaid ? '#10b981' : '#ef4444',
                      fontWeight: 'medium',
                    }}
                  >
                    {selectedBooking.depositPaid ? 'Deposit Paid' : 'Pending Deposit'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: '#d62828' }}>
                Schedule Information
              </Typography>

              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Preferred Date:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, mr: 1, color: 'rgba(255, 255, 255, 0.5)' }}
                    />
                    <Typography variant="body2">
                      {selectedBooking.preferredDate &&
                        format(new Date(selectedBooking.preferredDate), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Preferred Time:
                  </Typography>
                  <Typography variant="body2">{selectedBooking.preferredTime}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Booking Date:
                  </Typography>
                  <Typography variant="body2">
                    {selectedBooking.createdAt &&
                      format(new Date(selectedBooking.createdAt), 'MMMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: '#d62828' }}>
                Tattoo Description
              </Typography>

              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {selectedBooking.description}
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', px: 3, py: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setDialogOpen(false)}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Close
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                setDialogOpen(false);
                router.push(`/admin/dashboard/appointments/create?bookingId=${selectedBooking.id}`);
              }}
              sx={{
                backgroundColor: '#d62828',
                '&:hover': {
                  backgroundColor: '#b21e1e',
                },
              }}
            >
              Convert to Appointment
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
