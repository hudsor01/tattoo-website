"use client";

import { useEffect } from 'react';
import { getCalApi } from '@calcom/embed-react';

export function CalEmbedProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi({ namespace: "consultation" });
        
        cal("ui", {
          cssVarsPerTheme: {
            light: { "cal-brand": "#E63A35" },
            dark: { "cal-brand": "#E63A35" }
          },
          hideEventTypeDetails: false,
          layout: "month_view"
        });
      } catch (error) {
        console.error('Failed to initialize Cal.com embed:', error);
      }
    })();
  }, []);

  return <>{children}</>;
}