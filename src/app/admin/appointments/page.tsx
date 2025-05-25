'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/data-table';
import StatusBadge from '@/components/admin/StatusBadge';
import type { AppointmentSerializedType, AppointmentType } from '@/types/booking-types';
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
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';
import { AppointmentStatus } from '@/types/enum-types';

interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<AppointmentType>) => Promise<void>;
  initialData: Partial<AppointmentType> | null;
  customers: Array<{
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
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

  void React.useEffect(() => {
    const defaultStartTime = new Date();
    void defaultStartTime.setMinutes(Math.floor(defaultStartTime.getMinutes() / 15) * 15);
    const defaultEndTime = new Date(defaultStartTime);
    void defaultEndTime.setHours(defaultEndTime.getHours() + 2);

    setFormData(
      initialData ?? {
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
        clientEmail: customer.email ?? '',
        clientPhone: customer.phone ?? '',
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    void event.preventDefault();
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

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Select Customer *</Label>
              <Select
                value={formData.customerId ?? ''}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id ?? 'unknown'} value={customer.id ?? ''}>
                      {customer.firstName ?? 'Unknown'} {customer.lastName ?? ''} ({customer.email ?? 'No email'})
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
                value={formData.duration ?? ''}
                onChange={handleFormChange}
                required
                min="30"
                step="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Appointment Status</Label>
              <Select
                value={formData.status ?? AppointmentStatus.SCHEDULED}
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
                value={formData.tattooStyle ?? ''}
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
                value={formData.size ?? ''}
                onChange={handleFormChange}
                placeholder="e.g., 4x6 inches, palm-sized"
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="depositPaid"
                checked={formData.depositPaid ?? false}
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
                  value={formData.depositAmount ?? ''}
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
                  value={formData.totalPrice ?? ''}
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
                value={formData.description ?? ''}
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
  const [searchValue] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Partial<AppointmentType> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter] = useState<string>('all');

  // tRPC queries
  const { 
    data: appointmentsData, 
    error: appointmentsError,
    refetch: refetchAppointments 
  } = trpc.appointments.getAll.useQuery({
    limit: 100,
    status: statusFilter !== 'all' ? statusFilter as AppointmentStatus : undefined,
  });

  const { 
    data: customersData, 
    error: customersError 
  } = trpc.admin.customers.getAll.useQuery({ limit: 1000 });

  // tRPC mutations
  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Appointment created successfully" });
      void refetchAppointments();
      handleCloseDialog();
    },
    onError: (error: { message: string }) => {
      toast({ 
        title: "Error", 
        description: error.message ?? "Failed to create appointment",
        variant: "destructive" 
      });
    },
  });

  const updateAppointment = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Appointment updated successfully" });
      void refetchAppointments();
      handleCloseDialog();
    },
    onError: (error: { message: string }) => {
      toast({ 
        title: "Error", 
        description: error.message ?? "Failed to update appointment",
        variant: "destructive" 
      });
    },
  });

  // const deleteAppointment = trpc.appointments.delete.useMutation({
  //   onSuccess: () => {
  //     toast({ title: "Success", description: "Appointment deleted successfully" });
  //     refetchAppointments();
  //   },
  //   onError: (error: unknown) => {
  //     toast({ 
  //       title: "Error", 
  //       description: error.message ?? "Failed to delete appointment",
  //       variant: "destructive" 
  //     });
  //   },
  // });

  const appointments = appointmentsData?.items ?? [];
  const customers = (customersData?.items ?? []).map(customer => ({
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  }));
  const loading = false; // Don't show loading spinner - render table immediately
  const error = appointmentsError ?? customersError;

  // Filter appointments based on search value
  const filteredAppointments = appointments.filter((appointment) => {
    const searchTerm = searchValue.toLowerCase();
    return (
      appointment.clientName?.toLowerCase().includes(searchTerm) ?? appointment.clientEmail?.toLowerCase().includes(searchTerm) ?? appointment.tattooStyle?.toLowerCase().includes(searchTerm) ?? appointment.description?.toLowerCase().includes(searchTerm)
    );
  });

  // CSV export function removed - was causing unwanted downloads



  const handleViewAppointment = (id: string | number) => {
    const appointment = appointments.find((a) => a.id === String(id));
    if (appointment) {
      setEditingAppointment({
        ...appointment,
        appointmentDate: new Date(appointment.appointmentDate),
        createdAt: appointment.createdAt ? new Date(appointment.createdAt) : new Date(),
        updatedAt: appointment.updatedAt ? new Date(appointment.updatedAt) : new Date(),
      });
      setDialogOpen(true);
    }
  };

  const handleEditAppointment = (id: string | number) => {
    const appointment = appointments.find((a) => a.id === String(id));
    if (appointment) {
      setEditingAppointment({
        ...appointment,
        appointmentDate: new Date(appointment.appointmentDate),
        createdAt: appointment.createdAt ? new Date(appointment.createdAt) : new Date(),
        updatedAt: appointment.updatedAt ? new Date(appointment.updatedAt) : new Date(),
      });
      setDialogOpen(true);
    }
  };

  // Removed unused delete function

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
      void updateAppointment.mutate({
        id: editingAppointment.id,
        appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate) : undefined,
        duration: formData.duration,
        status: formData.status as AppointmentStatus,
        depositAmount: formData.depositAmount,
        totalPrice: formData.totalPrice,
        description: formData.description ?? undefined,
        location: formData.location ?? undefined,
      });
    } else {
      void createAppointment.mutate({
        customerId: formData.customerId,
        appointmentDate: new Date(formData.appointmentDate),
        duration: formData.duration ?? 120,
        status: formData.status as AppointmentStatus,
        depositAmount: formData.depositAmount ?? 0,
        totalPrice: formData.totalPrice ?? 0,
        description: formData.description ?? undefined,
        location: formData.location ?? undefined,
      });
    }
  };

  const handleRefresh = () => {
    void refetchAppointments();
  };


  return (
    <div className="space-y-6">
      {/* Header - matching dashboard style */}
      <div className="bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-tattoo-red to-tattoo-red/80 rounded-xl shadow-sm">
            <CalendarDays className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Tattoo Appointments</h1>
            <p className="text-slate-400 mt-1">
              Schedule and manage tattoo sessions, consultations, and follow-ups
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-lg border-l-4 border-red-500 flex items-center">
          <p>Error loading data: {error.message}</p>
        </div>
      )}

      {/* Data Table in Card */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <DataTable
          data={filteredAppointments}
          loading={loading}
          searchPlaceholder="Search appointments..."
          onRefresh={handleRefresh}
          onAdd={handleAddAppointment}
          columns={[
          {
            id: 'clientName',
            accessorKey: 'clientName',
            header: 'Customer',
            cell: ({ getValue, row }) => {
              const clientName = (getValue() as string) || '';
              const appointment = row.original as AppointmentSerializedType;
              return (
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center mr-3 text-red-500 font-bold text-sm">
                    {clientName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{clientName}</span>
                    <p className="text-xs text-gray-500">{appointment.clientEmail}</p>
                  </div>
                </div>
              );
            },
          },
          {
            id: 'appointmentDate',
            accessorKey: 'appointmentDate',
            header: 'Date & Time',
            cell: ({ getValue }) => {
              const dateValue = getValue();
              if (!dateValue) return <span className="text-gray-500">Not scheduled</span>;
              const date = new Date(dateValue as string);
              return (
                <div>
                  <p className="text-sm">{format(date, 'MMM dd, yyyy')}</p>
                  <p className="text-xs text-gray-500">{format(date, 'h:mm a')}</p>
                </div>
              );
            },
          },
          {
            id: 'tattooStyle',
            accessorKey: 'tattooStyle',
            header: 'Style & Details',
            cell: ({ row }) => {
              const appointment = row.original as AppointmentSerializedType;
              return (
                <div>
                  <p className="text-sm font-medium">{appointment.tattooStyle ?? 'Not specified'}</p>
                  <p className="text-xs text-gray-500">
                    {appointment.size && `Size: ${appointment.size}`}
                    {appointment.duration && ` • ${appointment.duration} min`}
                  </p>
                </div>
              );
            },
          },
          {
            id: 'status',
            accessorKey: 'status',
            header: 'Status',
            cell: ({ getValue }) => {
              const status = getValue() as AppointmentStatus;
              const statusVariant = status === AppointmentStatus.CONFIRMED ? 'success' :
                                  status === AppointmentStatus.COMPLETED ? 'info' :
                                  status === AppointmentStatus.CANCELLED ? 'error' :
                                  status === AppointmentStatus.NO_SHOW ? 'error' : 'warning';
              return <StatusBadge status={statusVariant} text={status} />;
            },
          },
          {
            id: 'depositInfo',
            header: 'Deposit',
            cell: ({ row }) => {
              const appointment = row.original as AppointmentSerializedType;
              return (
                <div className="flex items-center">
                  {appointment.depositPaid ? (
                    <>
                      <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                      <span className="text-sm">${appointment.depositAmount}</span>
                    </>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Not paid
                    </Badge>
                  )}
                </div>
              );
            },
          },
          {
            id: 'totalPrice',
            accessorKey: 'totalPrice',
            header: 'Total Price',
            cell: ({ getValue }) => {
              const value = getValue() as number | null | undefined;
              return `$${value ? Number(value) : 0}`;
            },
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
              const appointment = row.original as AppointmentSerializedType;
              return (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewAppointment(appointment.id)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditAppointment(appointment.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-500 hover:bg-green-500/10"
                    onClick={() => router.push(`/admin/designs/upload?appointment=${appointment.id}`)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-500 hover:bg-blue-500/10"
                    onClick={() => router.push(`/admin/messages/new?customer=${appointment.customerId}`)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              );
            },
          },
        ]}
        />
      </div>

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