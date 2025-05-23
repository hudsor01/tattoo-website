'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminDataTable from '@/components/admin/AdminDataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { 
  CalendarDays, 
  DollarSign, 
  CheckCircle, 
  Camera, 
  MessageSquare,
  Download
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
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';
import { AppointmentStatus } from '@/types/enum-types';
import type { CustomerType, AppointmentType } from '@/types/booking-types';

interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<AppointmentType>) => Promise<void>;
  initialData: Partial<AppointmentType> | null;
  customers: CustomerType[];
}

const STATUS_OPTIONS = [
  { value: AppointmentStatus.SCHEDULED, label: 'Scheduled' },
  { value: AppointmentStatus.CONFIRMED, label: 'Confirmed' },
  { value: AppointmentStatus.COMPLETED, label: 'Completed' },
  { value: AppointmentStatus.CANCELLED, label: 'Cancelled' },
  { value: AppointmentStatus.NO_SHOW, label: 'No Show' },
];

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
  const [formData, setFormData] = useState<Partial<AppointmentType>>({});

  React.useEffect(() => {
    const defaultStartTime = new Date();
    defaultStartTime.setMinutes(Math.floor(defaultStartTime.getMinutes() / 15) * 15);
    const defaultEndTime = new Date(defaultStartTime);
    defaultEndTime.setHours(defaultEndTime.getHours() + 2);

    setFormData(
      initialData || {
        customerId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        appointmentDate: defaultStartTime,
        duration: 120,
        status: AppointmentStatus.SCHEDULED,
        depositPaid: false,
        depositAmount: 0,
        totalPrice: 0,
        tattooStyle: '',
        description: '',
        location: '',
        size: '',
      },
    );
  }, [initialData, open]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: Partial<AppointmentType>) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'depositAmount' || name === 'totalPrice' || name === 'duration'
            ? Number(value) || 0
            : name === 'appointmentDate'
              ? new Date(value)
              : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: Partial<AppointmentType>) => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData((prev: Partial<AppointmentType>) => ({
        ...prev,
        customerId,
        clientName: `${customer.firstName} ${customer.lastName}`,
        clientEmail: customer.email || '',
        clientPhone: customer.phone || '',
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
            <div className="space-y-2">
              <Label htmlFor="customerId">Select Customer *</Label>
              <Select
                value={formData.customerId || ''}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Appointment Date & Time *</Label>
              <Input
                id="appointmentDate"
                name="appointmentDate"
                type="datetime-local"
                value={formData.appointmentDate ? format(new Date(formData.appointmentDate), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration || ''}
                onChange={handleFormChange}
                required
                min="30"
                step="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Appointment Status</Label>
              <Select
                value={formData.status || AppointmentStatus.SCHEDULED}
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

            <div className="space-y-2">
              <Label htmlFor="size">Tattoo Size</Label>
              <Input
                id="size"
                name="size"
                value={formData.size || ''}
                onChange={handleFormChange}
                placeholder="e.g., 4x6 inches, palm-sized"
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="depositPaid"
                checked={formData.depositPaid || false}
                onCheckedChange={(checked) => 
                  setFormData((prev: Partial<AppointmentType>) => ({ ...prev, depositPaid: !!checked }))}
              />
              <Label htmlFor="depositPaid">Deposit Paid</Label>
            </div>

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
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice">Total Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="totalPrice"
                  name="totalPrice"
                  type="number"
                  value={formData.totalPrice || ''}
                  onChange={handleFormChange}
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Appointment Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleFormChange}
                rows={4}
                placeholder="Describe the tattoo design, placement, and any special requirements..."
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

export default function AppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Partial<AppointmentType> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // tRPC queries
  const { 
    data: appointmentsData, 
    isLoading: appointmentsLoading, 
    error: appointmentsError,
    refetch: refetchAppointments 
  } = trpc.appointments.getAll.useQuery({
    limit: 100,
    status: statusFilter !== 'all' ? statusFilter as AppointmentStatus : undefined,
  });

  const { 
    data: customersData, 
    isLoading: customersLoading,
    error: customersError 
  } = trpc.admin.customers.getAll.useQuery({ limit: 1000 });

  // tRPC mutations
  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Appointment created successfully" });
      refetchAppointments();
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create appointment",
        variant: "destructive" 
      });
    },
  });

  const updateAppointment = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Appointment updated successfully" });
      refetchAppointments();
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update appointment",
        variant: "destructive" 
      });
    },
  });

  const deleteAppointment = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Appointment deleted successfully" });
      refetchAppointments();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete appointment",
        variant: "destructive" 
      });
    },
  });

  const appointments = appointmentsData?.items || [];
  const customers = customersData?.items || [];
  const loading = appointmentsLoading || customersLoading;
  const error = appointmentsError || customersError;

  // Filter appointments based on search value
  const filteredAppointments = appointments.filter((appointment: AppointmentType) => {
    return (
      appointment.clientName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      appointment.clientEmail?.toLowerCase().includes(searchValue.toLowerCase()) ||
      appointment.tattooStyle?.toLowerCase().includes(searchValue.toLowerCase()) ||
      appointment.description?.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  // Export to CSV function
  const exportToCSV = useCallback(() => {
    const headers = ['Client Name', 'Email', 'Date', 'Time', 'Status', 'Style', 'Size', 'Deposit', 'Total Price', 'Description'];
    const csvData = filteredAppointments.map((appointment: AppointmentType) => [
      appointment.clientName || '',
      appointment.clientEmail || '',
      appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'yyyy-MM-dd') : '',
      appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'HH:mm') : '',
      appointment.status || '',
      appointment.tattooStyle || '',
      appointment.size || '',
      appointment.depositPaid ? `$${appointment.depositAmount}` : 'Not paid',
      `$${appointment.totalPrice || 0}`,
      appointment.description || '',
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map((field: string) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Success", description: "Appointments exported to CSV" });
  }, [filteredAppointments, toast]);

  // Custom toolbar actions
  const customToolbarActions = (
    <div className="flex gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        className="text-green-500 border-green-500 hover:bg-green-500/10"
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleViewAppointment = (id: string | number) => {
    const appointment = appointments.find((a: AppointmentType) => a.id === String(id));
    if (appointment) {
      setEditingAppointment(appointment);
      setDialogOpen(true);
    }
  };

  const handleEditAppointment = (id: string | number) => {
    const appointment = appointments.find((a: AppointmentType) => a.id === String(id));
    if (appointment) {
      setEditingAppointment(appointment);
      setDialogOpen(true);
    }
  };

  const handleDeleteAppointment = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointment.mutate({ id: String(id) });
    }
  };

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAppointment(null);
  };

  const handleFormSubmit = async (formData: Partial<AppointmentType>) => {
    if (!formData.customerId || !formData.appointmentDate) {
      toast({ 
        title: "Validation Error", 
        description: "Please select a customer and appointment date",
        variant: "destructive" 
      });
      return;
    }

    if (editingAppointment?.id) {
      updateAppointment.mutate({ 
        id: editingAppointment.id,
        appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate) : undefined,
        duration: formData.duration,
        status: formData.status as AppointmentStatus,
        depositAmount: formData.depositAmount,
        totalPrice: formData.totalPrice,
        description: formData.description || undefined,
        location: formData.location || undefined,
      });
    } else {
      createAppointment.mutate({
        customerId: formData.customerId,
        appointmentDate: new Date(formData.appointmentDate),
        duration: formData.duration || 120,
        status: formData.status as AppointmentStatus,
        depositAmount: formData.depositAmount || 0,
        totalPrice: formData.totalPrice || 0,
        description: formData.description || undefined,
        location: formData.location || undefined,
      });
    }
  };

  const handleRefresh = () => {
    refetchAppointments();
  };


  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      <div className="flex items-start mb-8 p-6 bg-gray-900 rounded-lg shadow-lg">
        <div className="bg-red-500/10 text-red-500 rounded-lg p-3 mr-4 flex items-center justify-center">
          <CalendarDays className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Tattoo Appointments
          </h1>
          <p className="text-gray-400">
            Schedule and manage tattoo sessions, consultations, and follow-ups
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-lg border-l-4 border-red-500 flex items-center">
          <p>Error loading data: {error.message}</p>
        </div>
      )}

      <AdminDataTable
        rows={filteredAppointments}
        loading={loading}
        error={error?.message || null}
        searchValue={searchValue}
        onSearch={handleSearch}
        onRefreshClick={handleRefresh}
        onAddClick={handleAddAppointment}
        title="Appointments"
        searchPlaceholder="Search appointments..."
        customToolbarActions={customToolbarActions}
        columns={[
          {
            field: 'clientName',
            headerName: 'Customer',
            width: 180,
            renderCell: (params: { value: unknown; row: AppointmentType }) => {
              const clientName = (params.value as string) || '';
              return (
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center mr-3 text-red-500 font-bold text-sm">
                    {clientName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{clientName}</span>
                    <p className="text-xs text-gray-500">{params.row.clientEmail}</p>
                  </div>
                </div>
              );
            },
          },
          {
            field: 'appointmentDate',
            headerName: 'Date & Time',
            width: 170,
            renderCell: (params: { value: unknown }) => {
              const date = new Date(params.value as string);
              return (
                <div>
                  <p className="text-sm">{format(date, 'MMM dd, yyyy')}</p>
                  <p className="text-xs text-gray-500">{format(date, 'h:mm a')}</p>
                </div>
              );
            },
          },
          {
            field: 'tattooStyle',
            headerName: 'Style & Details',
            flex: 1,
            minWidth: 200,
            renderCell: (params: { row: AppointmentType }) => (
              <div>
                <p className="text-sm font-medium">{params.row.tattooStyle || 'Not specified'}</p>
                <p className="text-xs text-gray-500">
                  {params.row.size && `Size: ${params.row.size}`}
                  {params.row.duration && ` • ${params.row.duration} min`}
                </p>
              </div>
            ),
          },
          {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params: { value: unknown }) => {
              const status = params.value as AppointmentStatus;
              const statusVariant = status === AppointmentStatus.CONFIRMED ? 'success' :
                                  status === AppointmentStatus.COMPLETED ? 'info' :
                                  status === AppointmentStatus.CANCELLED ? 'error' :
                                  status === AppointmentStatus.NO_SHOW ? 'error' : 'warning';
              return <StatusBadge status={statusVariant} text={status} />;
            },
          },
          {
            field: 'depositInfo',
            headerName: 'Deposit',
            width: 120,
            renderCell: (params: { row: AppointmentType }) => (
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
            field: 'totalPrice',
            headerName: 'Total Price',
            width: 120,
            valueFormatter: (params: { value: unknown }) => `$${Number(params.value) || 0}`,
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
                  const appointment = appointments.find((a: AppointmentType) => a.id === String(id));
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