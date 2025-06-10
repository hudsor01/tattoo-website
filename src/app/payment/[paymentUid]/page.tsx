"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, ExternalLink } from "lucide-react";

/**
 * Payment page - Simple placeholder
 * 
 * This page redirects users to Cal.com for payment processing.
 * Replace with proper payment system integration when available.
 */
export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentUid = params['paymentUid'] as string;

  if (!paymentUid) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Payment Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Invalid payment link. Please try booking again.
            </p>
            <Button onClick={() => router.push('/booking')} className="w-full">
              Back to Booking
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
          <h1 className="text-2xl font-bold">Complete Your Payment</h1>
          <p className="text-muted-foreground">
            To complete your payment, please use the payment link in your confirmation email.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Secure payment:</strong> All payments are processed securely 
                through Cal.com's payment system. Check your confirmation email for 
                the direct payment link.
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
                  <CreditCard className="w-4 h-4 mr-2" />
                  Complete Payment
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Payment Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-green-600 font-bold">✓</span>
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-green-600 font-bold">✓</span>
                  <span>Multiple payment methods accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-green-600 font-bold">✓</span>
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}