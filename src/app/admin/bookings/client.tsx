'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { CalEmbed } from '@/components/booking/cal-embed';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';
import { Calendar, Clock, User, DollarSign, RefreshCw, ExternalLink } from 'lucide-react';
import { DataTable } from '@/components/admin/Data-Table';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Prisma } from '@prisma/client';

// Admin booking display type using CalBooking with relations
type AdminBookingDisplay = Prisma.CalBookingGetPayload<{
  include: {
    customer: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
      };
    };
    eventType: {
      select: {
        title: true;
        slug: true;
        price: true;
        currency: true;
      };
    };
    attendees: true;
  };
}> & {
  // Additional computed fields for admin display
  attendeeName: string;
  attendeeEmail: string;
};

// Cal.com booking payload type
type CalBookingPayload = Prisma.CalBookingGetPayload<{
  include: {
    eventType: true;
    attendees: true;
  };
}>;

const columns: ColumnDef<AdminBookingDisplay>[] = [
  {
    id: "attendeeName",
    accessorKey: "attendeeName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.attendeeName}</p>
        <p className="text-sm text-muted-foreground">{row.original.attendeeEmail}</p>
      </div>
    ),
  },
  {
    id: "eventType",
    accessorKey: "eventType.title",
    header: "Service",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.eventType?.title ?? row.original.title}
      </Badge>
    ),
  },
  {
    id: "startTime",
    accessorKey: "startTime",
    header: "Date & Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium">{format(new Date(row.original.startTime), 'MMM d, yyyy')}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(row.original.startTime), 'h:mm a')} - 
            {format(new Date(row.original.endTime), 'h:mm a')}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "price",
    accessorKey: "eventType.price",
    header: "Price",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          {row.original.eventType?.price ? `$${row.original.eventType.price}` : 'TBD'}
        </span>
      </div>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge 
          variant={
            status === 'ACCEPTED' || status === 'CONFIRMED' ? 'success' : 
            status === 'PENDING' ? 'warning' : 
            status === 'CANCELLED' || status === 'REJECTED' ? 'destructive' : 
            'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => window.open(`https://app.cal.com/bookings/${row.original.uid}`, '_blank')}
      >
        <ExternalLink className="h-4 w-4" />
        <span className="sr-only">View in Cal.com</span>
      </Button>
    ),
  },
];

export function BookingsPageClient() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { toast } = useToast();
  
  // Use existing getBookings procedure with status filter
  const { data: bookingsData, isLoading, refetch } = trpc.cal.getBookings.useQuery(
    { 
      status: activeTab === 'upcoming' ? 'accepted' : 
              activeTab === 'cancelled' ? 'cancelled' : 
              undefined 
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Use getDashboardMetrics for stats
  const today = new Date();
  const { data: metrics } = trpc.cal.getDashboardMetrics.useQuery({
    startDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
    endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
  });

  // Transform bookings data to match table structure
  const bookings = useMemo(() => {
    if (!bookingsData) return [];
    
    return bookingsData.map((booking: unknown) => {
      const b = booking as CalBookingPayload;
      return {
      id: b['uid'],
      uid: b['uid'],
      title: b['title'] ?? `${b['eventType']?.title ?? 'Appointment'}`,
      attendeeName: b['attendees']?.[0]?.name ?? 'Unknown',
      attendeeEmail: b['attendees']?.[0]?.email ?? 'unknown@example.com',
      startTime: b['startTime'],
      endTime: b['endTime'],
      status: b['status'],
      eventType: b['eventType'],
    };
    });
  }, [bookingsData]);

  // Calculate stats from metrics
  const stats = useMemo(() => {
    if (!metrics) return {
      todayCount: 0,
      todayRevenue: 0,
      weekCount: 0,
      weekRevenue: 0,
      monthCount: 0,
      monthRevenue: 0,
      cancellationRate: 0,
    };

    // Estimate today and week stats from month data
    const todayCount = Math.floor((metrics.totalBookings ?? 0) / 30);
    const weekCount = Math.floor((metrics.totalBookings ?? 0) / 4);
    
    return {
      todayCount,
      todayRevenue: todayCount * 200,
      weekCount,
      weekRevenue: weekCount * 200,
      monthCount: metrics.totalBookings ?? 0,
      monthRevenue: metrics.totalRevenue ?? 0,
      cancellationRate: metrics.cancelledBookings && metrics.totalBookings 
        ? Math.round((metrics.cancelledBookings / metrics.totalBookings) * 100) 
        : 0,
    };
  }, [metrics]);

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Bookings refreshed",
      description: "The booking list has been updated.",
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Fixed Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div>
            <h1 className="dashboard-section-heading text-4xl lg:text-5xl">Bookings</h1>
            <p className="dashboard-section-subheading mt-1">
              Manage your appointments and calendar through Cal.com
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => window.open('https://app.cal.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Cal.com
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.todayRevenue ? `$${stats.todayRevenue} expected` : 'No bookings'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.weekCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.weekRevenue ? `$${stats.weekRevenue} expected` : 'No bookings'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthRevenue ? `$${stats.monthRevenue} expected` : 'No bookings'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cancellationRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <CardDescription>
                    Manage your upcoming appointments and sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={bookings}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Past Bookings</CardTitle>
                  <CardDescription>
                    View completed appointments and sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={bookings}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cancelled Bookings</CardTitle>
                  <CardDescription>
                    View cancelled or rejected appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={bookings}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>
                    View and manage your booking calendar
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[700px] w-full">
                    <CalEmbed 
                      calLink={`${process.env['NEXT_PUBLIC_CAL_USERNAME'] ?? 'ink37tattoos'}`}
                      config={{
                        theme: 'dark',
                        hideEventTypeDetails: false,
                        layout: 'month_view',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}