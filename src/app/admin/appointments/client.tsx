/**
 * Admin Appointments Page Client Component
 * 
 * Purpose: View and manage individual appointments with detailed information
 * Rendering: CSR with real-time updates from Cal.com
 * Dependencies: Cal.com API, customer data integration
 * 
 * Trade-offs:
 * - Separate from bookings page for detailed view vs single page complexity
 * - Real-time updates vs API rate limits
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { trpc } from '@/lib/trpc/client';
import { format, isToday, isFuture } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalEmbed } from '@/components/booking/cal-embed';
import { cn } from '@/lib/utils';
import type { Prisma } from '@prisma/client';

// Cal.com booking type using Prisma generated types
type CalBooking = Prisma.CalBookingGetPayload<{
include: {
attendees: true;
eventType: true;
};
}>;

export function AppointmentsPageClient() {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Use getBookings to fetch all bookings
  const { data: allBookings, isLoading } = trpc.cal.getBookings.useQuery(
    undefined,
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  // Get recent bookings for the sidebar
  const { data: _recentBookings } = trpc.cal.getRecentBookings.useQuery({
    limit: 10,
  });

  // Filter today's appointments from all bookings
  const todayAppointments = useMemo(() => {
    if (!allBookings) return [];
    
    return allBookings
      .filter((booking: unknown) => {
        const b = booking as { startTime: string };
        return isToday(new Date(b.startTime));
      })
      .map((booking: unknown) => {
        const b = booking as CalBooking;
        return {
        id: b.uid,
        uid: b.uid,
        title: b.title ?? `${b.eventType?.title ?? 'Appointment'}`,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        attendee: {
          name: b.attendees?.[0]?.name ?? 'Unknown',
          email: b.attendees?.[0]?.email ?? 'unknown@example.com',
          phone: b.attendees?.[0]?.phone,
          timeZone: b.attendees?.[0]?.timeZone ?? 'UTC',
        },
        eventType: {
          title: b.eventType?.title ?? 'Appointment',
          duration: b.eventType?.duration ?? 60,
          price: b.eventType?.price ?? 0,
          description: b.eventType?.description,
        },
      };
      });
  }, [allBookings]);

  // Filter upcoming appointments
  const upcomingAppointments = useMemo(() => {
    if (!allBookings) return [];
    
    return allBookings
      .filter((booking: unknown) => {
        const b = booking as { startTime: string };
        return isFuture(new Date(b.startTime)) && !isToday(new Date(b.startTime));
      })
      .slice(0, 10)
      .map((booking: unknown) => {
        const b = booking as CalBooking;
        return {
        id: b.uid,
        uid: b.uid,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        attendee: {
          name: b.attendees?.[0]?.name ?? 'Unknown',
          email: b.attendees?.[0]?.email ?? 'unknown@example.com',
        },
        eventType: {
          title: b.eventType?.title ?? 'Appointment',
        },
      };
      });
  }, [allBookings]);

  // Get appointment details from selected booking
  const appointmentDetail = useMemo(() => {
    if (!selectedAppointment || !allBookings) return null;
    
    const booking = allBookings.find((b: unknown) => (b as CalBooking).uid === selectedAppointment) as CalBooking;
    if (!booking) return null;
    
    return {
      id: booking.uid,
      uid: booking.uid,
      title: booking.title ?? `${booking.eventType?.title ?? 'Appointment'}`,
      description: booking.description,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      attendee: {
        name: booking.attendees?.[0]?.name ?? 'Unknown',
        email: booking.attendees?.[0]?.email ?? 'unknown@example.com',
        phone: booking.attendees?.[0]?.phone,
        timeZone: booking.attendees?.[0]?.timeZone ?? 'UTC',
      },
      eventType: {
        title: booking.eventType?.title ?? 'Appointment',
        duration: booking.eventType?.duration ?? 60,
        price: booking.eventType?.price ?? 0,
        description: booking.eventType?.description,
      },
      location: booking.location,
      meetingUrl: booking.meetingUrl,
      customInputs: booking.customInputs,
      payment: {
        amount: booking.eventType?.price ?? 0,
        currency: 'USD',
        status: 'pending',
      },
    };
  }, [selectedAppointment, allBookings]);

  // Removed unused function - handleStatusChange

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Fixed Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div>
            <h1 className="dashboard-section-heading text-4xl lg:text-5xl">Appointments</h1>
            <p className="dashboard-section-subheading mt-1">
              View and manage today's appointments and scheduling
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {viewMode === 'list' ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Today's Schedule */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Today's Schedule
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      {isLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={`skeleton-today-${i}`} className="h-24 bg-muted animate-pulse rounded-lg" />
                          ))}
                        </div>
                      ) : todayAppointments.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No appointments scheduled for today</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {todayAppointments.map((appointment) => (
                            <Card
                              key={appointment.id}
                              className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                selectedAppointment === appointment.id && "ring-2 ring-primary"
                              )}
                              onClick={() => setSelectedAppointment(appointment.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {format(new Date(appointment.startTime), 'h:mm a')} - 
                                        {format(new Date(appointment.endTime), 'h:mm a')}
                                      </span>
                                      <Badge variant="secondary">
                                        {appointment.eventType.duration} min
                                      </Badge>
                                    </div>
                                    <h4 className="font-semibold">{appointment.eventType.title}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      {appointment.attendee.name}
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={
                                      appointment.status === 'ACCEPTED' || appointment.status === 'accepted' ? 'success' :
                                      appointment.status === 'PENDING' || appointment.status === 'pending' ? 'warning' :
                                      'destructive'
                                    }
                                  >
                                    {appointment.status}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4">
                {selectedAppointment && appointmentDetail ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Appointment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium mb-2">Customer Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {appointmentDetail.attendee.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{appointmentDetail.attendee.name}</p>
                              <p className="text-sm text-muted-foreground">{appointmentDetail.attendee.timeZone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {appointmentDetail.attendee.email}
                          </div>
                          {appointmentDetail.attendee.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {appointmentDetail.attendee.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Service Info */}
                      <div>
                        <h4 className="font-medium mb-2">Service Details</h4>
                        <div className="space-y-2">
                          <p className="font-medium">{appointmentDetail.eventType.title}</p>
                          {appointmentDetail.eventType.description && (
                            <p className="text-sm text-muted-foreground">
                              {appointmentDetail.eventType.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {appointmentDetail.eventType.duration} minutes
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              ${appointmentDetail.eventType.price}
                            </div>
                          </div>
                        </div>
                      </div>

                      {appointmentDetail.description && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Notes
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {appointmentDetail.description}
                            </p>
                          </div>
                        </>
                      )}

                      <Separator />

                      {/* Actions */}
                      <div className="space-y-2">
                        <Button className="w-full" size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Appointment
                        </Button>
                        <Button variant="outline" className="w-full" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Customer History
                        </Button>
                        <Button variant="destructive" className="w-full" size="sm">
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Appointment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Select an appointment to view details
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Upcoming Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between py-2"
                        >
                          <div>
                            <p className="font-medium text-sm">{appointment.attendee.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(appointment.startTime), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {appointment.eventType.title}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Calendar View */
            <Card>
              <CardContent className="p-0">
                <div className="h-[800px] w-full">
                  <CalEmbed 
                    calLink={`${process.env['NEXT_PUBLIC_CAL_USERNAME'] ?? 'ink37tattoos'}`}
                    config={{
                      theme: 'dark',
                      hideEventTypeDetails: false,
                      layout: 'week_view',
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}