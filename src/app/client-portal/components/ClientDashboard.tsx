'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { trpc } from '@/components/providers/ReactQueryProvider';
import { useRouter } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';
import { useGalleryPhotos } from '@/hooks/trpc';
import { EnhancedErrorBoundary } from '@/components/error/enhanced-error-boundary';

/**
 * ClientDashboard content component for authenticated clients
 *
 * Shows appointment history, upcoming appointments, design gallery,
 * and payment history in a tabbed interface.
 */
function ClientDashboardContent() {
  const [activeTab, setActiveTab] = useState('appointments');
  const router = useRouter();

  // Using our custom gallery hook that uses tRPC + React Query
  const {
    data: galleryPhotos,
    isLoading: isLoadingGallery,
    error: galleryError,
  } = useGalleryPhotos();

  // Example booking query - we'd implement a custom booking hook similar to useGallery
  const { data: bookings, isLoading: isLoadingBookings } = trpc.booking.getClientBookings.useQuery(
    undefined,
    {
      // Only refetch when component mounts or user changes tabs
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <LogoutButton variant="outline" redirectTo="/auth/login" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
          <TabsTrigger value="designs">My Designs</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-muted rounded-lg"></div>
                  ))}
                </div>
              ) : !bookings?.upcoming || bookings.upcoming.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                  <Button onClick={() => router.push('/booking')}>Book an Appointment</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.upcoming.map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{booking.serviceType}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.appointmentDate)}
                            </p>
                            <div className="flex items-center mt-1">
                              <span
                                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                  booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                              ></span>
                              <span className="capitalize text-sm">{booking.status}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex justify-center mt-4">
                    <Button onClick={() => router.push('/booking')}>
                      Book Another Appointment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>Your previous appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-muted rounded-lg"></div>
                  ))}
                </div>
              ) : !bookings?.past || bookings.past.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">No past appointments</p>
              ) : (
                <div className="space-y-4">
                  {bookings.past.map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{booking.serviceType}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.appointmentDate)}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="inline-block w-2 h-2 rounded-full mr-2 bg-blue-500"></span>
                              <span className="capitalize text-sm">Completed</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="secondary" size="sm">
                              Leave Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="designs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Design Gallery</CardTitle>
              <CardDescription>Custom designs for your tattoos</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGallery ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-square bg-muted rounded-lg"></div>
                  ))}
                </div>
              ) : galleryError ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">Error loading designs</p>
                  <Button variant="outline">Retry</Button>
                </div>
              ) : !galleryPhotos || galleryPhotos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No custom designs yet</p>
                  <Button variant="outline">Contact Artist</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryPhotos.map(photo => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title || 'Tattoo design'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" className="text-white border-white">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your payments and deposit status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Deposit for Japanese Sleeve</h3>
                        <p className="text-sm text-muted-foreground">May 15, 2023</p>
                        <p className="text-sm font-medium">$200.00</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Final Payment for Japanese Sleeve</h3>
                        <p className="text-sm text-muted-foreground">June 12, 2023</p>
                        <p className="text-sm font-medium">$800.00</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Deposit for Back Piece</h3>
                        <p className="text-sm text-muted-foreground">October 3, 2023</p>
                        <p className="text-sm font-medium">$400.00</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center mt-6">
                <Button variant="outline">Download Receipts</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * ClientDashboard component with error boundary
 * 
 * Wrapper component that adds error handling to the client dashboard.
 */
export function ClientDashboard() {
  return (
    <EnhancedErrorBoundary
      componentName="ClientDashboard"
      title="Unable to load client dashboard"
      description="We're having trouble displaying your dashboard. Please refresh the page to try again."
      showToast={true}
      severity="high"
      canRecover={true}
    >
      <ClientDashboardContent />
    </EnhancedErrorBoundary>
  );
}
