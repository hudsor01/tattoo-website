'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format, addDays, isBefore } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  User,
  AlertTriangle,
  Check,
  X,
  Heart,
} from 'lucide-react';
import Image from 'next/image';

import { AftercareInstructions } from '@/app/client-portal/components/AftercareInstructions';
import { PaymentReceiptCard } from '@/app/client-portal/components/PaymentReceiptCard';
import AppointmentCancellationDialog from '@/app/client-portal/components/AppointmentCancellationDialog';
import AppointmentRescheduleDialog from '@/app/client-portal/components/AppointmentRescheduleDialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
}

interface AppointmentDesign {
  id: string;
  imageUrl: string;
  description?: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface Payment {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: Date;
  method: string;
  receiptUrl?: string;
}

interface PaymentData {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  created_at: string;
  payment_method: string;
  receipt_url?: string;
  [key: string]: unknown;
}

interface Appointment {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  cancelledReason?: string;
  artist: Artist;
  design?: AppointmentDesign | undefined;
  payments: Payment[];
  depositRequired: boolean;
  depositPaid: boolean;
  depositAmount?: number;
  totalAmount?: number;
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);

  // Styling configs based on status
  const statusConfig = {
    scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
    confirmed: { color: 'bg-green-100 text-green-800', icon: Check },
    completed: { color: 'bg-purple-100 text-purple-800', icon: Check },
    cancelled: { color: 'bg-red-100 text-red-800', icon: X },
  };

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);

        if (!params || !params['id']) {
          setError('Appointment ID is missing');
          setLoading(false);
          return;
        }

        const appointmentId = params['id'];

        const supabase = createClientComponentClient();

        // Check authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/client-portal/login');
          return;
        }

        // Fetch appointment data
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(
            `
            *,
            artists:artist_id (id, name, image_url, bio)
          `,
          )
          .eq('id', appointmentId)
          .eq('client_id', session.user['id'])
          .single();

        if (appointmentError || !appointmentData) {
          setError(appointmentError?.message || 'Appointment not found');
          setLoading(false);
          return;
        } // Fetch related design if exists
        const { data: designData } = await supabase
          .from('designs')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle();

        // Fetch payments
        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('appointment_id', appointmentId);

        // Format the appointment data
        const formattedAppointment: Appointment = {
          id: appointmentData.id,
          title: appointmentData.title,
          description: appointmentData.description,
          startDate: new Date(appointmentData.start_date),
          endDate: new Date(appointmentData.end_date),
          status: appointmentData.status,
          location: appointmentData.location,
          cancelledReason: appointmentData.cancellation_reason,
          artist: {
            id: appointmentData.artists?.id,
            name: appointmentData.artists?.name || 'Artist',
            imageUrl: appointmentData.artists?.image_url,
            bio: appointmentData.artists?.bio,
          },
          design: designData
            ? {
                id: designData.id,
                imageUrl: designData.image_url,
                description: designData.description,
                status: designData.status,
              }
            : undefined,
          payments: (paymentData || []).map((payment: PaymentData) => ({
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            date: new Date(payment.created_at),
            method: payment.payment_method,
            receiptUrl: payment.receipt_url,
          })),
          depositRequired: appointmentData.deposit_required || false,
          depositPaid: appointmentData.deposit_paid || false,
          depositAmount: appointmentData.deposit_amount,
          totalAmount: appointmentData.total_amount,
        };

        setAppointment(formattedAppointment);
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [params, router]);

  // Check if appointment can be cancelled (48 hour policy)
  const canCancelAppointment = () => {
    if (!appointment) return false;
    if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') return false;

    const today = new Date();
    // Allow cancellation only if appointment is more than 48 hours away
    return isBefore(today, addDays(appointment.startDate, -2));
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-48 ml-4" />
        </div>

        <Skeleton className="h-8 w-60 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3 mb-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => router.push('/client-portal/appointments')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
        </Button>

        <Alert variant="destructive" className="max-w-lg mx-auto my-8">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Appointment not found. Please check the URL and try again.'}
          </AlertDescription>
        </Alert>

        <div className="text-center mt-6">
          <Button onClick={() => router.push('/client-portal/appointments')}>
            View All Appointments
          </Button>
        </div>
      </div>
    );
  }

  const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge
        variant="secondary"
        className={`${config.color} flex items-center gap-1 text-xs px-2.5 py-1`}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const isCompletedAppointment = appointment.status === 'completed';
  const isCancelledAppointment = appointment.status === 'cancelled';
  const isUpcomingAppointment =
    appointment.status === 'scheduled' || appointment.status === 'confirmed';

  // Get payment status
  const depositStatus = appointment.depositRequired
    ? appointment.depositPaid
      ? 'Paid'
      : 'Not Paid'
    : 'Not Required';

  const hasPendingPayment = appointment.depositRequired && !appointment.depositPaid;

  return (
    <div className="container py-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => router.push('/client-portal/appointments')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">{appointment.title}</h1>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>{format(appointment.startDate, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>
                {format(appointment.startDate, 'h:mm a')} - {format(appointment.endDate, 'h:mm a')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <StatusBadge status={appointment.status} />
        </div>
      </motion.div>

      {/* Cancelled appointment notice */}
      {isCancelledAppointment && appointment.cancelledReason && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>This appointment has been cancelled</AlertTitle>
            <AlertDescription>Reason: {appointment.cancelledReason}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Appointment tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-6"
      >
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            {isCompletedAppointment && <TabsTrigger value="aftercare">Aftercare</TabsTrigger>}
            {isUpcomingAppointment && <TabsTrigger value="preparation">Preparation</TabsTrigger>}
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Appointment Information</h3>

                  <div className="space-y-4">
                    {/* Artist info */}
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 rounded-full p-1">
                        {appointment.artist.imageUrl ? (
                          <Image
                            src={appointment.artist.imageUrl}
                            alt={appointment.artist.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover w-10 h-10"
                          />
                        ) : (
                          <User className="h-10 w-10 text-slate-400 p-2" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Artist</p>
                        <p className="font-medium">{appointment.artist.name}</p>
                      </div>
                    </div>

                    {/* Location */}
                    {appointment.location && (
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-100 rounded-full p-2 mt-1">
                          <MapPin className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{appointment.location}</p>
                        </div>
                      </div>
                    )}

                    {/* Deposit info */}
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 rounded-full p-2 mt-1">
                        <CreditCard className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deposit</p>
                        <p className="font-medium">
                          {appointment.depositRequired ? (
                            <>
                              ${appointment.depositAmount?.toFixed(2)}
                              <span
                                className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                  appointment.depositPaid
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {appointment.depositPaid ? 'Paid' : 'Due'}
                              </span>
                            </>
                          ) : (
                            'Not Required'
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Design preview if available */}
                    {appointment.design && (
                      <div className="mt-6">
                        <p className="text-sm text-muted-foreground mb-2">Design Preview</p>
                        <div className="border rounded-md overflow-hidden">
                          <Image
                            src={appointment.design.imageUrl}
                            alt="Tattoo Design"
                            width={400}
                            height={300}
                            className="w-full object-cover"
                          />
                          {appointment.design.description && (
                            <p className="p-3 text-sm">{appointment.design.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right column */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>

                  {appointment.description && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="mt-1">{appointment.description}</p>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h4 className="font-medium">What to Bring</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Valid ID (driver's license or passport)</li>
                      <li>Comfortable loose-fitting clothes</li>
                      <li>Water and snacks for longer sessions</li>
                      <li>Forms of entertainment (headphones, book, etc.)</li>
                    </ul>

                    <h4 className="font-medium mt-6">Studio Policies</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Please arrive 15 minutes before your appointment</li>
                      <li>No alcohol or drugs before your appointment</li>
                      <li>Limit guests to one person</li>
                      <li>48-hour cancellation policy</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-end mt-6">
              {isUpcomingAppointment && canCancelAppointment() && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowCancellationDialog(true)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Appointment
                </Button>
              )}

              {isUpcomingAppointment && canCancelAppointment() && (
                <Button variant="secondary" onClick={() => setShowRescheduleDialog(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Reschedule
                </Button>
              )}

              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Contact Studio
              </Button>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>

                <div className="space-y-4">
                  {/* Payment summary */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Deposit</span>
                      <span className="font-medium">
                        {appointment.depositRequired
                          ? `$${appointment.depositAmount?.toFixed(2)}`
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Deposit Status</span>
                      <Badge
                        variant={appointment.depositPaid ? 'success' : 'outline'}
                        className={appointment.depositPaid ? '' : 'text-yellow-700'}
                      >
                        {depositStatus}
                      </Badge>
                    </div>

                    {appointment.totalAmount && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Estimated Total</span>
                        <span className="font-medium">${appointment.totalAmount?.toFixed(2)}</span>
                      </div>
                    )}

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        * Final amount may vary based on the completed work
                      </span>
                    </div>
                  </div>

                  {/* Payment history */}
                  {appointment.payments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Payment History</h4>

                      <div className="space-y-3">
                        {appointment.payments.map(payment => (
                          <PaymentReceiptCard
                            key={payment.id}
                            amount={payment.amount}
                            date={payment.date}
                            method={payment.method}
                            status={payment.status}
                            receiptUrl={payment.receiptUrl}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pay deposit button */}
                  {hasPendingPayment && (
                    <div className="mt-6">
                      <Button className="w-full md:w-auto">Pay Deposit Now</Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        * Deposit must be paid to secure your appointment
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aftercare Tab - only for completed appointments */}
          {isCompletedAppointment && (
            <TabsContent value="aftercare" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold">Tattoo Aftercare Instructions</h3>
                  </div>

                  <AftercareInstructions />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Preparation Tab - only for upcoming appointments */}
          {isUpcomingAppointment && (
            <TabsContent value="preparation" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Preparation Guidelines</h3>

                  <div className="space-y-5">
                    <h4 className="font-medium">Before Your Appointment</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Get a good night's sleep before your session</li>
                      <li>Eat a full meal 1-2 hours before your appointment</li>
                      <li>Stay hydrated the day before and day of your appointment</li>
                      <li>Avoid alcohol for 24 hours before your session</li>
                      <li>Avoid blood thinners like aspirin if possible (consult your doctor)</li>
                      <li>Shower before your appointment</li>
                      <li>
                        Moisturize the area to be tattooed (but not right before the appointment)
                      </li>
                      <li>Wear appropriate clothing that allows easy access to the tattoo area</li>
                    </ul>

                    <Alert>
                      <AlertTitle>Important Note</AlertTitle>
                      <AlertDescription>
                        If you are feeling sick or have a skin condition in the area to be tattooed,
                        please contact us to reschedule. We cannot tattoo over sunburned, irritated,
                        or broken skin.
                      </AlertDescription>
                    </Alert>

                    <h4 className="font-medium mt-2">What to Bring</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Valid photo ID (required)</li>
                      <li>Water and snacks for longer sessions</li>
                      <li>Entertainment (headphones, tablet, book)</li>
                      <li>A friend for support (one guest maximum)</li>
                      <li>Payment method (cash or card)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </motion.div>

      {/* Cancellation Dialog */}
      <AppointmentCancellationDialog
        isOpen={showCancellationDialog}
        onClose={() => setShowCancellationDialog(false)}
        appointmentId={appointment.id}
        appointmentDate={appointment.startDate}
        appointmentTitle={appointment.title}
      />

      {/* Reschedule Dialog */}
      <AppointmentRescheduleDialog
        isOpen={showRescheduleDialog}
        onClose={() => setShowRescheduleDialog(false)}
        appointmentId={appointment.id}
        currentDate={appointment.startDate}
        appointmentTitle={appointment.title}
      />
    </div>
  );
}
