'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, Clock, User, MapPin, DollarSign } from 'lucide-react';
import type { CalBookingPayload } from '@/types/booking-types';

// Mock data for demonstration - replace with actual API calls
const mockBookings: CalBookingPayload[] = [
  {
    id: '1',
    uid: 'cal_booking_1',
    eventTypeId: 1,
    title: 'Tattoo Consultation',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    attendees: [{
      email: 'john.doe@example.com',
      name: 'John Doe',
      timeZone: 'America/Chicago',
    }],
    organizer: {
      email: 'fernando@tattoo.com',
      name: 'Fernando Govea',
      timeZone: 'America/Chicago',
      username: 'fernando-govea',
    },
    status: 'accepted',
    location: 'Tattoo Studio, Dallas, TX',
    customInputs: [
      { label: 'Tattoo Type', value: 'Traditional', type: 'text' },
      { label: 'Size', value: 'Medium (4-6 inches)', type: 'text' },
      { label: 'Placement', value: 'Upper arm', type: 'text' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function CalBookingsPage() {
  const [bookings, setBookings] = useState<CalBookingPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Simulate API call to fetch bookings
    setTimeout(() => {
      setBookings(mockBookings);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const filteredBookings = bookings.filter(booking => 
    filterStatus === 'all' || booking.status === filterStatus
  );

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
        {filteredBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No bookings found</p>
          </Card>
        ) : (
          filteredBookings.map(booking => (
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
                      <p className="font-medium">{booking.attendees[0].name}</p>
                      <p className="text-sm text-gray-500">{booking.attendees[0].email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <p className="text-sm">{formatDate(booking.startTime)}</p>
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
                        ${booking.payment.amount / 100} {booking.payment.currency} - {booking.payment.status}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Tattoo Details</h4>
                  {booking.customInputs?.map((input, index) => (
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
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">Contact Client</Button>
                {booking.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" className="text-green-600">Accept</Button>
                    <Button size="sm" variant="outline" className="text-red-600">Reject</Button>
                  </>
                )}
                {booking.status === 'accepted' && (
                  <Button size="sm" variant="outline" className="text-orange-600">Reschedule</Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}