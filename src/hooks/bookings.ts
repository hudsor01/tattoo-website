"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types/booking-types";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch and manage bookings
 */
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("Booking")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch bookings"));
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBookings = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Subscribe to bookings changes
  useEffect(() => {
    fetchBookings();

    const supabase = createClient();
    
    // Subscribe to changes
    const subscription = supabase
      .channel("booking-changes")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "Booking" }, 
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refreshBookings,
  };
}

/**
 * Hook to fetch a single booking by ID
 */
export function useBooking(id: string | null) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error } = await supabase
          .from("Booking")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setBooking(data || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch booking"));
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [id]);

  return {
    booking,
    loading,
    error,
  };
}

/**
 * Hook to update a booking status
 */
export function useUpdateBookingStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const updateStatus = useCallback(async (bookingId: string, status: string) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { error } = await supabase
        .from("Booking")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update booking status"));
      console.error("Error updating booking status:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  return {
    updateStatus,
    loading,
    error,
  };
}