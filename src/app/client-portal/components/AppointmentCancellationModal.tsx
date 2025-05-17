'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2, AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AppointmentCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: (reason: string) => Promise<void>;
  appointmentDate: Date;
  appointmentTime: string;
  isLoading: boolean;
}

export function AppointmentCancellationModal({
  isOpen,
  onClose,
  onCancel,
  appointmentDate,
  appointmentTime,
  isLoading
}: AppointmentCancellationModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    try {
      setError(null);
      await onCancel(reason);
    } catch (err) {
      setError('Failed to cancel appointment. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your appointment on {format(appointmentDate, 'MMMM d, yyyy')} at {appointmentTime}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label htmlFor="cancel-reason" className="text-sm font-medium">
              Please provide a reason for cancellation:
            </label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please tell us why you need to cancel..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Note: Cancellations made less than 48 hours before the appointment may forfeit any deposit paid.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Keep Appointment
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Appointment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}