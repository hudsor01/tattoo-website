'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/app/admin-dashboard/components/data-table';
import StatusBadge from '@/app/admin-dashboard/components/StatusBadge';
import { 
  CalendarDays, 
  DollarSign, 
  CheckCircle, 
  Camera, 
  MessageSquare 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission if wrapped in <form>
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to schedule a new appointment or update an existing one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Select Customer *</Label>
              <Select
                value={formData.customerId || ''}
                onValueChange={(value) => handleSelectChange('customerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Appointment Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Appointment Status</Label>
              <Select
                value={formData.status || 'scheduled'}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tattoo Style */}
            <div className="space-y-2">
              <Label htmlFor="tattooStyle">Tattoo Style</Label>
              <Select
                value={formData.tattooStyle || ''}
                onValueChange={(value) => handleSelectChange('tattooStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {TATTOO_STYLES.map(style => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deposit Paid Checkbox */}
            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="depositPaid"
                checked={formData.depositPaid || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, depositPaid: !!checked }))}
              />
              <Label htmlFor="depositPaid">Deposit Paid</Label>
            </div>

            {/* Deposit Amount */}
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Deposit Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="depositAmount"
                  name="depositAmount"
                  type="number"
                  value={formData.depositAmount || ''}
                  onChange={handleFormChange}
                  disabled={!formData.depositPaid}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Total Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Total Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={handleFormChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Appointment Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleFormChange}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData?.id ? 'Update Appointment' : 'Schedule Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
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
    <Select
      value={statusFilter}
      onValueChange={setStatusFilter}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Appointments</SelectItem>
        {STATUS_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
            `/api/admin/appointments?${new URLSearchParams(
              // Could add server-side filtering parameters here
              // status: statusFilter !== 'all' ? statusFilter : ,
              // searchTerm: searchValue || ,
            ).toString()}`,
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
  const handlePaginationChange = () => {
    // In a real implementation, this would use pagination parameters for API calls
    // Example implementation for server-side pagination:
    /*
    const fetchPaginatedData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/appointments?${new URLSearchParams({
          page: newPage.toString(),
          limit: '10', // Fixed page size
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
    <div className="p-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-start mb-8 p-6 bg-gray-900 rounded-lg shadow-lg">
        {/* Icon */}
        <div className="bg-red-500/10 text-red-500 rounded-lg p-3 mr-4 flex items-center justify-center">
          <CalendarDays className="h-8 w-8" />
        </div>
        {/* Text Content */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Tattoo Appointments
          </h1>
          <p className="text-gray-400">
            Schedule and manage tattoo sessions, consultations, and follow-ups
          </p>
        </div>
      </div>

      {/* Error Alert - Display error prominently if present */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-lg border-l-4 border-red-500 flex items-center">
          <p>{error}</p>
        </div>
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
              const clientName = (params.value as string | null) || '';
              return (
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center mr-3 text-red-500 font-bold text-sm">
                    {clientName.charAt(0)}
                  </div>
                  <span className="text-sm">{clientName}</span>
                </div>
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
              <div>
                <p className="text-sm font-medium">{params.value as string}</p>
                <p className="text-xs text-gray-500">
                  {(params.row as Appointment).tattooStyle}
                </p>
              </div>
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
                <div>
                  <p className="text-sm">{formattedDate}</p>
                  <p className="text-xs text-gray-500">{formattedTime}</p>
                </div>
              );
            },
          },
          {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params: {
              row: unknown;
              field: string | number | symbol;
              value: unknown;
            }) => {
              const status = params.value === 'pending' ? 'warning' : 
                            params.value === 'confirmed' ? 'success' :
                            params.value === 'completed' ? 'info' : 
                            params.value === 'cancelled' ? 'error' : 'info';
              return <StatusBadge status={status} text={params.value as string} />;
            },
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
              <div className="flex items-center">
                {params.row.depositPaid ? (
                  <>
                    <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    <span className="text-sm">${params.row.depositAmount}</span>
                  </>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Not paid
                  </Badge>
                )}
              </div>
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
          header: "Actions",
          onView: handleViewAppointment,
          onEdit: handleEditAppointment,
          onDelete: handleDeleteAppointment,
          width: 180,
          renderCustomActions: (id: string | number) => (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-green-500 hover:bg-green-500/10"
                onClick={e => {
                  e.stopPropagation();
                  router.push(`/admin/designs/upload?appointment=${id}`);
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-500 hover:bg-blue-500/10"
                onClick={e => {
                  e.stopPropagation();
                  const appointment = appointments.find(a => a.id === String(id));
                  if (appointment) {
                    router.push(`/admin/messages/new?customer=${appointment.customerId}`);
                  }
                }}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
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
    </div>
  );
}
