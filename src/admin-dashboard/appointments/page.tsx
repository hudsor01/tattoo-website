/**
 * Admin Appointments Page
 * 
 * Purpose: View and manage bookings with simplified interface
 * Rendering: Server Component with Client Components for interactivity
 */

import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentsList from '@/components/admin/appointments/AppointmentsList';

// Loading component for appointments list
function AppointmentsLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32 bg-muted/50" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-40 bg-muted/50" />
                <Skeleton className="h-4 w-32 bg-muted/50" />
              </div>
              <Skeleton className="h-4 w-36 bg-muted/50" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 bg-muted/50 rounded-full" />
              <Skeleton className="h-8 w-8 bg-muted/50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Appointments</h1>
              <p className="text-muted-foreground">Manage customer bookings and appointments</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking requests from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<AppointmentsLoading />}>
                <AppointmentsList />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}