"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Hook for tracking page views in the application
 */
export function usePageViewTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Set pageLoaded to true after component mounts
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    // Only track page views after component has mounted
    if (!pageLoaded) return;

    // Construct full URL with query parameters
    const queryString = searchParams ? `?${searchParams.toString()}` : "";
    const url = `${pathname}${queryString}`;

    // Track page view
    const trackPageView = async () => {
      try {
        await api.post("/analytics/track", {
          type: "page_view",
          url,
          userId: user?.id,
          metadata: {
            referrer: document.referrer || null,
            title: document.title,
            userAgent: window.navigator.userAgent,
          },
        });
      } catch (error) {
        // Silently handle errors to avoid breaking the user experience
        console.error("Failed to track page view:", error);
      }
    };

    // Add slight delay to ensure page is fully loaded
    const timeout = setTimeout(() => {
      trackPageView();
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams, user, pageLoaded]);

  return null;
}

/**
 * Hook for tracking specific events in the application
 */
export function useEventTracking() {
  const { user } = useAuthStore();

  /**
   * Track a custom event
   */
  const track = async (
    eventName: string,
    itemId?: string,
    properties?: Record<string, unknown>
  ) => {
    try {
      await api.post("/analytics/track", {
        type: "event",
        eventName,
        itemId,
        userId: user?.id,
        properties,
        metadata: {
          url: window.location.href,
          userAgent: window.navigator.userAgent,
        },
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  };

  return { track };
}

export default { usePageViewTracking, useEventTracking };