'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Booking } from '@/types/booking-types';
import {
  CircularProgress,
  Typography,
  InputAdornment,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Link,
  TablePagination,
  useTheme,
  TextField,
} from '@mui/material';
import Grid from '@/components/ui/mui-grid';
import { Box, Stack } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/PendingIcon';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import { Button, IconButton } from '@mui/material';

export default function BookingsSection() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/bookings');
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle verifying a deposit
  const handleVerifyDeposit = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/verify-deposit`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to verify deposit');
      }

      // Update the local state to reflect the change
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? { ...booking, depositPaid: true } : booking
        )
      );

      // If the selected booking is the one being updated, update it too
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          depositPaid: true,
        });
      }
    } catch (err) {
      console.error('Error verifying deposit:', err instanceof Error ? err.message : String(err));
      // You could set an error state here if you want to show a message to the user
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(
    booking =>
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.tattooType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current page of bookings
  const displayedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          py: 3,
          px: 4,
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          borderRadius: 2,
          border: '1px solid rgba(211, 47, 47, 0.3)',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          No bookings found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Table Header with Search & Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search tattoo sessions..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              backgroundColor:
                theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              '& fieldset': {
                borderColor:
                  theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
              },
              '&:hover fieldset': {
                borderColor:
                  theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
              },
              '&.Mui-focused fieldset': { borderColor: '#E53935' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color:
                      theme.palette.mode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
                  }}
                />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{
            borderColor:
              theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
            color: theme.palette.mode === 'light' ? '#333' : '#fff',
            '&:hover': {
              borderColor:
                theme.palette.mode === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
              backgroundColor:
                theme.palette.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
            },
          }}
        >
          Filter
        </Button>
      </Box>

      {/* Bookings Table */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          mb: 2,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color:
                    theme.palette.mode === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                  borderBottom:
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(0,0,0,0.1)'
                      : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Client
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color:
                    theme.palette.mode === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                  borderBottom:
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(0,0,0,0.1)'
                      : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Tattoo Date
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color:
                    theme.palette.mode === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                  borderBottom:
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(0,0,0,0.1)'
                      : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Tattoo Style
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'medium',
                  color:
                    theme.palette.mode === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                  borderBottom:
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(0,0,0,0.1)'
                      : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Deposit
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'medium',
                  color:
                    theme.palette.mode === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                  borderBottom:
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(0,0,0,0.1)'
                      : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedBookings.map(booking => (
              <TableRow
                key={booking.id}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'light'
                        ? 'rgba(0,0,0,0.03)'
                        : 'rgba(255,255,255,0.03)',
                  },
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  borderBottom:
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(0,0,0,0.05)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                }}
                onClick={() => handleViewBooking(booking)}
              >
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                    color: theme.palette.mode === 'light' ? '#333' : '#fff',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#E53935',
                        mr: 2,
                      }}
                    >
                      {booking.clientName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {booking.clientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.clientPhone}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                    color: theme.palette.mode === 'light' ? '#333' : '#fff',
                  }}
                >
                  <Typography variant="body2">
                    {booking.preferredDate && new Date(booking.preferredDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {booking.preferredTime}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                    color: theme.palette.mode === 'light' ? '#333' : '#fff',
                  }}
                >
                  <Typography variant="body2">{booking.tattooType}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {booking.tattooSize} - {booking.placement}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                    color: theme.palette.mode === 'light' ? '#333' : '#fff',
                  }}
                >
                  {booking.depositPaid ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Paid"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(46, 125, 50, 0.2)',
                        color: '#4caf50',
                        fontWeight: 'medium',
                        '& .MuiChip-icon': {
                          color: '#4caf50',
                        },
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<PendingIcon />}
                      label="Pending"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(211, 47, 47, 0.2)',
                        color: '#f44336',
                        fontWeight: 'medium',
                        '& .MuiChip-icon': {
                          color: '#f44336',
                        },
                      }}
                    />
                  )}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottom: 'none',
                    py: 2,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {!booking.depositPaid && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: '#388e3c',
                          '&:hover': {
                            bgcolor: '#2e7d32',
                          },
                          textTransform: 'none',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          handleVerifyDeposit(Number(booking.id));
                        }}
                      >
                        Verify Deposit
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredBookings.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '.MuiTablePagination-toolbar': {
            color: 'rgba(255,255,255,0.7)',
          },
          '.MuiTablePagination-selectIcon': {
            color: 'rgba(255,255,255,0.7)',
          },
          '.MuiTablePagination-actions': {
            color: 'rgba(255,255,255,0.7)',
          },
        }}
      />

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1A1A1A',
            color: '#fff',
            borderRadius: 2,
            backgroundImage: 'none',
          },
        }}
      >
        {selectedBooking && (
          <>
            <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                  Booking Details
                </Typography>
                <Chip
                  label={`ID: ${selectedBooking.id}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                />
              </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 3 }}>
              {/* Client Information */}
              <Paper
                sx={{
                  mb: 3,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  backgroundImage: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: '#E53935',
                        mr: 2,
                      }}
                    >
                      {selectedBooking.clientName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        {selectedBooking.clientName}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {selectedBooking.depositPaid ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Deposit Paid"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(46, 125, 50, 0.2)',
                              color: '#4caf50',
                              fontWeight: 'medium',
                              '& .MuiChip-icon': {
                                color: '#4caf50',
                              },
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<PendingIcon />}
                            label="Deposit Pending"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(211, 47, 47, 0.2)',
                              color: '#f44336',
                              fontWeight: 'medium',
                              '& .MuiChip-icon': {
                                color: '#f44336',
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <EmailIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                    <Typography variant="body2">
                      <Link
                        href={`mailto:${selectedBooking.clientEmail}`}
                        color="inherit"
                        underline="hover"
                      >
                        {selectedBooking.clientEmail}
                      </Link>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <PhoneIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                    <Typography variant="body2">{selectedBooking.clientPhone}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                    <Typography variant="body2">
                      {selectedBooking.preferredDate && 
                        new Date(selectedBooking.preferredDate).toLocaleDateString()} (
                      {selectedBooking.preferredTime})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Created:
                    </Typography>
                    <Typography variant="body2">
                      {selectedBooking.createdAt && 
                        new Date(selectedBooking.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      height: '100%',
                      bgcolor: 'rgba(0,0,0,0.2)',
                      backgroundImage: 'none',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        gutterBottom
                        display="block"
                      >
                        TATTOO TYPE
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedBooking.tattooType}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        variant="caption"
                        gutterBottom
                        display="block"
                      >
                        SIZE
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedBooking.tattooSize}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        variant="caption"
                        gutterBottom
                        display="block"
                      >
                        PLACEMENT
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedBooking.placement}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      height: '100%',
                      bgcolor: 'rgba(0,0,0,0.2)',
                      backgroundImage: 'none',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Typography
                        color="text.secondary"
                        variant="caption"
                        gutterBottom
                        display="block"
                      >
                        DESCRIPTION
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedBooking.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
              <Button
                onClick={() => setDetailsDialogOpen(false)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Close
              </Button>
              {!selectedBooking.depositPaid && (
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#388e3c',
                    '&:hover': {
                      bgcolor: '#2e7d32',
                    },
                  }}
                  onClick={() => handleVerifyDeposit(Number(selectedBooking.id))}
                >
                  Verify Deposit
                </Button>
              )}
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#E53935',
                  '&:hover': {
                    bgcolor: '#d32f2f',
                  },
                }}
              >
                Contact Client
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
