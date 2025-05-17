'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Tooltip,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MessageIcon from '@mui/icons-material/Message';
import PhotoIcon from '@mui/icons-material/Photo';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DataTable, StatusChip } from '@/app/admin-dashboard/components/data-table';
import Grid from '@/components/ui/mui-grid';

// Define Appointment type locally if not exported from supabase-types
export type Appointment = {
  id: string;
  customerId: string;
  clientName: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  depositPaid: boolean;
  depositAmount: number;
  price: number;
  tattooStyle: string;
  description: string;
};

// Define AppointmentFormDialogProps
interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
  initialData: Partial<Appointment> | null;
  customers: Array<{ id: string; name: string }>;
}

// --- Reusable Styles ---
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

// Status options
const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

// Tattoo style options
const TATTOO_STYLES = [
  'Japanese',
  'Traditional',
  'Blackwork',
  'Realism',
  'Watercolor',
  'Tribal',
  'New School',
  'Fine Line',
  'Geometric',
  'Portrait',
  'Custom',
];

function AppointmentFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  customers,
}: AppointmentFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Appointment>>({});

  useEffect(() => {
    // Initialize form data when initialData changes (e.g., opening for edit or add)
    const defaultStartTime = new Date();
    defaultStartTime.setMinutes(Math.floor(defaultStartTime.getMinutes() / 15) * 15);
    const defaultEndTime = new Date(defaultStartTime);
    defaultEndTime.setHours(defaultEndTime.getHours() + 2);

    setFormData(
      initialData || {
        customerId: '',
        title: '',
        startTime: defaultStartTime.toISOString(),
        endTime: defaultEndTime.toISOString(),
        status: 'scheduled',
        depositPaid: false,
        depositAmount: 0,
        price: 0,
        tattooStyle: '',
        description: '',
      },
    );
  }, [initialData, open]); // Re-initialize when dialog opens or initial data changes

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // Explicitly cast for checked property

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'depositAmount' || name === 'price'
            ? Number(value) || 0
            : value,
    }));
  };

  // Handle date changes for DateTimePicker
  const handleDateChange = (name: string, value: Date | null) => {
    if (value) {
      setFormData(prev => ({ ...prev, [name]: value.toISOString() }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission if wrapped in <form>
    await onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        {initialData?.id ? 'Edit Appointment' : 'Schedule New Appointment'}
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Wrap content in a form for potential semantic benefits and accessibility */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Customer Selection */}
            <Grid item xs={12} md={6}>
              <TextField
                name="customerId"
                label="Select Customer"
                select
                value={formData.customerId || ''}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                sx={inputSx}
              >
                {customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Appointment Title */}
            <Grid item xs={12} md={6}>
              <TextField
                name="title"
                label="Appointment Title"
                value={formData.title || ''}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                sx={inputSx}
              />
            </Grid>

            {/* Start Time */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.startTime ? new Date(formData.startTime) : null}
                  onChange={newValue => handleDateChange('startTime', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      required: true,
                      sx: inputSx,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* End Time */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Time"
                  value={formData.endTime ? new Date(formData.endTime) : null}
                  onChange={newValue => handleDateChange('endTime', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      required: true,
                      sx: inputSx,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <TextField
                name="status"
                label="Appointment Status"
                select
                value={formData.status || 'scheduled'}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                margin="normal"
                sx={inputSx}
              >
                {STATUS_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Tattoo Style */}
            <Grid item xs={12} md={6}>
              <TextField
                name="tattooStyle"
                label="Tattoo Style"
                select
                value={formData.tattooStyle || ''}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                margin="normal"
                sx={inputSx}
              >
                {TATTOO_STYLES.map(style => (
                  <MenuItem key={style} value={style}>
                    {style}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Deposit Paid Checkbox */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="depositPaid"
                    checked={formData.depositPaid || false}
                    onChange={handleFormChange}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&.Mui-checked': {
                        color: '#d62828',
                      },
                    }}
                  />
                }
                label="Deposit Paid"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mt: 2, // Adjust margin as needed
                }}
              />
            </Grid>

            {/* Deposit Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                name="depositAmount"
                label="Deposit Amount"
                type="number"
                value={formData.depositAmount || ''}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                margin="normal"
                disabled={!formData.depositPaid}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Grid>

            {/* Total Price */}
            <Grid item xs={12} md={6}>
              <TextField
                name="price"
                label="Total Price"
                type="number"
                value={formData.price || ''}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Appointment Description"
                value={formData.description || ''}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                margin="normal"
                sx={inputSx}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', px: 3, py: 2 }}>
        <Button
          onClick={onClose}
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
          onClick={handleSubmit} // Trigger submit handler
          sx={{
            backgroundColor: '#d62828',
            '&:hover': {
              backgroundColor: '#b21e1e',
            },
          }}
        >
          {initialData?.id ? 'Update Appointment' : 'Schedule Appointment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Main Appointments Page Component ---
export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Partial<Appointment> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Custom toolbar actions
  const customToolbarActions = (
    <TextField
      select
      value={statusFilter}
      onChange={e => setStatusFilter(e.target.value)}
      variant="outlined"
      label="Status Filter"
      size="small"
      sx={{
        ...inputSx, // Use common input style
        minWidth: 150,
      }}
    >
      <MenuItem value="all">All Appointments</MenuItem>
      {STATUS_OPTIONS.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  // Fetch data
  const fetchData = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch appointments and customers in parallel
        const [appointmentsRes, customersRes] = await Promise.all([
          fetch(
            `/api/admin/appointments?${new URLSearchParams({
              params: {
                // Could add server-side filtering parameters here
                // status: statusFilter !== 'all' ? statusFilter : undefined,
                // searchTerm: searchValue || undefined,
              },
            }).toString()}`,
          ),
          fetch('/api/admin/customers'),
        ]);

        if (!appointmentsRes.ok) {
          throw new Error(`Failed to fetch appointments: ${appointmentsRes.statusText}`);
        }
        if (!customersRes.ok) {
          throw new Error(`Failed to fetch customers: ${customersRes.statusText}`);
        }

        const appointmentsResponse = await appointmentsRes.json();
        const clientsResponse = await customersRes.json();

        setAppointments(appointmentsResponse.data);
        setClients(clientsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load appointments. Please try again.');
        setLoading(false);
      }
    },
    [
      /* statusFilter, searchValue */
    ],
  ); // Add dependencies if implementing server-side filtering

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Filter appointments based on search value and status filter
  const filteredAppointments = appointments.filter(appointment => {
    // Status filter
    if (statusFilter !== 'all' && appointment.status !== statusFilter) {
      return false;
    }

    // Search filter
    return (
      appointment.clientName.toLowerCase().includes(searchValue.toLowerCase()) ||
      appointment.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      appointment.tattooStyle.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  // Handle view appointment
  const handleViewAppointment = (id: string | number) => {
    const appointment = appointments.find(a => a.id === String(id));
    if (appointment) {
      setEditingAppointment(appointment);
      setDialogOpen(true);
    }
  };

  // Handle edit appointment
  const handleEditAppointment = (id: string | number) => {
    const appointment = appointments.find(a => a.id === String(id));
    if (appointment) {
      // Pass the full appointment data to the dialog
      setEditingAppointment(appointment);
      setDialogOpen(true);
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete appointment');
        }
        setAppointments(appointments.filter(appointment => appointment.id !== String(id)));
        setLoading(false);
        // Optionally, show a success message
        // toast.success('Appointment deleted successfully');
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setError('Failed to delete appointment. Please try again.');
        setLoading(false);
      }
    }
  };

  // Handle add new appointment
  const handleAddAppointment = () => {
    setEditingAppointment(null); // Clear unknown previous editing data
    setDialogOpen(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAppointment(null); // Clear editing state on close
  };

  // Handle form submission
  const handleFormSubmit = async (formData: Partial<Appointment>) => {
    try {
      setLoading(true); // Indicate loading state

      // Find the customer object based on customerId
      const customer = customers.find(c => c.id === formData.customerId);
      if (!customer) {
        // Basic validation - enhance as needed
        alert('Please select a customer');
        setLoading(false);
        return;
      }

      if (editingAppointment?.id) {
        // --- EDIT LOGIC ---
        const res = await fetch(`/api/admin/appointments/${editingAppointment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update appointment');
        }
        const updatedAppointment = await res.json();

        setAppointments(prev =>
          prev.map(app => (app.id === editingAppointment.id ? updatedAppointment : app)),
        );
      } else {
        // --- ADD LOGIC ---
        const res = await fetch('/api/admin/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create appointment');
        }
        const newAppointment = await res.json();
        setAppointments(prev => [newAppointment, ...prev]); // Add to the beginning
      }

      // Close dialog after successful submission
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save appointment:', err);
      alert('Failed to save appointment');
      setError('Failed to save appointment. Please try again.'); // Set error state
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // Handle refresh action
  const handleRefresh = () => {
    fetchData(); // Re-fetch the data
  };

  // Handle pagination changes
  const handlePaginationChange = (page: number, pageSize: number) => {
    // In a real implementation, this would use pagination parameters for API calls
    // Example implementation for server-side pagination:
    /*
    const fetchPaginatedData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/appointments?${new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
          status: statusFilter !== 'all' ? statusFilter : '',
          search: searchValue || '',
        }).toString()}`);
        if (!res.ok) throw new Error('Failed to fetch paginated data');
        const data = await res.json();
        setAppointments(data.appointments); // Assuming API returns { appointments: [], total: ... }
        // setTotalRows(data.total); // If you have total rows for pagination component
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaginatedData();
    */
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start', // Align items to the top
          mb: 4,
          p: 3,
          backgroundColor: '#141414', // Darker background for the header
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            backgroundColor: 'rgba(214, 40, 40, 0.1)', // Red accent background
            color: '#d62828', // Red accent color
            borderRadius: '12px', // Slightly rounded square
            p: 1.5, // Adjusted padding
            mr: 2,
            display: 'flex', // Ensure icon is centered if needed
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EventIcon sx={{ fontSize: 32 }} />
        </Box>
        {/* Text Content */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            Tattoo Appointments
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Schedule and manage tattoo sessions, consultations, and follow-ups
          </Typography>
        </Box>
      </Box>

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

      {/* DataTable Component */}
      <DataTable
        rows={filteredAppointments}
        loading={loading}
        error={error}
        searchValue={searchValue}
        onSearch={handleSearch}
        onRefreshClick={handleRefresh}
        onAddClick={handleAddAppointment}
        onPaginationChange={handlePaginationChange}
        title="Appointments"
        searchPlaceholder="Search appointments..."
        customToolbarActions={customToolbarActions}
        columns={[
          {
            field: 'clientName',
            headerName: 'Customer',
            width: 180,
            renderCell: (params: {
              row: unknown;
              field: string | number | symbol;
              value: unknown;
            }) => {
              const clientName = (params.value as string | null | undefined) || '';
              return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(214, 40, 40, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      color: '#d62828',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                    }}
                  >
                    {clientName.charAt(0)}
                  </Box>
                  <Typography variant="body2">{clientName}</Typography>
                </Box>
              );
            },
          },
          {
            field: 'title',
            headerName: 'Appointment',
            flex: 1,
            minWidth: 200,
            renderCell: (params: {
              row: unknown;
              field: string | number | symbol;
              value: unknown;
            }) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {params.value as string}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {(params.row as Appointment).tattooStyle}
                </Typography>
              </Box>
            ),
          },
          {
            field: 'startTime',
            headerName: 'Date & Time',
            width: 170,
            renderCell: (params: {
              row: unknown;
              field: string | number | symbol;
              value: unknown;
            }) => {
              const value = params.value as string;
              const date = new Date(value);
              const formattedDate = date.toLocaleDateString();
              const formattedTime = date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <Box>
                  <Typography variant="body2">{formattedDate}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    {formattedTime}
                  </Typography>
                </Box>
              );
            },
          },
          {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: params => <StatusChip status={params.value as string} />,
          },
          {
            field: 'depositInfo',
            headerName: 'Deposit',
            width: 120,
            valueGetter: (params: { row: Appointment }) => {
              if (params.row.depositPaid) {
                return `$${params.row.depositAmount}`;
              }
              return 'Not paid';
            },
            renderCell: (params: { row: Appointment }) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {params.row.depositPaid ? (
                  <>
                    <CheckCircleIcon sx={{ color: '#10b981', mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">${params.row.depositAmount}</Typography>
                  </>
                ) : (
                  <Chip
                    label="Not paid"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontSize: '0.7rem',
                    }}
                  />
                )}
              </Box>
            ),
          },
          {
            field: 'price',
            headerName: 'Total Price',
            width: 120,
            valueFormatter: (params: { value: unknown }) => `$${Number(params.value)}`,
          },
        ]}
        actionColumn={{
          onView: handleViewAppointment,
          onEdit: handleEditAppointment,
          onDelete: handleDeleteAppointment,
          width: 180,
          renderCustomActions: (id: string | number) => (
            <Box display="flex">
              <Tooltip title="Upload design">
                <IconButton
                  size="small"
                  sx={{
                    color: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    },
                    mr: 0.5,
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/admin/designs/upload?appointment=${id}`);
                  }}
                >
                  <PhotoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Message customer">
                <IconButton
                  size="small"
                  sx={{
                    color: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    },
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    const appointment = appointments.find(a => a.id === String(id));
                    if (appointment) {
                      router.push(`/admin/messages/new?customer=${appointment.customerId}`);
                    }
                  }}
                >
                  <MessageIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ),
        }}
      />

      {/* Appointment Dialog */}
      <AppointmentFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        initialData={editingAppointment}
        customers={customers}
      />
    </Box>
  );
}
