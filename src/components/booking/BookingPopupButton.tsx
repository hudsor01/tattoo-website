"use client";

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { ENV } from '@/lib/utils/env';

interface BookingPopupButtonProps {
  designName?: string;
  designId?: string;
  eventSlug?: string;
  username?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Booking Popup Button Component
 * 
 * Uses Cal.com embed-react to trigger booking popup with design context.
 * Automatically passes design information to the booking form.
 */
export function BookingPopupButton({
  designName,
  designId,
  eventSlug = "consultation",
  username,
  className = "",
  children,
  variant = "default",
  size = "default"
}: BookingPopupButtonProps) {
  const calUsername = username ?? ENV.NEXT_PUBLIC_CAL_USERNAME;
  
  // Build Cal.com link with design context
  const calLink = `${calUsername}/${eventSlug}`;
  
  // Create prefill data for the booking form
  const prefillData = {
    ...(designName && { 
      // Pass design name as a custom field or in the notes
      customFields: {
        designInterest: designName
      },
      // Also add to notes for backup
      notes: `Interested in design: ${designName}${designId ? ` (ID: ${designId})` : ''}`
    })
  };

  // Cal.com configuration for the popup
  const calConfig = JSON.stringify({
    layout: "month_view",
    theme: "auto",
    // Make popup larger
    modalSettings: {
      width: "900px",
      height: "800px",
      maxWidth: "95vw",
      maxHeight: "95vh"
    },
    // Pass prefill data if available
    ...(Object.keys(prefillData).length > 0 && { prefill: prefillData })
  });

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className}`}
      data-cal-namespace="consultation"
      data-cal-link={calLink}
      data-cal-config={calConfig}
    >
      {children ?? (
        <>
          <Calendar className="w-4 h-4 mr-2" />
          Book This Design
        </>
      )}
    </Button>
  );
}