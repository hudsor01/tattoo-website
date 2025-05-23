'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  RefreshCcw, 
  AlertTriangle,
  Search,
  Download,
  ExternalLink,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Calendar,
  Edit
} from 'lucide-react';
import { useCalBookings } from '@/hooks/use-cal-bookings';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
    isConfigured
  } = useCalBookings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const handleAccept = async (uid: string) => {
    try {
      await updateBookingStatus(uid, 'accepted');
      toast({
        title: 'Booking Accepted',
        description: 'The booking has been accepted successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to accept booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (uid: string) => {
    try {
      await updateBookingStatus(uid, 'rejected');
      toast({
        title: 'Booking Rejected',
        description: 'The booking has been rejected.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reject booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (uid: string) => {
    try {
      await updateBookingStatus(uid, 'cancelled');
      toast({
        title: 'Booking Cancelled',
        description: 'The booking has been cancelled.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = (booking: any) => {
    setSelectedBooking(booking);
    setIsRescheduleDialogOpen(true);
  };

  const handleAddNotes = (booking: any) => {
    setSelectedBooking(booking);
    setInternalNotes(booking.internalNotes || '');
    setIsNotesDialogOpen(true);
  };

  const handleExportBookings = () => {
    const csv = [
      ['Date', 'Time', 'Client Name', 'Email', 'Phone', 'Status', 'Service', 'Duration', 'Location'],
      ...filteredBookings.map(booking => [
        formatDate(booking.startTime),
        formatTime(booking.startTime),
        booking.attendees?.[0]?.name || 'N/A',
        booking.attendees?.[0]?.email || 'N/A',
        // phoneNumber property does not exist, so output 'N/A'
        'N/A',
        booking.status,
        booking.title,
        formatDuration(booking.startTime, booking.endTime),
        booking.location || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cal-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.attendees?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.attendees?.[0]?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group bookings by date for better organization
  const groupedBookings = filteredBookings.reduce((groups, booking) => {
    const date = new Date(booking.startTime).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(booking);
    return groups;
  }, {} as Record<string, any[]>);

  // Check if Cal.com is properly configured
  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Cal.com Integration</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cal.com Integration Not Configured</AlertTitle>
          <AlertDescription>
            Please set up the required environment variables to enable Cal.com integration.
          </AlertDescription>
        </Alert>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Configuration Steps</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Required Environment Variables</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">CAL_API_KEY</code></li>
                <li><code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_CAL_USERNAME</code></li>
                <li><code className="bg-gray-100 px-1 rounded">CAL_WEBHOOK_SECRET</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Setup Instructions</h4>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600">
                <li>Create a Cal.com account</li>
                <li>Generate an API key in your dashboard</li>
                <li>Configure webhook endpoints</li>
                <li>Add variables to your .env file</li>
                <li>Restart the application</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Cal.com Bookings</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cal.com Bookings</h1>
          <p className="text-gray-600 mt-1">
            {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={syncBookings} 
            disabled={isSyncing} 
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </Button>
          
          <Button 
            onClick={handleExportBookings}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'pending', 'accepted', 'cancelled', 'rejected'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="flex items-center gap-1"
            >
              {status !== 'all' && getStatusIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {Object.keys(groupedBookings).length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No bookings match the current filters.'}
            </p>
          </Card>
        ) : (
          Object.entries(groupedBookings).map(([date, dayBookings]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              
              {dayBookings.map(booking => (
                <Card key={booking.id} className="p-6 hover:shadow-md transition-all duration-200 border-l-4" 
                      style={{ borderLeftColor: booking.status === 'accepted' ? '#10b981' : 
                                               booking.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{booking.title}</h3>
                        <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Duration: {formatDuration(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Booking ID</p>
                      <p className="font-mono text-sm">{booking.uid.slice(-8)}</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Client Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">Client</h4>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{booking.attendees?.[0]?.name || 'No name'}</p>
                          <p className="text-sm text-gray-600">{booking.attendees?.[0]?.email || 'No email'}</p>
                        </div>
                      </div>

                      {booking.attendees?.[0]?.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <p className="text-sm">{booking.attendees[0].phoneNumber}</p>
                        </div>
                      )}

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
                    </div>

                    {/* Service Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">Service Details</h4>
                      {booking.customInputs && Array.isArray(booking.customInputs) && booking.customInputs.map((input: CalCustomInput, index: number) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-gray-600">{input.label}:</span>{' '}
                          <span className="text-gray-800">{input.value}</span>
                        </div>
                      ))}
                      {booking.additionalNotes && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Notes:</span>
                          <p className="text-gray-800 mt-1 p-2 bg-gray-50 rounded text-xs">{booking.additionalNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment & Actions */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">Payment & Actions</h4>
                      
                      {booking.payment && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <p className="text-sm">
                            ${booking.payment?.amount ? booking.payment.amount / 100 : 0} {booking.payment?.currency || 'USD'}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              booking.payment?.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.payment?.status || 'pending'}
                            </span>
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`https://cal.com/bookings/${booking.uid}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Cal.com
                          </a>
                        </Button>
                        
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${booking.attendees?.[0]?.email || ''}`}>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Email
                          </a>
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAddNotes(booking)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Notes
                        </Button>
                      </div>

                      {/* Status-specific actions */}
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(booking.uid)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReject(booking.uid)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === 'accepted' && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReschedule(booking)}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Reschedule
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleCancel(booking.uid)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>
              Reschedule booking for {selectedBooking?.attendees?.[0]?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Current time: {selectedBooking && formatDate(selectedBooking.startTime)} at {selectedBooking && formatTime(selectedBooking.startTime)}
            </p>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                In a full implementation, this would integrate with Cal.com's reschedule API 
                and show an interactive calendar picker.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: 'Reschedule Feature',
                description: 'This would integrate with Cal.com reschedule API in production.',
              });
              setIsRescheduleDialogOpen(false);
            }}>
              Open Cal.com
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Internal Notes</DialogTitle>
            <DialogDescription>
              Add private notes for {selectedBooking?.attendees?.[0]?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add internal notes about this booking..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: 'Notes Saved',
                description: 'Internal notes have been updated.',
              });
              setIsNotesDialogOpen(false);
            }}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}