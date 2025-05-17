/**
 * Client Portal Content Component
 * 
 * Main content for the client portal showing appointments, bookings, and designs.
 * Uses tRPC hooks for data fetching and state management.
 */
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Eye, 
  FileText, 
  ImageIcon,
  LayoutDashboard,
  MoreHorizontal,
  PencilRuler,
  UserCircle, 
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/trpc/use-user';
import { useMyBookings } from '@/hooks/trpc/use-booking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function ClientPortalContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Fetch user data
  const { user, isLoading: isLoadingUser } = useCurrentUser();
  
  // Fetch user's bookings
  const { bookings, isLoading: isLoadingBookings } = useMyBookings();
  
  // Loading state
  if (isLoadingUser || !user) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>
            View your upcoming appointments, booking history, and saved designs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Avatar className="h-16 w-16">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name || 'User'} />
              ) : (
                <AvatarFallback>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-medium">{user.name || 'Client'}</h2>
              <p className="text-muted-foreground">
                Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main content tabs */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs defaultValue="appointments" onValueChange={setActiveTab}>
            <TabsList className="w-full max-w-md grid grid-cols-3">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="designs">My Designs</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Appointments tab */}
          <TabsContent value="appointments" className="space-y-4">
            {user.customerProfile?.appointments && user.customerProfile.appointments.length > 0 ? (
              <div className="space-y-4">
                {user.customerProfile.appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium">{appointment.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(appointment.startDate), 'EEEE, MMMM d, yyyy')}
                            </span>
                            <span className="mx-1">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(appointment.startDate), 'h:mm a')} - 
                              {format(new Date(appointment.endDate), ' h:mm a')}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'completed' ? 'success' :
                            appointment.status === 'cancelled' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-2 border-t">
                      <div className="w-full flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <PencilRuler className="h-3 w-3 mr-1" />
                          <span>
                            {appointment.artist?.user?.name || 'Artist'}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/client-portal/appointments/${appointment.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Appointments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any scheduled appointments.
                </p>
                <Button onClick={() => router.push('/booking')}>
                  Book an Appointment
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Bookings tab */}
          <TabsContent value="bookings" className="space-y-4">
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium">{booking.tattooType} Tattoo</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <BookOpen className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(booking.createdAt), 'MMMM d, yyyy')}
                            </span>
                            <span className="mx-1">•</span>
                            <span>
                              {booking.size} on {booking.placement}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={booking.depositPaid ? 'success' : 'secondary'}
                        >
                          {booking.depositPaid ? 'Confirmed' : 'Pending'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-2 border-t">
                      <div className="w-full flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            Preferred: {format(new Date(booking.preferredDate), 'MMM d, yyyy')} ({booking.preferredTime})
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/client-portal/bookings/${booking.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Booking Requests</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any booking requests yet.
                </p>
                <Button onClick={() => router.push('/booking')}>
                  Book a Tattoo
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Designs tab */}
          <TabsContent value="designs" className="space-y-4">
            {user.customerProfile?.designs && user.customerProfile.designs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.customerProfile.designs.map((design) => (
                  <Card key={design.id} className="overflow-hidden">
                    <div className="relative h-48 bg-muted">
                      {design.thumbnailUrl ? (
                        <img 
                          src={design.thumbnailUrl} 
                          alt={design.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{design.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {design.designType || 'Custom Design'}
                          </p>
                        </div>
                        <Badge variant={design.isApproved ? 'success' : 'secondary'}>
                          {design.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-2 border-t">
                      <div className="w-full flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <PencilRuler className="h-3 w-3 mr-1" />
                          <span>
                            {design.artist?.user?.name || 'Artist'}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/gallery/${design.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Design
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Custom Designs</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any custom designs created for you yet.
                </p>
                <Button onClick={() => router.push('/gallery')}>
                  Browse Gallery
                </Button>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>
      
      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Link href="/booking" className="flex flex-col items-center">
              <Calendar className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Book Appointment</p>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Link href="/gallery" className="flex flex-col items-center">
              <ImageIcon className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Browse Gallery</p>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Link href="/client-portal/profile" className="flex flex-col items-center">
              <UserCircle className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Edit Profile</p>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Link href="/contact" className="flex flex-col items-center">
              <LayoutDashboard className="h-8 w-8 mb-2 text-primary" />
              <p className="font-medium">Contact Us</p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
