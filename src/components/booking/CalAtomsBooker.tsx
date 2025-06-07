'use client'

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

interface BookerProps {
  eventTypeSlug: string;
  calUsername: string;
  onBookingSuccess?: () => void | Promise<void>;
}

export default function CalAtomsBooker({ eventTypeSlug, calUsername, onBookingSuccess }: BookerProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      
      // Listen for booking success events
      cal("on", {
        action: "bookingSuccessful",
        callback: async (e) => {
          console.warn('Booking successful:', e.detail);
          if (onBookingSuccess) {
            try {
              await onBookingSuccess();
            } catch (error: unknown) {
              console.error('Error in booking success callback:', error);
            }
          }
        }
      });
    })();
  }, [onBookingSuccess]);

  // Render the Cal.com inline embed
  return (
    <div className="w-full min-h-[700px]">
      <Cal
        calLink={`${calUsername}/${eventTypeSlug}`}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{
          layout: "month_view",
          theme: "light"
        }}
      />
    </div>
  );
}