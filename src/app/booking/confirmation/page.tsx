"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, ExternalLink } from "lucide-react";

/**
 * Booking confirmation page - Simple placeholder
 * 
 * This page provides confirmation messaging and redirects to Cal.com for details.
 * Replace with proper booking system integration when available.
 */
export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingUid = searchParams.get('bookingUid');
  const paymentUid = searchParams.get('paymentUid');

  if (!bookingUid) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Booking Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Invalid booking link. Please try booking again.
            </p>
            <Button onClick={() => router.push('/booking')} className="w-full">
              Book New Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-700" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Your appointment has been successfully scheduled
          </p>
          {paymentUid && (
            <p className="text-sm text-green-600 mt-2">
              Payment completed successfully
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Confirmation sent!</strong> A confirmation email with all 
                the details has been sent to your email address. Please check your 
                inbox (and spam folder) for the full appointment information.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-green-600 font-bold">✓</span>
                <span>Appointment confirmed in calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-green-600 font-bold">✓</span>
                <span>Email confirmation sent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-green-600 font-bold">✓</span>
                <span>Calendar invite included</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => router.push('/booking')} 
            variant="outline"
            className="flex-1"
          >
            Book Another Appointment
          </Button>
          <Button 
            onClick={() => router.push('/')} 
            className="flex-1 bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange hover:opacity-90"
          >
            Back to Home
          </Button>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">Need to make changes?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use the links in your confirmation email to reschedule or cancel your appointment.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <a 
                  href="https://cal.com/fernandogovea" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage on Cal.com
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}