'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, Clock, User, MapPin, DollarSign, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useCalBookings } from '@/hooks/use-cal-bookings';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CalCustomInput } from '@/types/component-types';

export default function CalBookingsPage() {
  const { 
    bookings, 
    isLoading, 
    isSyncing,
    filterStatus, 
    setFilterStatus,
    syncBookings,
    updateBookingStatus,
    rescheduleBooking,
    isConfigured
  } = useCalBookings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleAccept = (uid: string) => {
    updateBookingStatus(uid, 'accepted');
  };

  const handleReject = (uid: string) => {
    updateBookingStatus(uid, 'rejected');
  };

  const handleCancel = (uid: string) => {
    updateBookingStatus(uid, 'cancelled');
  };

  // Simple reschedule handler - in a real app, this would open a modal
  const handleReschedule = (uid: string) => {
    // For simplicity, reschedule to tomorrow at the same time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Create reschedule confirmation modal in a real app
    if (confirm('Reschedule to tomorrow at the same time?')) {
      toast({
        title: 'Reschedule Request',
        description: 'This would open a date/time picker in the full implementation',
      });
      
      // This is just a placeholder - real implementation would use a modal with date picker
      // rescheduleBooking(uid, {
      //   start: tomorrow.toISOString(),
      //   end: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
      // });
    }
  };

  // Check if Cal.com is properly configured
  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Cal.com Bookings</h1>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cal.com Integration Not Configured</AlertTitle>
          <AlertDescription>
            Please set up the required environment variables: CAL_API_KEY, NEXT_PUBLIC_CAL_USERNAME, and CAL_WEBHOOK_SECRET
            to enable Cal.com integration. Check the documentation for more details.
          </AlertDescription>
        </Alert>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Configuration Steps</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create a Cal.com account if you don't have one yet</li>
            <li>Generate an API key in your Cal.com dashboard</li>
            <li>Set up the required environment variables in your .env file</li>
            <li>Configure webhook endpoints for real-time updates</li>
            <li>Restart the application</li>
          </ol>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cal.com Bookings</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cal.com Bookings</h1>
        <div className="flex gap-2">
          <Button 
            onClick={syncBookings} 
            disabled={isSyncing} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          {['all', 'accepted', 'pending', 'cancelled'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No bookings found</p>
          </Card>
        ) : (
          bookings.map(booking => (
            <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{booking.title}</h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-mono text-sm">{booking.uid}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{booking.attendees?.[0]?.name || 'No name'}</p>
                      <p className="text-sm text-gray-500">{booking.attendees?.[0]?.email || 'No email'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <p className="text-sm">{booking.startTime ? formatDate(booking.startTime) : 'No date'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </p>
                  </div>

                  {booking.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p className="text-sm">{booking.location}</p>
                    </div>
                  )}

                  {booking.payment && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <p className="text-sm">
                        ${booking.payment?.amount ? booking.payment.amount / 100 : 0} {booking.payment?.currency || 'USD'} - {booking.payment?.status || 'pending'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Tattoo Details</h4>
                  {booking.customInputs && Array.isArray(booking.customInputs) && booking.customInputs.map((input: CalCustomInput, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-gray-600">{input.label}:</span>{' '}
                      <span className="text-gray-800">{input.value}</span>
                    </div>
                  ))}
                  {booking.additionalNotes && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-600">Notes:</span>
                      <p className="text-gray-800 mt-1">{booking.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button 
                  size="sm" 
                  asChild
                >
                  <a href={`https://cal.com/${booking.organizer?.username || ''}/bookings/${booking.uid}`} target="_blank" rel="noopener noreferrer">
                    View in Cal
                  </a>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  asChild
                >
                  <a href={`mailto:${booking.attendees?.[0]?.email || ''}`}>
                    Contact Client
                  </a>
                </Button>
                {booking.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600"
                      onClick={() => handleAccept(booking.uid)}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600"
                      onClick={() => handleReject(booking.uid)}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {booking.status === 'accepted' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-orange-600"
                      onClick={() => handleReschedule(booking.uid)}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600"
                      onClick={() => handleCancel(booking.uid)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}