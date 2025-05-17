'use client';

import React, { useState, useEffect } from 'react';
import { VirtualizedList } from './VirtualizedList';
import type { Column } from './VirtualizedList';
import { Badge } from '@mui/material';
import { useBookings } from '@/hooks/bookings';
import { formatDistanceToNow } from 'date-fns';
import type { Booking } from '@/types/booking-types';

interface VirtualizedBookingsListProps {
  limit?: number;
  onRowClick?: (booking: Booking) => void;
  containerHeight?: number;
  defaultStatus?: string | null;
}

/**
 * A virtualized list component specifically for displaying bookings
 */
export function VirtualizedBookingsList({
  limit = 100,
  onRowClick,
  containerHeight = 500,
  defaultStatus = null,
}: VirtualizedBookingsListProps) {
  const { bookings, loading } = useBookings();
  const [page, setPage] = useState(1);
  const [displayedBookings, setDisplayedBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (bookings) {
      // Apply status filter if defaultStatus is provided
      const filteredBookings = defaultStatus
        ? bookings.filter(booking => booking.status === defaultStatus)
        : bookings;

      setDisplayedBookings(filteredBookings.slice(0, page * limit));
    }
  }, [bookings, page, limit, defaultStatus]);

  const loadNextPage = () => {
    setPage(prev => prev + 1);
  };

  const columns: Column<Booking>[] = [
    {
      field: 'clientName',
      headerName: 'Customer',
      flex: 2,
      renderCell: booking => (
        <div className="flex flex-col">
          <span className="font-medium">{booking.clientName}</span>
          <span className="text-xs text-gray-500">{booking.clientEmail}</span>
        </div>
      ),
    },
    {
      field: 'placement',
      headerName: 'Tattoo Details',
      flex: 2,
      renderCell: booking => (
        <div className="flex flex-col">
          <span>
            {booking.tattooSize} • {booking.placement}
          </span>
          <span className="text-xs text-gray-500 truncate max-w-[200px]">
            {booking.description}
          </span>
        </div>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Requested',
      flex: 1,
      renderCell: booking => (
        <span className="text-sm">
          {booking.createdAt &&
            formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: booking => {
        const getColor = () => {
          switch (booking.status) {
            case 'pending':
              return 'warning';
            case 'approved':
              return 'success';
            case 'rejected':
              return 'error';
            case 'cancelled':
              return 'default';
            default:
              return 'default';
          }
        };

        return (
          <Badge
            color={getColor()}
            variant="dot"
            sx={{ '& .MuiBadge-badge': { position: 'static', marginRight: 1, transform: 'none' } }}
          >
            <span className="capitalize">{booking.status}</span>
          </Badge>
        );
      },
    },
  ];

  const hasNextPage = displayedBookings.length < (bookings?.length || 0);

  // Cast the components to appropriate types for VirtualizedList
  const typedColumns = columns as unknown as Column<unknown>[];
  const typedItems = displayedBookings as unknown as unknown[];

  return (
    <VirtualizedList
      columns={typedColumns}
      items={typedItems}
      isLoading={loading}
      loadNextPage={loadNextPage}
      onRowClick={item => onRowClick?.(item as Booking)}
      containerHeight={containerHeight}
      hasNextPage={hasNextPage}
    />
  );
}
VirtualizedBookingsList.displayName = 'VirtualizedBookingsList';
export default VirtualizedBookingsList;
