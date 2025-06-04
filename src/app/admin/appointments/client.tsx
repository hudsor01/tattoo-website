/**
 * Admin Appointments Page Client Component
 * 
 * Purpose: View and manage bookings with simplified interface
 * Rendering: CSR with TanStack Query
 * Dependencies: REST API, customer data integration
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Phone,
  Eye,
  Plus
} from 'lucide-react';
import { Booking } from '@prisma/client';

export default function AdminAppointmentsPage() {

  // TODO: Replace with actual API call using TanStack Query
  const mockBookings: Booking[] = [];

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
              {mockBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                  <p className="text-muted-foreground">New booking requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{booking.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {booking.email}
                            </span>
                            {booking.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {booking.phone}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            {format(new Date(booking.preferredDate), 'PPP')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{booking.status}</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}