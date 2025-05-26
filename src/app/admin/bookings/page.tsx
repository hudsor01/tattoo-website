'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarDays, Notebook, RefreshCcw, Download, ExternalLink, MessageSquare, CheckCircle, XCircle, Edit, User, Clock, MapPin, DollarSign, Phone, Search, Globe, Calendar as CalIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils/styling';
import { useCalBookings } from '@/hooks/use-cal-bookings';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
// import type { CalBookingPayload } from '@/types/booking-types' // Commented out unused import
interface UnifiedBooking {
  id: string;
  source: 'website' | 'cal.com';
  clientName: string;
  clientEmail: string;
  clientPhone?: string | undefined;
  title: string;
  status: string;
  startTime: string;
  endTime?: string;
  createdAt: string;
  description?: string;
  tattooType?: string;
  tattooSize?: string;
  placement?: string;
  preferredDate?: string;
  preferredTime?: string;
  depositPaid?: boolean;
  location?: string | undefined;
  payment?: { amount?: number; currency?: string } | null;
  customInputs?: { label: string; value: string }[] | undefined;
  additionalNotes: string;
  uid?: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<UnifiedBooking | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Get Cal.com bookings
  const { 
    calBookings, 
    isSyncing,
    syncBookings,
    updateBookingStatus
  } = useCalBookings();

  // Convert Cal.com bookings to unified format
  const unifiedCalBookings: UnifiedBooking[] = useMemo(() => {
    return calBookings.map((booking) => ({
      id: booking.uid,
      source: 'cal.com' as const,
      clientName: booking.attendees?.[0]?.name ?? 'No name',
      clientEmail: booking.attendees?.[0]?.email ?? 'No email',
      clientPhone: undefined, // Phone number needs to be handled differently
      title: booking.title,
      status: booking.status,
      startTime: booking.startTime,
      endTime: booking.endTime,
      createdAt: booking.startTime, // Use start time as created date for sorting
      location: booking.location ?? undefined,
      payment: booking.payment && Array.isArray(booking.payment) && booking.payment.length > 0 
        ? { amount: (booking.eventType as { price?: number; currency?: string })?.price ?? 0, currency: (booking.eventType as { price?: number; currency?: string })?.currency ?? 'USD' } 
        : null,
      customInputs: Array.isArray(booking.customInputs) 
        ? booking.customInputs.filter((input) => input.label && input.value).map((input) => ({
            label: input.label,
            value: String(input.value)
          }))
        : undefined,
      additionalNotes: booking.description ?? '',
      uid: booking.uid
    }));
  }, [calBookings]);

  // Combine all bookings (website bookings would come from the VirtualizedBookingsListInfinite component)
  const allBookings = useMemo(() => {
    // For now, just return Cal.com bookings. In a full implementation, you'd merge with website bookings
    return unifiedCalBookings;
  }, [unifiedCalBookings]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return allBookings.filter(booking => {
      const matchesSearch = !searchTerm || booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedTab === 'all' || 
        (selectedTab === 'pending' && (booking.status === 'pending' || !booking.depositPaid)) ||
        (selectedTab === 'paid' && (booking.status === 'accepted' || booking.depositPaid));
      
      const matchesSource = sourceFilter === 'all' || booking.source === sourceFilter;
      
      const matchesDate = !dateFilter || format(new Date(booking.startTime), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
      
      return matchesSearch && matchesStatus && matchesSource && matchesDate;
    });
  }, [allBookings, searchTerm, selectedTab, sourceFilter, dateFilter]);

  // Group bookings by date
  const groupedBookings = useMemo(() => {
    return filteredBookings.reduce((groups, booking) => {
      const date = new Date(booking.startTime).toDateString();
      groups[date] = groups[date] ?? [];
      groups[date].push(booking);
      return groups;
    }, {} as Record<string, UnifiedBooking[]>);
  }, [filteredBookings]);

