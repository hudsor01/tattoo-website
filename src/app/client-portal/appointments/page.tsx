'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Calendar, CalendarPlus, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { AppointmentCard } from '../components/AppointmentCard';
import type { Appointment } from './types';

// Dynamically import the Aftercare component
const AftercareInstructions = dynamic(
  () =>
    import('@/app/client-portal/components/AftercareInstructions').then(
      mod => mod.AftercareInstructions,
    ),
  {
    loading: () => (
      <div className="p-4 border border-gray-200 rounded-md">Loading aftercare instructions...</div>
    ),
    ssr: false,
  },
);

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [filter, setFilter] = useState('all');

  // Fetch client appointments
  useEffect(() => {
    async function fetchAppointments() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setLoading(true);
        try {
          // Fetch client data first
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (clientError) throw clientError;

          if (client) {
            // Fetch all appointments for this client
            const { data: appointmentData, error: apptError } = await supabase
              .from('appointments')
              .select('*')
              .eq('client_id', client.id)
              .order('start_time', { ascending: false });

            if (apptError) throw apptError;

            // Map database columns to our appointment interface
            const formattedAppointments = (appointmentData || []).map(appt => ({
              id: appt.id,
              title: appt.title,
              description: appt.description,
              startDate: appt.start_time,
              endDate: appt.end_time,
              status: appt.status,
              deposit: appt.deposit,
              depositPaid: appt.deposit_paid,
              createdAt: appt.created_at,
              updatedAt: appt.updated_at,
              clientId: appt.client_id,
              artistId: appt.artist_id,
              notes: appt.notes,
              location: appt.location,
            }));

            setAppointments(formattedAppointments);
            updateFilteredAppointments(formattedAppointments, tab, filter);
          }
        } catch (err) {
          console.error('Error fetching appointments:', err);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchAppointments();
  }, [tab, filter]);

  // Filter and tab handling
  const updateFilteredAppointments = (
    appts: Appointment[],
    tabValue: string,
    filterValue: string,
  ) => {
    const now = new Date();

    // First filter by tab (upcoming or past)
    let filtered = appts.filter(appt => {
      const apptDate = new Date(appt.startDate);
      return tabValue === 'upcoming' ? apptDate >= now : apptDate < now;
    });

    // Then apply additional filter
    if (filterValue !== 'all') {
      if (filterValue === 'deposit-paid') {
        filtered = filtered.filter(appt => appt.depositPaid);
      } else if (filterValue === 'deposit-due') {
        filtered = filtered.filter(appt => !appt.depositPaid);
      } else {
        // Filter by status
        filtered = filtered.filter(appt => appt.status === filterValue);
      }
    }

    // Sort by date - upcoming ascending, past descending
    filtered.sort((a, b) => {
      const aDate = new Date(a.startDate);
      const bDate = new Date(b.startDate);
      return tabValue === 'upcoming'
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });

    setFilteredAppointments(filtered);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTab(value);
    updateFilteredAppointments(appointments, value, filter);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value);
    updateFilteredAppointments(appointments, tab, value);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
        </div>

        <Skeleton className="h-12 w-full mb-4" />

        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full mb-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          My Appointments
        </motion.h1>

        <Button asChild>
          <Link href="/booking">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      {/* Tabs and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="upcoming" onValueChange={handleTabChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4 text-gray-500" />
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="deposit-due">Deposit Due</SelectItem>
              <SelectItem value="deposit-paid">Deposit Paid</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Appointment list */}
      <TabsContent value="upcoming" className="mt-0">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Upcoming Appointments</h3>
              <p className="text-gray-500 mb-4">
                You don&apos;t have any upcoming tattoo appointments scheduled.
              </p>
              <Button asChild>
                <Link href="/booking">Book Now</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {filteredAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast={false} />
            ))}
          </motion.div>
        )}
      </TabsContent>

      <TabsContent value="past" className="mt-0">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Past Appointments</h3>
              <p className="text-gray-500">You don&apos;t have any past tattoo appointments.</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {filteredAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast={true} />
            ))}
          </motion.div>
        )}
      </TabsContent>

      {/* Add the aftercare instructions component */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Tattoo Aftercare</h2>
        <p className="text-gray-600 mb-6">
          Proper aftercare is essential for your tattoo to heal correctly and look its best. Follow
          these instructions carefully and contact us if you have any questions.
        </p>

        {/* Render the dynamically imported component */}
        <AftercareInstructions />
      </div>
    </div>
  );
}
