'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { VirtualizedBookingsList } from '@/app/admin-dashboard/components/VirtualizedBookingsList';
import type { Booking } from '@/types/booking-types';
import { CalendarDays, Notebook } from 'lucide-react';
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

export default function BookingsPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  // We need to keep this state even though the setter isn't directly used in this file
  // because the VirtualizedBookingsList component likely uses it via props
  const [selectedBooking, /*setSelectedBooking*/] = useState<Booking | null>(null);

  // Get the status based on tab value
  const getStatusFilter = () => {
    switch (selectedTab) {
      case 'all':
        return null;
      case 'pending':
        return 'pending';
      case 'paid':
        return 'paid';
      default:
        return null;
    }
  };

  // Set selected booking directly using state setters when needed

  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-start mb-8 p-6 bg-gray-900 rounded-lg shadow-lg">
        <div className="bg-red-500/10 text-red-500 rounded-lg p-3 mr-4 flex items-center justify-center">
          <Notebook className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Booking Requests
          </h1>
          <p className="text-gray-400">
            Manage tattoo booking requests and convert them to appointments
          </p>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="mb-6 bg-gray-900 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="pending">Pending Deposit</TabsTrigger>
              <TabsTrigger value="paid">Deposit Paid</TabsTrigger>
            </TabsList>
          </Tabs>

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
      </div>

      {/* Virtualized Bookings List */}
      <VirtualizedBookingsList defaultStatus={getStatusFilter()} containerHeight={650} />

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Review booking information and convert to appointment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-500 mb-3">
                    Customer Information
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-semibold min-w-[100px]">Name:</span>
                      <span>{selectedBooking.clientName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold min-w-[100px]">Email:</span>
                      <span>{selectedBooking.clientEmail}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold min-w-[100px]">Phone:</span>
                      <span>{selectedBooking.clientPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-500 mb-3">
                    Booking Details
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-semibold min-w-[100px]">Tattoo Type:</span>
                      <span>{selectedBooking.tattooType}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold min-w-[100px]">Size:</span>
                      <span>{selectedBooking.tattooSize}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold min-w-[100px]">Placement:</span>
                      <span>{selectedBooking.placement}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold min-w-[100px]">Status:</span>
                      <span className={selectedBooking.depositPaid ? 'text-green-500' : 'text-red-500'}>
                        {selectedBooking.depositPaid ? 'Deposit Paid' : 'Pending Deposit'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-red-500 mb-3">
                  Schedule Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold mb-1">Preferred Date:</p>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {selectedBooking.preferredDate &&
                          format(new Date(selectedBooking.preferredDate), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">Preferred Time:</p>
                    <span>{selectedBooking.preferredTime}</span>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">Booking Date:</p>
                    <span>
                      {selectedBooking.createdAt &&
                        format(new Date(selectedBooking.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-red-500 mb-3">
                  Tattoo Description
                </h3>
                
                <p className="whitespace-pre-line">{selectedBooking.description}</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Close
              </Button>
              
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  router.push(`/admin-dashboard/appointments/create?bookingId=${selectedBooking.id}`);
                }}
              >
                Convert to Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}