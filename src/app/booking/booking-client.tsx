/**
 * Booking Client Component
 * 
 * This component uses the unified Cal.com booking system that provides:
 * - Service selection and management
 * - Simple Cal.com iframe integration
 * - Responsive design for all devices
 * 
 * The CalBookingUnified component handles all Cal.com iframe integration,
 * allowing this component to focus on the page layout and contact fallback.
 */
'use client';

import { Button } from '@/components/ui/button';
import './booking.css';
import Footer from '@/components/layouts/Footer';
import { useState } from 'react';
import { CalBookingUnified } from '@/components/booking/cal-booking';
import type { Prisma, CalEventType } from '@prisma/client';

// Cal service type using Prisma.GetPayload
type CalService = Prisma.CalEventTypeGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    description: true;
    duration: true;
    price: true;
  };
}>;

export default function BookingClient() {
  const [showContact, setShowContact] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('free-consultation');

  // Handle service selection from the unified component
  const handleServiceSelect = (service: CalService) => {
    setSelectedServiceId(service.id);
  };

  return (
    <>
      <div className="w-full min-h-screen bg-black">
        <div className="container max-w-7xl mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-6">Book Your Appointment</h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Schedule your tattoo consultation directly with Ink 37 Tattoos. Choose your preferred
              time and we&apos;ll handle the rest.
            </p>
          </div>

          {!showContact ? (
            <div className="space-y-6">
              {/* Unified Cal.com Booking Component */}
              <CalBookingUnified
                selectedService={selectedServiceId}
                onServiceSelect={handleServiceSelect}
                className="mx-auto"
              />

              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowContact(true)}
                  className="text-sm bg-white text-black hover:bg-gray-100"
                >
                  Having trouble? Contact us directly
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowContact(false)}
                  className="text-sm bg-white text-black hover:bg-gray-100"
                >
                  ← Back to booking
                </Button>
              </div>

              <div className="bg-gray-900 rounded-lg p-8">
                <h3 className="text-xl font-bold mb-6 text-white text-center">
                  Contact Us Directly
                </h3>
                <p className="text-white/70 mb-6 text-center">
                  If you&apos;re having trouble with the booking system, reach out to us using any of
                  these methods:
                </p>

                <div className="space-y-4">
                  <Button
                    onClick={() =>
                      (window.location.href = `mailto:ink37tattoos@gmail.com?subject=Tattoo Consultation Request`)
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    📧 Email Us
                  </Button>

                  <div className="w-full bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg text-center">
                    📧 Contact via website only
                  </div>

                  <Button
                    onClick={() => window.open('https://instagram.com/ink37tattoos', '_blank')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    📱 Message on Instagram
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm text-white/40 text-center">
                    For all bookings, we prefer using the booking system above as it handles
                    scheduling and deposits automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
