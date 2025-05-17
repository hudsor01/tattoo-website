'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { addDays, isBefore, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { AlertCircle, Calendar, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAppointmentCancellation } from '@/hooks/trpc/use-appointment-cancellation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const cancellationSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason for cancellation (min 10 characters)').max(500, 'Reason must be less than 500 characters'),
});

type CancellationFormValues = z.infer<typeof cancellationSchema>;

interface AppointmentCancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  appointmentDate: Date;
  appointmentTitle: string;
}

export default function AppointmentCancellationDialog({
  isOpen,
  onClose,
  appointmentId,
  appointmentDate,
  appointmentTitle,
}: AppointmentCancellationDialogProps) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { cancelAppointment, canCancelAppointment, isLoading, error } = useAppointmentCancellation();
  
  const form = useForm<CancellationFormValues>({
    resolver: zodResolver(cancellationSchema),
    defaultValues: {
      reason: '',
    },
  });
  
  const canCancel = canCancelAppointment(appointmentDate);
  const cancellationDeadline = addDays(appointmentDate, -2);
  
  const onSubmit = async (data: CancellationFormValues) => {
    if (!canCancel) {
      return;
    }
    
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    const success = await cancelAppointment(appointmentId, data.reason);
    
    if (success) {
      onClose();
      router.refresh();
      router.push('/client-portal/appointments');
    }
  };
  
  const handleClose = () => {
    form.reset();
    setShowConfirmation(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {showConfirmation ? 'Confirm Cancellation' : 'Cancel Appointment'}
          </DialogTitle>
          <DialogDescription>
            {showConfirmation 
              ? 'Are you sure you want to cancel this appointment? This action cannot be undone.'
              : 'Please provide a reason for cancellation.'}
          </DialogDescription>
        </DialogHeader>
        
        {!canCancel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cannot Cancel Appointment</AlertTitle>
              <AlertDescription>
                This appointment cannot be cancelled as it is less than 48 hours away.
                Please contact the studio directly if you need to make changes.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {canCancel && !showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
          >
            <Alert variant="warning">
              <Calendar className="h-4 w-4" />
              <AlertTitle>Cancellation Policy</AlertTitle>
              <AlertDescription>
                Appointments must be cancelled at least 48 hours in advance.
                Your cancellation deadline is {format(cancellationDeadline, 'MMMM d, yyyy h:mm a')}.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!showConfirmation && (
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Cancellation</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please explain why you need to cancel this appointment..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {showConfirmation && (
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-slate-50">
                  <p className="font-medium">Appointment to cancel:</p>
                  <p className="text-muted-foreground">{appointmentTitle}</p>
                  <p className="text-muted-foreground">{format(appointmentDate, 'MMMM d, yyyy h:mm a')}</p>
                </div>
                
                <div className="border rounded-md p-4 bg-slate-50">
                  <p className="font-medium">Reason for cancellation:</p>
                  <p className="text-muted-foreground">{form.getValues().reason}</p>
                </div>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {showConfirmation ? 'Go Back' : 'Cancel'}
              </Button>
              
              <Button
                type="submit"
                variant={showConfirmation ? "destructive" : "default"}
                disabled={!canCancel || isLoading}
              >
                {isLoading ? 'Processing...' : (showConfirmation ? 'Confirm Cancellation' : 'Continue')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}