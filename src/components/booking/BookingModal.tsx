'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Calendar } from 'lucide-react';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId?: string;
  designName?: string;
}

export function BookingModal({ open, onOpenChange, designId: _designId, designName }: BookingModalProps) {
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    // Reset booking success state when modal closes
    setTimeout(() => {
      setIsBookingSuccess(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl w-full h-[90vh] max-h-[900px] overflow-hidden p-0"
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside the Cal.com iframe
          e.preventDefault();
        }}
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Book Your Tattoo Consultation
              </DialogTitle>
              {designName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Design: {designName}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {isBookingSuccess ? (
            <div className="flex items-center justify-center min-h-[400px] text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-600">Booking Confirmed!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your tattoo consultation has been successfully scheduled. You'll receive a confirmation email shortly.
                </p>
                {designName && (
                  <p className="text-sm text-muted-foreground">
                    We'll discuss the "{designName}" design during your consultation.
                  </p>
                )}
                <Button onClick={handleClose} className="mt-4">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  Schedule a free consultation to discuss your tattoo ideas and get a personalized quote.
                </p>
                {designName && (
                  <p className="text-sm font-medium">
                    We'll discuss the "{designName}" design during your consultation.
                  </p>
                )}
              </div>
              
              <div className="border rounded-lg overflow-hidden p-6 text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Ready to Book?</h3>
                  <p className="text-sm text-muted-foreground">
                    Click below to open our secure booking calendar
                  </p>
                </div>
                
                <Button asChild size="lg" className="w-full">
                  <a 
                    href={`https://cal.com/ink37tattoos/consultation${designName ? `?description=Interested in: ${encodeURIComponent(designName)}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(_e) => {
                      // Let the link open first, then track after a delay
                      setTimeout(() => {
                        setIsBookingSuccess(true);
                      }, 1000);
                    }}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Open Booking Calendar
                  </a>
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Opens in a new tab for secure booking
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}