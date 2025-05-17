'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Avatar,
  Button,
  IconButton,
  Stack,
  Card,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid } from '@/app/admin-dashboard/components/ToolpadComponents';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Payment, PaginationModel } from '@/types';

export default function PaymentsSection() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'all' | 'client'>('all');
  const [selectedClient, setSelectedClient] = useState<{ email: string; name: string } | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async (clientEmailOverride?: string) => {
    setIsLoading(true);
    try {
      // Use the real API implementation
      let url = '/api/admin/payments';
      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (clientEmailOverride || (currentView === 'client' && selectedClient)) {
        params.append('clientEmail', clientEmailOverride || selectedClient?.email || '');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: number) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      // Refresh payments list with updated status
      const updatedPayments = payments.map(payment =>
        payment.id === paymentId ? { ...payment, status: 'verified' } : payment,
      );
      setPayments(updatedPayments);

      // Close dialog if open
      if (detailsDialogOpen && selectedPayment?.id === paymentId) {
        setDetailsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment. Please try again.');
    }
  };

  const handlePaginationModelChange = (model: PaginationModel) => {
    setPage(model.page);
    setRowsPerPage(model.pageSize);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  // Reset to all payments view
  const handleResetView = () => {
    setCurrentView('all');
    setSelectedClient(null);
    setSearchQuery('');
    fetchPayments();
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter(
    payment =>
      (payment.booking?.name || payment.customerName || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.description || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get current page of payments
  const displayedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
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

  return (
    <Box>
      {/* Header with status filter and search */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl
            sx={{
              width: 180,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#E53935' },
              },
            }}
            size="small"
          >
            <InputLabel id="status-filter-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Payment Status
            </InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as string)}
              label="Payment Status"
              sx={{ color: 'white' }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="completed">Verified</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          {currentView === 'client' && selectedClient && (
            <Chip
              label={`Client: ${selectedClient.name || selectedClient.email}`}
              onDelete={handleResetView}
              sx={{
                ml: 2,
                bgcolor: 'rgba(229, 57, 53, 0.2)',
                color: '#fff',
                '& .MuiChip-deleteIcon': {
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: '#fff' },
                },
              }}
            />
          )}
        </Box>

        <TextField
          placeholder="Search payments..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&.Mui-focused fieldset': { borderColor: '#E53935' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Payments Table with DataGrid */}
      <Box sx={{ height: 500, width: '100%', mb: 3 }}>
        <DataGrid
          rows={filteredPayments}
          columns={[
            { field: 'id', headerName: 'ID', width: 80 },
            {
              field: 'customer',
              headerName: 'Customer',
              width: 250,
              valueGetter: params => params.row.booking?.name || params.row.customerName,
              renderCell: params => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#E53935',
                      mr: 2,
                    }}
                  >
                    {(params.row.booking?.name || params.row.customerName || '?').charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {params.row.booking?.name || params.row.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {params.row.customerEmail}
                    </Typography>
                  </Box>
                </Box>
              ),
            },
            {
              field: 'description',
              headerName: 'Description',
              width: 200,
              valueGetter: params =>
                params.row.description ||
                (params.row.metadata?.is_deposit ? 'Deposit Payment' : 'Payment'),
            },
            {
              field: 'amount',
              headerName: 'Amount',
              width: 120,
              valueFormatter: params => `$${Number(params.value).toFixed(2)}`,
            },
            {
              field: 'paymentMethod',
              headerName: 'Method',
              width: 120,
              valueFormatter: params =>
                params.value.charAt(0).toUpperCase() + params.value.slice(1),
            },
            {
              field: 'status',
              headerName: 'Status',
              width: 130,
              renderCell: params => {
                return params.value === 'verified' ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Verified"
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
                ) : params.value === 'pending' ? (
                  <Chip
                    icon={<PendingIcon />}
                    label="Pending"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(245, 124, 0, 0.2)',
                      color: '#f57c00',
                      fontWeight: 'medium',
                      '& .MuiChip-icon': {
                        color: '#f57c00',
                      },
                    }}
                  />
                ) : (
                  <Chip
                    icon={<ErrorIcon />}
                    label="Failed"
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
                );
              },
            },
            {
              field: 'createdAt',
              headerName: 'Date',
              width: 120,
              valueFormatter: params => new Date(params.value).toLocaleDateString(),
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 120,
              sortable: false,
              renderCell: params => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {params.row.status === 'pending' && (
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
                        handleVerifyPayment(params.row.id);
                      }}
                    >
                      Verify
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
              ),
            },
          ]}
          paginationModel={{ pageSize: rowsPerPage, page }}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[5, 10, 25]}
          onRowClick={params => handleViewDetails(params.row)}
          getRowId={row => row.id}
          disableColumnFilter
          disableColumnSelector
          sx={{
            '& .MuiDataGrid-root': {
              backgroundColor: 'transparent',
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: 'rgba(255, 255, 255, 0.7)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </Box>

      {/* Payment Details Dialog */}
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
        {selectedPayment && (
          <>
            <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                  Payment Details
                </Typography>
                <Chip
                  label={`ID: ${selectedPayment.id}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                />
              </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 3 }}>
              {/* Payment Information Card */}
              <Card
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
                      {(
                        selectedPayment.booking?.name ||
                        selectedPayment.customerName ||
                        '?'
                      ).charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        {selectedPayment.booking?.name || selectedPayment.customerName}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {selectedPayment.status === 'verified' ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Payment Verified"
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
                        ) : selectedPayment.status === 'pending' ? (
                          <Chip
                            icon={<PendingIcon />}
                            label="Payment Pending"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(245, 124, 0, 0.2)',
                              color: '#f57c00',
                              fontWeight: 'medium',
                              '& .MuiChip-icon': {
                                color: '#f57c00',
                              },
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<ErrorIcon />}
                            label="Payment Failed"
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

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 50%', minWidth: '250px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <EmailIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="body2">
                          <a
                            href={`mailto:${selectedPayment.customerEmail}`}
                            style={{ color: '#E53935', textDecoration: 'none' }}
                          >
                            {selectedPayment.customerEmail}
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: '1 1 50%', minWidth: '250px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <AttachMoneyIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${selectedPayment.amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          via {selectedPayment.paymentMethod}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: '1 1 50%', minWidth: '250px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="body2">
                          {new Date(selectedPayment.createdAt).toLocaleDateString()}
                          {new Date(selectedPayment.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: '1 1 50%', minWidth: '250px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ReceiptIcon sx={{ mr: 1.5, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="body2">
                          {selectedPayment.metadata?.is_deposit
                            ? 'Deposit Payment'
                            : 'Regular Payment'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Card>

              {/* Payment Details */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', mt: 2 }}>
                Payment Details
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Card
                  sx={{
                    width: '100%',
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
                      {selectedPayment.description || 'No description provided'}
                    </Typography>

                    {selectedPayment.booking && (
                      <>
                        <Typography
                          color="text.secondary"
                          variant="caption"
                          gutterBottom
                          display="block"
                        >
                          RELATED BOOKING
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Booking #{selectedPayment.booking.id} -{' '}
                          {new Date(selectedPayment.booking.preferredDate).toLocaleDateString()}
                        </Typography>
                      </>
                    )}

                    {selectedPayment.metadata &&
                      Object.keys(selectedPayment.metadata).length > 0 && (
                        <>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                            gutterBottom
                            display="block"
                          >
                            ADDITIONAL INFORMATION
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              backgroundColor: 'rgba(0,0,0,0.3)',
                              borderRadius: 1,
                              fontFamily: 'monospace',
                              fontSize: 14,
                            }}
                          >
                            {Object.entries(selectedPayment.metadata).map(([key, value]) => (
                              <Box key={key} sx={{ mb: 0.5 }}>
                                <Typography
                                  component="span"
                                  sx={{ color: 'rgba(255,255,255,0.6)' }}
                                >
                                  {key}:
                                </Typography>{' '}
                                <Typography component="span">
                                  {typeof value === 'boolean'
                                    ? value
                                      ? 'Yes'
                                      : 'No'
                                    : String(value)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </>
                      )}
                  </Box>
                </Card>
              </Box>
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
              {selectedPayment.status === 'pending' && (
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#388e3c',
                    '&:hover': {
                      bgcolor: '#2e7d32',
                    },
                  }}
                  onClick={() => handleVerifyPayment(selectedPayment.id)}
                >
                  Verify Payment
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
