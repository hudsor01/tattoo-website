'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { addDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAppointmentReschedule } from '@/hooks/trpc/use-appointment-reschedule';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils';
import { TimeSelect } from '@/components/ui/time-select';

const rescheduleSchema = z.object({
  date: z.date({
    required_error: 'Please select a date',
  }),
  time: z.string({
    required_error: 'Please select a time',
  }),
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

interface AppointmentRescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  currentDate: Date;
  appointmentTitle: string;
}

export default function AppointmentRescheduleDialog({
  isOpen,
  onClose,
  appointmentId,
  currentDate,
  appointmentTitle,
}: AppointmentRescheduleDialogProps) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { rescheduleAppointment, isLoading, error } = useAppointmentReschedule();

  const form = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: new Date(currentDate),
      time: format(new Date(currentDate), 'HH:mm'),
    },
  });

  const today = new Date();
  const minBookingDate = addDays(today, 1); // Allow booking from tomorrow

  const onSubmit = async (data: RescheduleFormValues) => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // Extract hours and minutes from time string (format: "HH:MM")
    const [hours, minutes] = data.time.split(':').map(Number);
    const newDate = new Date(data.date);
    newDate.setHours(hours, minutes, 0, 0);

    // Default appointment duration is 2 hours
    const endDate = new Date(newDate.getTime() + 2 * 60 * 60 * 1000);

    const success = await rescheduleAppointment(appointmentId, newDate, endDate);

    if (success) {
      onClose();
      router.refresh();
    }
  };

  const handleClose = () => {
    form.reset({
      date: new Date(currentDate),
      time: format(new Date(currentDate), 'HH:mm'),
    });
    setShowConfirmation(false);
    onClose();
  };

  const selectedDate = form.watch('date');
  const selectedTime = form.watch('time');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {showConfirmation ? 'Confirm Rescheduling' : 'Reschedule Appointment'}
          </DialogTitle>
          <DialogDescription>
            {showConfirmation
              ? 'Please confirm the new date and time for your appointment.'
              : 'Select a new date and time for your appointment.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!showConfirmation && (
              <div className="space-y-4">
                {/* Date selection */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date => date < minBookingDate || date > addDays(today, 90)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time selection */}
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Time</FormLabel>
                      <TimeSelect
                        value={field.value}
                        onChangeAction={field.onChange}
                        className="w-full"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {showConfirmation && (
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-slate-50">
                  <p className="font-medium">Current Appointment:</p>
                  <p className="text-muted-foreground">{appointmentTitle}</p>
                  <p className="text-muted-foreground">
                    {format(currentDate, 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>

                <div className="border rounded-md p-4 bg-slate-50">
                  <p className="font-medium">New Appointment Time:</p>
                  <p className="text-muted-foreground">
                    {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Please Note</AlertTitle>
                  <AlertDescription>
                    Rescheduling is subject to the studio's availability. You will receive a
                    confirmation once the new time is approved.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                {showConfirmation ? 'Go Back' : 'Cancel'}
              </Button>

              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? 'Processing...' : showConfirmation ? 'Confirm Reschedule' : 'Continue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
