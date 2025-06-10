"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";

/**
 * Booking reschedule page - Simple placeholder
 * 
 * This page redirects users to Cal.com for rescheduling.
 * Replace with proper booking system integration when available.
 */
export default function ReschedulePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const rescheduleUid = searchParams.get('rescheduleUid');
  const eventTypeSlug = searchParams.get('eventTypeSlug');

  if (!rescheduleUid || !eventTypeSlug) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Reschedule Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Invalid reschedule link. Please check your email or contact support.
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Reschedule Your Appointment</h1>
          <p className="text-muted-foreground">
            To reschedule your appointment, please use the reschedule link in your confirmation email.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reschedule Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Easy rescheduling:</strong> Check your confirmation email 
                for the direct reschedule link, or visit Cal.com to manage your appointment.
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
                  Reschedule on Cal.com
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Need help?</h3>
              <p className="text-sm text-muted-foreground">
                If you're having trouble with the reschedule link, please contact 
                us directly and we'll be happy to help you find a new time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}