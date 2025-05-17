'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Paper,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import Grid from '@/components/ui/mui-grid';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import EventIcon from '@mui/icons-material/Event';
import { DataTable, StatusChip } from '@/app/admin-dashboard/components/data-table';

// Define Payment interface here instead of importing from potentially broken file
interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: string;
  type: string;
  date: string;
  method: string;
  appointmentId?: string;
  appointmentTitle?: string;
  notes?: string;
}

// Status options
const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
];

// Payment type options
const PAYMENT_TYPES = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'full', label: 'Full Payment' },
  { value: 'remaining', label: 'Remaining Balance' },
  { value: 'tip', label: 'Tip' },
];

// Payment method options
const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cashapp', label: 'Cash App' },
];

// Reusable form styles
const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#d62828',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
  '& .MuiSvgIcon-root, & .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [appointments, setAppointments] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [statsData, setStatsData] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalIncome: 0,
    countThisMonth: 0,
  });

  // Form fields for the payment
  const [formData, setFormData] = useState<Partial<Payment>>({
    clientId: '',
    amount: 0,
    status: 'pending',
    type: 'deposit',
    date: new Date().toISOString(),
    method: 'card',
    appointmentId: '',
    notes: '',
  });

  // Custom toolbar actions
  const customToolbarActions = (
    <TextField
      select
      value={filterType}
      onChange={e => setFilterType(e.target.value)}
      variant="outlined"
      label="Payment Type"
      size="small"
      sx={{
        minWidth: 150,
        ...inputSx,
      }}
    >
      <MenuItem value="all">All Payments</MenuItem>
      <MenuItem value="deposit">Deposits</MenuItem>
      <MenuItem value="full">Full Payments</MenuItem>
      <MenuItem value="remaining">Remaining Balances</MenuItem>
      <MenuItem value="tip">Tips</MenuItem>
    </TextField>
  );

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch payments, clients, and appointments in parallel
        const [paymentsRes, customersRes, appointmentsRes] = await Promise.all([
          fetch(
            `/api/admin/payments?${new URLSearchParams({
              params: {
                page: paginationModel.page,
                pageSize: paginationModel.pageSize,
                type: filterType !== 'all' ? filterType : undefined,
                search: searchValue ? searchValue : undefined,
              },
            }).toString()}`,
          ),
          fetch('/api/admin/customers'), // Changed from /api/admin/clients
          fetch('/api/admin/appointments'),
        ]);

        if (!paymentsRes.ok) {
          throw new Error(`Failed to fetch payments: ${paymentsRes.statusText}`);
        }
        if (!customersRes.ok) {
          throw new Error(`Failed to fetch customers: ${customersRes.statusText}`);
        }
        if (!appointmentsRes.ok) {
          throw new Error(`Failed to fetch appointments: ${appointmentsRes.statusText}`);
        }
        const paymentData = await paymentsRes.json();
        const customersResponse = await customersRes.json();
        const appointmentsResponse = await appointmentsRes.json();

        setPayments(paymentData);
        setCustomers(customersResponse.customers); // Assuming API returns { customers: [] }
        setAppointments(appointmentsResponse.appointments); // Assuming API returns { appointments: [] }

        // IMPORTANT: For production with large datasets, the stats should be calculated on the server
        // and returned as part of the API response to avoid client-side calculations and improve performance.
        // Example server-side implementation would return:
        // {
        //   data: [...payments],
        //   stats: { totalPaid, totalPending, totalIncome, countThisMonth }
        // }

        // Client-side stats calculation (ideally should be moved to server)
        const totalPaid = paymentData
          .filter((p: Payment) => p.status === 'paid')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);

        const totalPending = paymentData
          .filter((p: Payment) => p.status === 'pending')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);

        const totalIncome = paymentData
          .filter((p: Payment) => p.status === 'paid' && p.type !== 'refunded')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);

        // Current month payments
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const countThisMonth = paymentData.filter(
          (p: Payment) => new Date(p.date) >= startOfMonth && p.status === 'paid',
        ).length;

        setStatsData({
          totalPaid,
          totalPending,
          totalIncome,
          countThisMonth,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load payments. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [paginationModel.page, paginationModel.pageSize, filterType, searchValue]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Filter payments based on search value and type filter
  const filteredPayments = payments.filter(payment => {
    // Type filter
    if (filterType !== 'all' && payment.type !== filterType) {
      return false;
    }

    // Search filter
    return (
      payment.clientName.toLowerCase().includes(searchValue.toLowerCase()) ||
      (payment.appointmentTitle &&
        payment.appointmentTitle.toLowerCase().includes(searchValue.toLowerCase())) ||
      payment.id.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  // State for pagination
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Handle pagination changes
  const handlePaginationChange = (newModel: { page: number; pageSize: number }) => {
    // Simply update the pagination model state
    // The useEffect hook will handle the data fetching
    setPaginationModel(newModel);

    // No need to directly fetch data here, since this will trigger the useEffect
    // that depends on paginationModel.page and paginationModel.pageSize
  };

  // Handle view payment details
  const handleViewPayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      setSelectedPayment(payment);
      setDialogOpen(true);
    }
  };

  // Handle edit payment
  const handleEditPayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      setFormData(payment);
      setSelectedPayment(payment);
      setDialogOpen(true);
    }
  };

  // Handle delete payment
  const handleDeletePayment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/payments/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete payment');
        }
        setPayments(payments.filter(payment => payment.id !== id));
        setLoading(false);
        // Optionally, show a success message
        // toast.success('Payment deleted successfully');
      } catch (err) {
        console.error('Error deleting payment:', err);
        setError('Failed to delete payment. Please try again.');
        setLoading(false);
      }
    }
  };

  // Handle add new payment
  const handleAddPayment = () => {
    setFormData({
      clientId: '',
      amount: 0,
      status: 'pending',
      type: 'deposit',
      date: new Date().toISOString(),
      method: 'card',
      appointmentId: '',
      notes: '',
    });
    setSelectedPayment(null);
    setDialogOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
    } else if (name === 'clientId') {
      const client = clients.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        clientName: client ? client.name : '',
      }));
    } else if (name === 'appointmentId') {
      const appointment = appointments.find(a => a.id === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        appointmentTitle: appointment ? appointment.title : undefined,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle date change
  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (selectedPayment) {
        // Update existing payment
        const res = await fetch(`/api/admin/payments/${selectedPayment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update payment');
        }
        const updatedPayment = await res.json();

        setPayments(
          payments.map(payment => (payment.id === selectedPayment.id ? updatedPayment : payment)),
        );
      } else {
        // Add new payment
        const res = await fetch('/api/admin/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create payment');
        }
        const newPayment = await res.json();
        setPayments([newPayment, ...payments]);
      }

      // Close dialog after successful submission
      setDialogOpen(false);
      setLoading(false);
    } catch (err) {
      console.error('Failed to save payment:', err);
      alert('Failed to save payment. Please try again.');
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/payments?${new URLSearchParams({
          params: {
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
            type: filterType !== 'all' ? filterType : undefined,
            search: searchValue ? searchValue : undefined,
          },
        }).toString()}`,
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to refresh payments');
      }
      const responseData = await res.json();
      setPayments(responseData);

      // Recalculate stats
      const paymentData = responseData;
      const totalPaid = paymentData
        .filter((p: Payment) => p.status === 'paid')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);

      const totalPending = paymentData
        .filter((p: Payment) => p.status === 'pending')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);

      const totalIncome = paymentData
        .filter((p: Payment) => p.status === 'paid' && p.type !== 'refunded')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);

      // Current month payments
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const countThisMonth = paymentData.filter(
        (p: Payment) => new Date(p.date) >= startOfMonth && p.status === 'paid',
      ).length;

      setStatsData({
        totalPaid,
        totalPending,
        totalIncome,
        countThisMonth,
      });

      setLoading(false);
    } catch (err) {
      console.error('Error refreshing payments:', err);
      setError('Failed to refresh payments. Please try again.');
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format payment type
  const formatPaymentType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'full':
        return 'Full Payment';
      case 'remaining':
        return 'Remaining Balance';
      case 'tip':
        return 'Tip';
      default:
        return type;
    }
  };

  // Format payment method
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'card':
        return 'Credit Card';
      case 'cash':
        return 'Cash';
      case 'venmo':
        return 'Venmo';
      case 'paypal':
        return 'PayPal';
      case 'cashapp':
        return 'Cash App';
      default:
        return method;
    }
  };

  // Get method icon/color
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return { color: '#3b82f6', label: 'CC' };
      case 'cash':
        return { color: '#10b981', label: '$' };
      case 'venmo':
        return { color: '#1da1f2', label: 'VM' };
      case 'paypal':
        return { color: '#3b7bbf', label: 'PP' };
      case 'cashapp':
        return { color: '#00d632', label: 'CA' };
      default:
        return { color: '#d4d4d8', label: '?' };
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            backgroundColor: 'rgba(214, 40, 40, 0.1)',
            color: '#d62828',
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          <PaymentIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            Payment Tracking
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Monitor payments, deposits, and financial transactions
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderLeft: '4px solid #10b981',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
              TOTAL COLLECTED
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(statsData.totalPaid)}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Payments with "Paid" status
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderLeft: '4px solid #f59e0b',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
              PENDING PAYMENTS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
              {formatCurrency(statsData.totalPending)}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Payments awaiting processing
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
              TOTAL INCOME
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
              {formatCurrency(statsData.totalIncome)}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                All time business revenue
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderLeft: '4px solid #8b5cf6',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
              PAYMENTS THIS MONTH
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8b5cf6' }}>
              {statsData.countThisMonth}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Error Alert - Display error prominently if present */}
      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            borderRadius: 1,
            borderLeft: '4px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1">{error}</Typography>
        </Box>
      )}

      <DataTable
        rows={filteredPayments}
        loading={loading}
        error={error}
        searchValue={searchValue}
        onSearch={handleSearch}
        onRefreshClick={handleRefresh}
        onAddClick={handleAddPayment}
        onPaginationChange={handlePaginationChange}
        paginationModel={paginationModel}
        title="Payment History"
        searchPlaceholder="Search payments..."
        containerHeight={650}
        customToolbarActions={customToolbarActions}
        columns={[
          {
            field: 'id',
            headerName: 'Payment ID',
            width: 120,
            renderCell: params => (
              <Typography variant="body2">#{params.value.split('-')[1]}</Typography>
            ),
          },
          {
            field: 'clientName',
            headerName: 'Client',
            width: 180,
            renderCell: params => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(214, 40, 40, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    color: '#d62828',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                  }}
                >
                  {params.value.charAt(0)}
                </Box>
                <Typography variant="body2">{params.value}</Typography>
              </Box>
            ),
          },
          {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            renderCell: params => (
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {formatCurrency(params.value)}
              </Typography>
            ),
          },
          {
            field: 'method',
            headerName: 'Method',
            width: 120,
            renderCell: params => {
              const methodInfo = getMethodIcon(params.value);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: `${methodInfo.color}20`, // 20% opacity
                      color: methodInfo.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      mr: 1,
                    }}
                  >
                    {methodInfo.label}
                  </Box>
                  <Typography variant="body2">{formatPaymentMethod(params.value)}</Typography>
                </Box>
              );
            },
          },
          {
            field: 'type',
            headerName: 'Type',
            width: 150,
            renderCell: params => (
              <Typography variant="body2">{formatPaymentType(params.value)}</Typography>
            ),
          },
          {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: params => <StatusChip status={params.value} />,
          },
          {
            field: 'date',
            headerName: 'Date',
            width: 120,
            valueFormatter: params => {
              if (!params.value) return 'N/A';
              return new Date(params.value).toLocaleDateString();
            },
          },
          {
            field: 'appointmentTitle',
            headerName: 'Appointment',
            flex: 1,
            minWidth: 180,
            renderCell: params => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {params.value ? (
                  <>
                    <EventIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />
                    <Typography variant="body2">{params.value}</Typography>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}
                  >
                    No appointment
                  </Typography>
                )}
              </Box>
            ),
          },
        ]}
        actionColumn={{
          onView: handleViewPayment,
          onEdit: handleEditPayment,
          onDelete: handleDeletePayment,
          width: 120,
          renderCustomActions: () => (
            <Tooltip title="Print receipt">
              <IconButton
                size="small"
                sx={{
                  color: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  },
                }}
              >
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ),
        }}
      />

      {/* Payment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: '#141414',
            backgroundImage: 'none',
            color: 'white',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', px: 3, py: 2 }}>
          {selectedPayment ? 'Edit Payment' : 'Record New Payment'}
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="clientId"
                label="Select Client"
                select
                value={formData.clientId || ''}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                sx={inputSx}
              >
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="appointmentId"
                label="Related Appointment (Optional)"
                select
                value={formData.appointmentId || ''}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                margin="normal"
                sx={inputSx}
              >
                <MenuItem value="">No Appointment</MenuItem>
                {appointments.map(appt => (
                  <MenuItem key={appt.id} value={appt.id}>
                    {appt.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="amount"
                label="Payment Amount"
                type="number"
                value={formData.amount || ''}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#d62828',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="type"
                label="Payment Type"
                select
                value={formData.type || 'deposit'}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                sx={inputSx}
              >
                {PAYMENT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="method"
                label="Payment Method"
                select
                value={formData.method || 'card'}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                sx={inputSx}
              >
                {PAYMENT_METHODS.map(method => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="status"
                label="Payment Status"
                select
                value={formData.status || 'pending'}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                sx={inputSx}
              >
                {STATUS_OPTIONS.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="date"
                label="Payment Date"
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={e => handleDateChange(new Date(e.target.value).toISOString())}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={inputSx}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes (Optional)"
                value={formData.notes || ''}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#d62828',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', px: 3, py: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: '#d62828',
              '&:hover': {
                backgroundColor: '#b21e1e',
              },
            }}
          >
            {selectedPayment ? 'Update Payment' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
