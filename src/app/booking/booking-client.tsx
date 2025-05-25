'use client';

import { Button } from '@/components/ui/button';
import './booking.css';
import Footer from '@/components/layouts/Footer';
import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function BookingClient() {
  const [showContact, setShowContact] = useState(false);
  const [isCalLoaded, setIsCalLoaded] = useState(false);

  useEffect(() => {
    if (isCalLoaded && typeof window !== 'undefined' && window.Cal) {
      // Initialize Cal.com with full-width, natural sizing
      void window.Cal('init', {
        origin: 'https://cal.com'
      });
    }
  }, [isCalLoaded]);

  return (
    <>
      <div className="w-full min-h-screen bg-black">
      <div className="container max-w-7xl mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-6">Book Your Appointment</h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Schedule your tattoo consultation directly with Fernando Govea. Choose your preferred time and we'll handle the rest.
            </p>
          </div>
          
          {/* Cal.com Script */}
          <Script
            src="https://app.cal.com/embed/embed.js"
            onLoad={() => setIsCalLoaded(true)}
            strategy="afterInteractive"
          />
          
          {!showContact ? (
            <div className="space-y-6">
              {/* Cal.com Iframe Embed - Primary Booking Method */}
              <div className="cal-embed-wrapper w-full">
                <iframe
                  src="https://cal.com/ink37tattoos/consultation"
                  width="100%"
                  height="700"
                  frameBorder="0"
                  title="Book Tattoo Consultation"
                  className="cal-embed-iframe w-full rounded-lg shadow-2xl"
                  allow="camera; microphone; autoplay; encrypted-media; fullscreen"
                  loading="lazy"
                />
              </div>
              
              <div className="text-center">
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
                  ← Back to Cal.com booking
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-8">
                <h3 className="text-xl font-bold mb-6 text-white text-center">Contact Us Directly</h3>
                <p className="text-gray-300 mb-6 text-center">
                  If you're having trouble with the booking system, reach out to us using any of these methods:
                </p>
                
                <div className="space-y-4">
                  <Button
                    onClick={() => window.location.href = `mailto:ink37tattoos@gmail.com?subject=Tattoo Consultation Request`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    📧 Email Us
                  </Button>
                  
                  <Button
                    onClick={() => window.location.href = `tel:+12145551234`}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    📞 Call Us
                  </Button>
                  
                  <Button
                    onClick={() => window.open('https://instagram.com/ink37tattoos', '_blank')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    📱 Message on Instagram
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-sm text-gray-400 text-center">
                    For all bookings, we prefer using the Cal.com system above as it handles scheduling and deposits automatically.
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