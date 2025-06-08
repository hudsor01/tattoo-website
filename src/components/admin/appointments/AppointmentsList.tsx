'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Mail, Phone, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import type { Booking } from '@prisma/client';

// Fetch appointments from API
async function fetchAppointments(): Promise<Booking[]> {
  const response = await fetch('/api/admin/appointments');
  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }
  return response.json();
}

export default function AppointmentsList() {
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: fetchAppointments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-red-600">Failed to load appointments</h3>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
        <p className="text-muted-foreground">New booking requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <h4 className="font-semibold">{booking.firstName} {booking.lastName}</h4>
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
                {booking.preferredDate ? format(new Date(booking.preferredDate), 'PPP') : 'No date set'}
              </div>
              {booking.tattooType && (
                <p className="text-sm text-muted-foreground">Service: {booking.tattooType}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  booking.status === 'CONFIRMED' ? 'default' :
                  booking.status === 'PENDING' ? 'secondary' :
                  booking.status === 'CANCELLED' ? 'destructive' : 'outline'
                }
              >
                {booking.status}
              </Badge>
              <Button variant="outline" size="sm" title="View details">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}