'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import './booking.css';

// Cal.com configuration
const CAL_NAMESPACE = 'tattoo-booking';
const CAL_USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME || 'fernando-govea'; // Update this with your Cal.com username
const CAL_EVENT_TYPE = 'tattoo-consultation'; // Update this with your Cal.com event type

// Loading skeleton for the booking page
function BookingLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Skeleton className="h-12 w-2/3 mb-6" />
      <Skeleton className="h-6 w-full mb-8" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-36 w-full" />
        </div>
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
}

export default function BookingClient() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      
      // Subscribe to Cal.com events
      cal('on', {
        // Handle booking confirmation
        bookingSuccess: (payload) => {
          console.log('Booking successful:', payload);
          // You can add custom logic here, like tracking analytics or showing a custom confirmation
        },
      });
      
      // Configure UI settings
      cal('ui', {
        theme: 'dark',
        styles: {
          branding: {
            brandColor: '#000000',
          },
          // Add custom CSS to match your site
          body: {
            backgroundColor: '#f8f8f8',
          },
        },
        hideEventTypeDetails: false,
        layout: 'month_view', // or 'week_view'
      });
    })();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">Book Your Appointment</h1>
      <p className="text-lg mb-8">
        Schedule your tattoo consultation directly with Fernando Govea. Choose your preferred time and we'll handle the rest.
      </p>
      
      {/* Cal.com embed - inline booking calendar */}
      <div className="cal-embed-container rounded-lg overflow-hidden shadow-lg">
        <Cal
          namespace={CAL_NAMESPACE}
          calLink={`${CAL_USERNAME}/${CAL_EVENT_TYPE}`}
          config={{
            theme: 'light',
            branding: {
              brandColor: '#000000',
            },
            // Add custom fields for booking form
            metadata: {
              tattooType: 'required',
              size: 'required',
              placement: 'required',
              description: 'required',
            },
          }}
        />
      </div>
      
      {/* Alternative: Pop-up booking button */}
      {/* 
      <Button
        data-cal-link={`${CAL_USERNAME}/tattoo-consultation`}
        data-cal-namespace={CAL_NAMESPACE}
        data-cal-config='{
          "layout": "month_view",
          "theme": "dark"
        }'
        className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Book Now
      </Button>
      */}
    </div>
  );
}