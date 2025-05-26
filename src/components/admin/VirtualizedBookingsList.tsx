'use client';

import React, { useState, useMemo } from 'react';
import { Search, Calendar, User, Clock, DollarSign, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';
import type { VirtualizedBookingsListProps } from '@/types/component-types';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
  'no-show': 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function VirtualizedBookingsList({
  defaultStatus,
  containerHeight = 600,
}: VirtualizedBookingsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatus ?? 'all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());

  // Fetch bookings with tRPC
  const { data: bookingsData, isLoading } = trpc.dashboard.getRecentBookings.useQuery({
    limit: 50,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  // Process and filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookingsData?.bookings) return [];

    let filtered = bookingsData.bookings;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.name?.toLowerCase().includes(searchLower) ||
          booking.email?.toLowerCase().includes(searchLower) ||
          booking.tattooType?.toLowerCase().includes(searchLower) ||
          booking.placement?.toLowerCase().includes(searchLower) ||
          false
      );
    }

    // Sort bookings
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name-asc': {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB);
        }
        case 'name-desc': {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameB.localeCompare(nameA);
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [bookingsData, searchTerm, sortBy]);

  const toggleExpanded = (bookingId: number) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  if (isLoading) {
    return (
      <div style={{ height: containerHeight }} className="flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          {Array.from({ length: 5 }, (_, i) => `loading-skeleton-${i}`).map((key) => (
            <div key={key} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: containerHeight }} className="flex flex-col">
      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No bookings found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <Collapsible key={booking.id}>
              <Card className="border-l-4 border-l-blue-500">
                <CollapsibleTrigger asChild>
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 pb-4"
                    onClick={() => toggleExpanded(booking.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <CardTitle className="text-base">{booking.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{booking.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            statusColors[
                              (booking.status ?? 'pending') as keyof typeof statusColors
                            ] ?? 'bg-gray-100 text-gray-800'
                          }
                        >
                          {booking.status ?? 'pending'}
                        </Badge>
                        <div className="text-right text-sm">
                          <p className="font-medium">
                            {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-muted-foreground">
                            {format(new Date(booking.createdAt), 'h:mm a')}
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedBookings.has(booking.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Tattoo Details */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Tattoo Details
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500">Type:</span>{' '}
                            {booking.tattooType ?? 'Not specified'}
                          </p>
                          <p>
                            <span className="text-gray-500">Size:</span>{' '}
                            {booking.size ?? 'Not specified'}
                          </p>
                          <p>
                            <span className="text-gray-500">Placement:</span>{' '}
                            {booking.placement ?? 'Not specified'}
                          </p>
                          <p>
                            <span className="text-gray-500">Est. Price:</span> Estimate pending
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Contact Info
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500">Email:</span> {booking.email}
                          </p>
                          <p>
                            <span className="text-gray-500">Customer ID:</span>{' '}
                            {booking.customerId ?? 'Not linked'}
                          </p>
                        </div>
                      </div>

                      {/* Booking Info */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Booking Info
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500">Booked:</span>{' '}
                            {format(new Date(booking.createdAt), 'PPP p')}
                          </p>
                          {booking.preferredDate && (
                            <p>
                              <span className="text-gray-500">Preferred:</span>{' '}
                              {booking.preferredDate}
                            </p>
                          )}
                          {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                            <p>
                              <span className="text-gray-500">Updated:</span>{' '}
                              {format(new Date(booking.updatedAt), 'PPP p')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {booking.description && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">Description</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                          {booking.description}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      {(booking.status === 'pending' || !booking.status) && (
                        <Button size="sm">Confirm</Button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="flex-shrink-0 mt-4 pt-4 border-t">
        <p className="text-sm text-gray-500">
          Showing {filteredBookings.length} of {bookingsData?.totalCount ?? 0} bookings
        </p>
      </div>
    </div>
  );
}
