'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';

interface Appointment {
id: string;
customerName: string;
email: string;
date: string;
time: string;
service: string;
status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
notes?: string;
[key: string]: unknown;
}

const appointmentColumns: DataTableColumn<Appointment>[] = [
  {
    id: 'customerName',
    header: 'Customer',
    enableSorting: true,
  },
  {
    id: 'email',
    header: 'Email',
    enableSorting: true,
  },
  {
    id: 'date',
    header: 'Date',
    enableSorting: true,
  },
  {
    id: 'time',
    header: 'Time',
    enableSorting: true,
  },
  {
    id: 'service',
    header: 'Service',
    enableSorting: true,
  },
  {
    id: 'status',
    header: 'Status',
    enableSorting: true,
  },
];

export default function AppointmentsPage() {
  const [appointments] = useState<Appointment[]>([]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">Manage and view all tattoo appointments</p>
      </div>

      <DataTable
        data={appointments}
        columns={appointmentColumns}
        searchPlaceholder="Search appointments..."
        enableRowSelection={true}
        enableSearch={true}
        enableColumnVisibility={true}
        loading={false}
      />
    </div>
  );
}