/**
 * Cal.com API client for server-side integration
 */

import type { CalBookingPayload } from '@/types/booking-types';
import type { CalEventType, CalAvailabilityResponse } from '@/types/cal-types';

const CAL_API_KEY = process.env['CAL_API_KEY'];
const CAL_API_URL = 'https://api.cal.com/v1';

interface GetCalBookingsOptions {
  limit?: number;
  status?: string;
  eventTypeId?: number;
}

/**
 * Get bookings from Cal.com API
 */
export async function getCalBookings({
  limit = 100,
  status,
  eventTypeId,
}: GetCalBookingsOptions = {}): Promise<CalBookingPayload[]> {
  if (!CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const params = new URLSearchParams();
  void params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (eventTypeId) params.append('eventTypeId', String(eventTypeId));

  const response = await fetch(`${CAL_API_URL}/bookings?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CAL_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Cal.com bookings: ${error}`);
  }

  const data = await response.json();
  return data.bookings ?? [];
}

/**
 * Get booking by UID from Cal.com API
 */
export async function getCalBookingByUid(uid: string): Promise<CalBookingPayload> {
  if (!CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(`${CAL_API_URL}/bookings/${uid}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CAL_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Cal.com booking: ${error}`);
  }

  return await response.json();
}

/**
 * Get available event types from Cal.com API
 */
export async function getCalEventTypes(): Promise<CalEventType[]> {
  if (!CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(`${CAL_API_URL}/event-types`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CAL_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Cal.com event types: ${error}`);
  }

  const data = await response.json();
  return data.event_types ?? [];
}

/**
 * Update booking status on Cal.com
 */
export async function updateCalBookingStatus(
  uid: string,
  status: 'accepted' | 'rejected' | 'cancelled'
): Promise<CalBookingPayload> {
  if (!CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(`${CAL_API_URL}/bookings/${uid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CAL_API_KEY}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update Cal.com booking status: ${error}`);
  }

  return await response.json();
}

/**
 * Reschedule a booking on Cal.com
 */
export async function rescheduleCalBooking(
  uid: string,
  newTime: {
    start: string;
    end: string;
  }
): Promise<CalBookingPayload> {
  if (!CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(`${CAL_API_URL}/bookings/${uid}/reschedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CAL_API_KEY}`,
    },
    body: JSON.stringify({
      startTime: newTime.start,
      endTime: newTime.end,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to reschedule Cal.com booking: ${error}`);
  }

  return await response.json();
}

/**
 * Get availability slots from Cal.com
 */
export async function getCalAvailability(
  eventTypeId: number,
  startDate: string,
  endDate: string
): Promise<CalAvailabilityResponse> {
  if (!CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(
    `${CAL_API_URL}/event-types/${eventTypeId}/availability?dateFrom=${startDate}&dateTo=${endDate}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CAL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Cal.com availability: ${error}`);
  }

  return await response.json();
}

/**
 * Create a direct Cal.com booking link with predefined fields
 */
export function createCalBookingLink(
  eventTypeId: number,
  prefillData: Record<string, string> = {}
): string {
  if (!process.env['NEXT_PUBLIC_CAL_USERNAME']) {
    throw new Error('NEXT_PUBLIC_CAL_USERNAME not configured');
  }

  const username = process.env['NEXT_PUBLIC_CAL_USERNAME'];
  const baseUrl = `https://cal.com/${username}/${eventTypeId}`;

  if (Object.keys(prefillData).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(prefillData)) {
    void searchParams.append(key, value);
  }

  return `${baseUrl}?${searchParams.toString()}`;
}
