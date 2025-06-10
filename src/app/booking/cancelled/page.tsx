"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { XCircle, Calendar, ArrowRight } from "lucide-react";

/**
 * Booking cancelled confirmation page
 */
export default function BookingCancelledPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-fernando-red" />
          </div>
          <h1 className="text-3xl font-bold text-fernando-red mb-2">
            Appointment Cancelled
          </h1>
          <p className="text-muted-foreground">
            Your appointment has been successfully cancelled
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              What happens next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-muted-foreground">1</span>
                </div>
                <div>
                  <p className="font-medium">Confirmation sent</p>
                  <p className="text-sm text-muted-foreground">
                    All attendees have been notified of the cancellation
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-muted-foreground">2</span>
                </div>
                <div>
                  <p className="font-medium">Calendar updated</p>
                  <p className="text-sm text-muted-foreground">
                    The appointment has been removed from all calendars
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-muted-foreground">3</span>
                </div>
                <div>
                  <p className="font-medium">Refund processed</p>
                  <p className="text-sm text-muted-foreground">
                    If applicable, refunds will be processed within 3-5 business days
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Need to reschedule instead?</h3>
            <p className="text-muted-foreground mb-4">
              We'd love to help you find a better time that works for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => router.push('/booking')} 
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
            <Button 
              onClick={() => router.push('/contact')} 
              variant="outline"
              className="flex-1"
            >
              Contact Support
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="text-center mt-6">
            <Button 
              onClick={() => router.push('/')} 
              variant="ghost"
            >
              Back to Home
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Questions about your cancellation?</strong><br />
            Check your email for the cancellation confirmation, or contact our support team 
            if you need any assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
