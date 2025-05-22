'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import FallbackBookingForm from './fallback-form';
import './booking.css';
import { usePathname, useRouter } from 'next/navigation';
import Script from 'next/script';
import SharedLayout from '@/components/layouts/SharedLayout';

export default function BookingClient() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isCalLoaded, setIsCalLoaded] = useState(false);
  const [calError, setCalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Direct Cal.com embed with more reliable approach
  useEffect(() => {
    // Remove artificial loading delay - show content immediately
    setIsLoading(false);
    
    // Set a timeout to check if Cal.com embed loaded properly
    const calCheckTimer = setTimeout(() => {
      if (!isCalLoaded && !calError) {
        setCalError('Booking system failed to initialize. Please try the alternative form.');
        setFallbackTriggered(true);
      }
    }, 5000);

    // Clean up timers
    return () => {
      clearTimeout(calCheckTimer);
    };
  }, [isCalLoaded, calError]);
  
  // Handle Cal.com script initialization
  useEffect(() => {
    if (isScriptLoaded) {
      // Check if window.Cal exists after script is loaded
      if (typeof window !== 'undefined' && 'Cal' in window) {
        // Cal.com is properly loaded
        setIsCalLoaded(true);
      } else {
        // Cal.com failed to initialize properly
        setCalError('Booking system failed to initialize properly');
        console.error('Cal.com script loaded but Cal object not found');
      }
    }
  }, [isScriptLoaded]);

  return (
    <SharedLayout>
      <div className="container max-w-4xl mx-auto py-24 px-4">
      <h1 className="text-4xl font-bold mb-6">Book Your Appointment</h1>
      <p className="text-lg mb-8">
        Schedule your tattoo consultation directly with Fernando Govea. Choose your preferred time and we'll handle the rest.
      </p>
      
      {/* Cal.com script */}
      <Script
        src="https://cal.com/embed.js"
        onLoad={() => {
          setIsScriptLoaded(true);
          console.log('Cal.com script loaded successfully');
        }}
        onError={(e) => {
          console.error('Failed to load Cal.com script:', e);
          setCalError('Failed to load booking system');
          setFallbackTriggered(true);
        }}
        strategy="afterInteractive"
      />
      
      {isLoading ? (
        <div className="booking-loading-skeleton p-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md mb-6"></div>
          <div className="grid grid-cols-7 gap-2 mb-8">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            ))}
          </div>
          <div className="h-12 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      ) : (
        <div className="cal-embed-container rounded-lg overflow-hidden shadow-lg bg-black">
          {/* Direct Cal.com Embed */}
          <div
            data-cal-link="ink37tattoos/consultation"
            data-cal-config='{"layout":"month_view","theme":"dark","hideEventTypeDetails":false,"styling":{"backgroundColor":"#000000","textColor":"#FFFFFF"}}'
            style={{
              width: "100%",
              height: "800px",
              overflow: "hidden"
            }}
          ></div>
        </div>
      )}
      
      {(calError || fallbackTriggered) && (
        <div className="fallback-booking rounded-lg overflow-hidden shadow-lg p-8 mt-8 bg-gray-100 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Alternative Booking Option</h2>
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-700 dark:text-red-400">{calError}</p>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Our booking system is currently experiencing issues. Please use the form below instead.</p>
          </div>
          
          <FallbackBookingForm />
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Alternative Contact Methods</h3>
            <div className="space-y-4">
              <Button
                onClick={() => window.location.href = `mailto:ink37tattoos@gmail.com?subject=Tattoo Consultation Request`}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Email Us
              </Button>
              
              <Button
                onClick={() => window.location.href = `tel:+12145551234`}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Call Us
              </Button>
              
              <Button
                onClick={() => window.open('https://instagram.com/ink37tattoos', '_blank')}
                className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Message on Instagram
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </SharedLayout>
  );
}