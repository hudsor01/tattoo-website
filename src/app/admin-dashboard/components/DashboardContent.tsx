/**
 * Dashboard Content Component
 * 
 * Main content for the admin dashboard showing key statistics and recent activity.
 * Uses tRPC hooks for data fetching and real-time updates.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen,
  Calendar,
  Edit,
  Eye,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  PencilRuler,
  Users,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDashboardStats } from '@/hooks/trpc/use-admin';
import { useDashboardActivity } from '@/hooks/trpc/use-subscription';

export function DashboardContent() {
  const toast = useToast();
  const router = useRouter();
  const { stats, isLoading, error, refetch } = useDashboardStats();
  const { activities } = useDashboardActivity();
  
  // Local state for notifications
  const [notifications, setNotifications] = useState<
    { id: string; message: string; type: string; time: Date }[]
  >([]);
  
  // Process real-time activities into notifications
  useEffect(() => {
    if (activities && activities.length > 0) {
      // Process only the latest activity if it's new
      const latestActivity = activities[0];
      const activityId = `${latestActivity.type}-${latestActivity.timestamp.getTime()}`;
      
      // Check if this notification is already in our list
      if (!notifications.some(n => n.id === activityId)) {
        let message = '';
        let type = 'info';
        
        // Format message based on activity type
        if (latestActivity.type === 'booking') {
          const data = latestActivity.data;
          if (data.type === 'created') {
            message = `New booking request from ${data.data.name}`;
            type = 'booking';
          } else if (data.type === 'updated') {
            message = `Booking #${data.id} was updated`;
            type = 'update';
          }
        } else if (latestActivity.type === 'appointment') {
          const data = latestActivity.data;
          if (data.type === 'status_changed') {
            message = `Appointment status changed to ${data.data.status}`;
            type = 'appointment';
          }
        } else if (latestActivity.type === 'customer') {
          const data = latestActivity.data;
          if (data.type === 'created') {
            message = `New customer: ${data.data.firstName} ${data.data.lastName}`;
            type = 'customer';
          }
        }
        
        // If we have a message, add to notifications
        if (message) {
          setNotifications(prev => [
            { id: activityId, message, type, time: latestActivity.timestamp },
            ...prev.slice(0, 9) // Keep only 10 most recent
          ]);
          
          // Also show a toast
          toast(message, {
            description: `${formatDistanceToNow(latestActivity.timestamp)} ago`,
            action: {
              label: "View",
              onClick: () => {
                // Navigate based on type
                if (type === 'booking') router.push('/admin/bookings');
                else if (type === 'appointment') router.push('/admin/appointments');
                else if (type === 'customer') router.push('/admin/customers');
              }
            }
          });
        }
      }
    }
  }, [activities, notifications, router]);
  
  // Handle error
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">
            {error.message || "There was a problem loading the dashboard data."}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </Card>
    );
  }
  
  // Handle loading state
  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4 mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.counts.bookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.recentBookings?.length} new in the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingAppointments?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              In the next 14 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.counts.customers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(stats.counts.customers / stats.counts.bookings * 100) || 0}% retention rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Artists
            </CardTitle>
            <PencilRuler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.counts.artists || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active tattoo artists
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest booking requests from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {booking.name}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{booking.tattooType}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={booking.depositPaid ? "success" : "secondary"}>
                        {booking.depositPaid ? "Paid" : "Pending"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/admin/bookings/${booking.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/bookings/${booking.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/appointments/new?bookingId=${booking.id}`)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Create Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent bookings found
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/bookings">View All Bookings</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Upcoming appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Scheduled appointments in the next 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {appointment.title}
                        </p>
                        <Badge variant="outline" className="font-normal">
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>
                          {format(new Date(appointment.startDate), "MMM d, h:mm a")} - 
                          {format(new Date(appointment.endDate), " h:mm a")}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" 
                      onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No upcoming appointments
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/appointments">View All Appointments</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-6 gap-2" asChild>
              <Link href="/admin/bookings/new">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>New Booking</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-6 gap-2" asChild>
              <Link href="/admin/appointments/new">
                <Calendar className="h-6 w-6 mb-2" />
                <span>New Appointment</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-6 gap-2" asChild>
              <Link href="/admin/customers/new">
                <UserPlus className="h-6 w-6 mb-2" />
                <span>New Customer</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-6 gap-2" asChild>
              <Link href="/admin/gallery/new">
                <ImageIcon className="h-6 w-6 mb-2" />
                <span>Upload Design</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent notifications from subscription */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Real-time notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10">
                      {notification.type === 'booking' ? (
                        <BookOpen className="h-4 w-4 text-primary" />
                      ) : notification.type === 'appointment' ? (
                        <Calendar className="h-4 w-4 text-primary" />  
                      ) : notification.type === 'customer' ? (
                        <Users className="h-4 w-4 text-primary" />
                      ) : notification.type === 'update' ? (
                        <Edit className="h-4 w-4 text-primary" />
                      ) : (
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.time, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
