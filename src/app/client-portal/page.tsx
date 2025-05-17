'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, CreditCard, AlertTriangle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function ClientPortalDashboard() {
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [recentDesigns, setRecentDesigns] = useState<any[]>([]);
  const [paymentsDue, setPaymentsDue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [missingForms, setMissingForms] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    'loading'
  );

  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error checking auth user:', error);
        setAuthStatus('unauthenticated');
        router.push('/client/login');
        return;
      }

      if (data.user) {
        // We still need session data for tokens, etc.
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
        router.push('/client/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (authStatus === 'authenticated' && session?.user?.email) {
        setLoading(true);

        try {
          // Use user data from the session instead of querying clients table
          const userData = session.user;

          // Set user metadata with fallbacks
          const clientData = {
            id: userData.id,
            email: userData.email,
            first_name: userData.user_metadata?.first_name || 'Client',
            last_name: userData.user_metadata?.last_name || '',
            portal_enabled: true,
          };

          setClientData(clientData);

          // Set empty data for now - these would normally come from database tables
          setUpcomingAppointment(null);
          setRecentDesigns([]);
          setPaymentsDue([]);
          setMissingForms([]);
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        } finally {
          setLoading(false);
        }
      } else if (authStatus === 'unauthenticated') {
        router.push('/client/login');
      }
    }

    if (authStatus === 'authenticated' && session) {
      fetchDashboardData();
    }
  }, [session, authStatus, router]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-3/4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>

        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          className="text-3xl font-bold mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Welcome back, {clientData?.first_name}
        </motion.h1>
        <motion.p
          className="text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Here's an overview of your tattoo journey with Ink 37
        </motion.p>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 text-tattoo-red" size={20} />
                Next Appointment
              </CardTitle>
              <CardDescription>Your upcoming tattoo session</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointment ? (
                <div>
                  <h3 className="font-semibold text-lg mb-2">{upcomingAppointment.title}</h3>
                  <div className="flex items-center text-gray-500 mb-1">
                    <Clock size={16} className="mr-2" />
                    <span>
                      {new Date(upcomingAppointment.start_time).toLocaleDateString()} at{' '}
                      {new Date(upcomingAppointment.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Badge
                      className={upcomingAppointment.deposit_paid ? 'bg-green-500' : 'bg-amber-500'}
                    >
                      {upcomingAppointment.deposit_paid ? 'Deposit Paid' : 'Deposit Due'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center h-24">
                  <p>No upcoming appointments</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/booking">Book a Session</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {upcomingAppointment && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/client/appointments/${upcomingAppointment.id}`}>
                    View Upcoming Appointments
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>

        {/* Recent Designs Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 text-tattoo-red" size={20} />
                My Designs
              </CardTitle>
              <CardDescription>Your tattoo designs and references</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDesigns.length > 0 ? (
                <div className="space-y-3">
                  {recentDesigns.map(design => (
                    <div key={design.id} className="flex items-center gap-3">
                      {design.thumbnail_url ? (
                        <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden relative">
                          <img
                            src={design.thumbnail_url}
                            alt={design.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                          <FileText size={18} className="text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{design.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(design.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center h-24">
                  <p>No designs uploaded yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/client/designs">
                  {recentDesigns.length > 0 ? 'View All Designs' : 'Upload a Design'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Payments Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 text-tattoo-red" size={20} />
                Payments
              </CardTitle>
              <CardDescription>Manage your deposits and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsDue.length > 0 ? (
                <div className="space-y-3">
                  {paymentsDue.map(appointment => (
                    <div key={appointment.id} className="border-l-4 border-amber-500 pl-3 py-2">
                      <h4 className="font-medium text-sm">{appointment.title}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.start_time).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium">${appointment.deposit_amount}</span>
                        <Button asChild size="sm" variant="default">
                          <Link href={`/client/payments/${appointment.id}`}>Pay Deposit</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center h-24">
                  <p>No payments due</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/client/payments">View Payment History</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Missing forms alert */}
      {missingForms.length > 0 && upcomingAppointment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-amber-100 rounded-full">
                  <AlertTriangle className="text-amber-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Required Forms Needed</h3>
                  <p className="text-gray-600 mb-4">
                    Please complete the following forms before your upcoming appointment:
                  </p>
                  <ul className="space-y-2 mb-4">
                    {missingForms.map(form => (
                      <li key={form.id} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                        <span>{form.title}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild>
                    <Link href={`/client/forms/${upcomingAppointment.id}`}>Complete Forms</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