  const getStatusColor = (status: string, source: string) => {
    if (source === 'website') {
      return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceBadge = (source: string) => {
    return source === 'cal.com' ? 
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <CalIcon className="w-3 h-3 mr-1" />
        Cal.com
      </Badge> :
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        <Globe className="w-3 h-3 mr-1" />
        Website
      </Badge>;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'N/A';
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

  const handleAccept = (booking: UnifiedBooking) => {
    if (booking.source === 'cal.com' && booking.uid) {
      updateBookingStatus(booking.uid, 'accepted');
    }
  };

  const handleReject = (booking: UnifiedBooking) => {
    if (booking.source === 'cal.com' && booking.uid) {
      updateBookingStatus(booking.uid, 'rejected');
    }
  };

  const handleExportBookings = () => {
    const csv = [
      ['Date', 'Time', 'Client Name', 'Email', 'Phone', 'Status', 'Service', 'Duration', 'Source', 'Location'],
      ...filteredBookings.map(booking => [
        format(new Date(booking.startTime), 'yyyy-MM-dd'),
        formatTime(booking.startTime),
        booking.clientName,
        booking.clientEmail,
        booking.clientPhone ?? 'N/A',
        booking.status,
        booking.title,
        formatDuration(booking.startTime, booking.endTime),
        booking.source,
        booking.location ?? 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    void a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-start mb-8 p-6 bg-gray-900 rounded-lg shadow-lg">
        <div className="bg-red-500/10 text-red-500 rounded-lg p-3 mr-4 flex items-center justify-center">
          <Notebook className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-1">
            All Booking Requests
          </h1>
          <p className="text-gray-400">
            Manage bookings from website forms and Cal.com scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => void syncBookings()} 
            disabled={isSyncing} 
            variant="outline"
            size="sm"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Cal.com'}
          </Button>
          
          <Button 
            onClick={handleExportBookings}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 bg-gray-900 p-4 rounded-lg space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Confirmed</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Source Filter */}
          <div className="flex gap-2">
            {['all', 'website', 'cal.com'].map(source => (
              <Button
                key={source}
                variant={sourceFilter === source ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter(source)}
              >
                {source === 'cal.com' && <CalIcon className="w-3 h-3 mr-1" />}
                {source === 'website' && <Globe className="w-3 h-3 mr-1" />}
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {Object.keys(groupedBookings).length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No bookings match the current filters.'}
            </p>
          </Card>
        ) : (
          Object.entries(groupedBookings).map(([date, dayBookings]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              
              {dayBookings.map(booking => (
                <Card key={booking.id} className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 border-l-4" 
                      style={{ borderLeftColor: booking.status === 'accepted' ? '#10b981' : 
                                               booking.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{booking.title}</h3>
                        <Badge className={getStatusColor(booking.status, booking.source)}>
                          {booking.status}
                        </Badge>
                        {getSourceBadge(booking.source)}
                      </div>
                      <p className="text-sm text-gray-400">
                        Duration: {formatDuration(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Booking ID</p>
                      <p className="font-mono text-sm text-gray-300">{booking.id.slice(-8)}</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Client Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-400 uppercase tracking-wide">Client</h4>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-white">{booking.clientName}</p>
                          <p className="text-sm text-gray-400">{booking.clientEmail}</p>
                        </div>
                      </div>

                      {booking.clientPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-300">{booking.clientPhone}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-300">
                          {formatTime(booking.startTime)} {booking.endTime && `- ${formatTime(booking.endTime)}`}
                        </p>
                      </div>

                      {booking.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-300">{booking.location}</p>
                        </div>
                      )}
                    </div>

                    {/* Service Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-400 uppercase tracking-wide">Service Details</h4>
                      
                      {booking.tattooType && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-500">Type:</span>{' '}
                          <span className="text-gray-300">{booking.tattooType}</span>
                        </div>
                      )}
                      
                      {booking.customInputs?.map((input: { label: string; value: string }, index: number) => (
                        <div key={`custom-input-${booking.id}-${input.label ?? `field-${index}`}`} className="text-sm">
                          <span className="font-medium text-gray-500">{input.label}:</span>{' '}
                          <span className="text-gray-300">{input.value}</span>
                        </div>
                      ))}
                      
                      {(booking.description ?? booking.additionalNotes) && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-500">Notes:</span>
                          <p className="text-gray-300 mt-1 p-2 bg-gray-700 rounded text-xs">
                            {booking.description ?? booking.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-400 uppercase tracking-wide">Actions</h4>
                      
                      {booking.payment && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-300">
                            ${booking.payment?.amount ? booking.payment.amount / 100 : 0} {booking.payment?.currency ?? 'USD'}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {booking.source === 'cal.com' && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`https://cal.com/bookings/${booking.uid}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Cal.com
                            </a>
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${booking.clientEmail}`}>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Email
                          </a>
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setInternalNotes('');
                            setIsNotesDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Notes
                        </Button>
                      </div>

                      {/* Status-specific actions */}
                      {booking.status === 'pending' && booking.source === 'cal.com' && (
                        <div className="flex gap-2 pt-2 border-t border-gray-600">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => { void handleAccept(booking); }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => { void handleReject(booking); }}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {booking.source === 'website' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            void router.push(`/admin/appointments/create?bookingId=${booking.id}`);
                          }}
                        >
                          Convert to Appointment
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Internal Notes</DialogTitle>
            <DialogDescription>
              Add private notes for {selectedBooking?.clientName}
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