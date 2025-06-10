"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Calendar, ExternalLink } from "lucide-react";

/**
 * Booking cancellation page - Simple placeholder
 * 
 * This page redirects users to Cal.com for cancellation.
 * Replace with proper booking system integration when available.
 */
export default function CancelBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingUid = params['bookingUid'] as string;

  if (!bookingUid) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Cancel Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Invalid cancellation link. Please check your email or contact support.
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
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Cancel Appointment</h1>
          </div>
          <p className="text-muted-foreground">
            To cancel your appointment, please use the cancellation link in your confirmation email or contact us directly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cancellation Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> For immediate assistance with cancellations, 
                please check your confirmation email for the direct cancellation link 
                or contact us at the studio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/contact')}
                className="flex-1"
              >
                Contact Studio
              </Button>
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange hover:opacity-90"
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