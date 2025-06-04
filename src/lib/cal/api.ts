/**
 * Cal.com API Client - Comprehensive Integration
 * 
 * Consolidated Cal.com API client supporting both v1 and v2 endpoints
 * with comprehensive error handling, retry logic, and type safety.
 */

import { z } from 'zod';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Prisma, CalBooking, CalEventType } from '@prisma/client';

// Cal.com API types using Prisma.GetPayload
type CalBookingPayload = Prisma.CalBookingGetPayload<{
  include: {
    eventType: true;
    attendees: true;
  };
}>;

type CalAvailabilityResponse = {
  busy: Array<{
    start: string;
    end: string;
  }>;
  dateRanges: Array<{
    start: string;
    end: string;
  }>;
  workingHours: Array<{
    days: number[];
    startTime: number;
    endTime: number;
  }>;
};

type GetCalappointmentsOptions = {
  limit?: number;
  status?: string;
  eventTypeId?: number;
  startDate?: string;
  endDate?: string;
};
import { ENV, SERVER_ENV } from '@/lib/utils/env';

// Environment validation
const envSchema = z.object({
  CAL_API_KEY: z.string().min(1),
  CAL_API_URL: z.string().url().default('https://api.cal.com/v2'),
  CAL_WEBHOOK_SECRET: z.string().optional(),
});

const env = envSchema.parse({
  CAL_API_KEY: SERVER_ENV.CAL_API_KEY,
  CAL_API_URL: SERVER_ENV.CAL_API_URL,
  CAL_WEBHOOK_SECRET: SERVER_ENV.CAL_WEBHOOK_SECRET,
});

// Legacy V1 API URL for backward compatibility
const CAL_API_V1_URL = SERVER_ENV.CAL_API_URL ?? 'https://api.cal.com/v1';

// API Response Types
export interface CalBookingResponse {
  id: number;
  uid: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  status: 'accepted' | 'pending' | 'cancelled' | 'rejected';
  attendees: Array<{
    id: number;
    email: string;
    name: string;
    timeZone: string;
  }>;
  eventType: {
    id: number;
    title: string;
    slug: string;
    length: number;
    price: number;
    currency: string;
  };
  payment?: Array<{
    id: number;
    success: boolean;
    amount: number;
    currency: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CalWebhookEvent {
  id: string;
  subscriberUrl: string;
  active: boolean;
  triggers: string[];
  payloadTemplate?: string;
}

// Custom Error Class
export class CalApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: string,
    public readonly endpoint?: string
  ) {
    super(message);
    this.name = 'CalApiError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details,
      endpoint: this.endpoint,
    };
  }
}

// Main API Client Class
export class CalApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly retryAttempts = 3;
  private readonly retryDelay = 1000;

  constructor() {
    this.baseUrl = env.CAL_API_URL;
    this.apiKey = env.CAL_API_KEY;
  }

  private get headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'cal-api-version': '2024-08-13',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.headers,
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new CalApiError(
            response.status,
            `Cal.com API error: ${response.statusText}`,
            errorText,
            endpoint
          );
        }

        return await response.json() as T;
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }

    throw new Error('Max retry attempts exceeded');
  }

  // V2 Booking Management
  async getappointments(params: {
    status?: string;
    startAfter?: string;
    endBefore?: string;
    attendeeEmail?: string;
    eventTypeIds?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ data: CalBookingResponse[]; pagination: { hasMore: boolean } }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    return this.request<{ data: CalBookingResponse[]; pagination: { hasMore: boolean } }>(
      `/appointments?${searchParams.toString()}`
    );
  }

  async getBookingById(id: string | number): Promise<CalBookingResponse> {
    return this.request<CalBookingResponse>(`/appointments/${id}`);
  }

  async updateappointmentstatus(
    id: string | number,
    status: 'accepted' | 'rejected' | 'cancelled',
    reason?: string
  ): Promise<CalBookingResponse> {
    return this.request<CalBookingResponse>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        ...(reason && { cancellationReason: reason }),
      }),
    });
  }

  async rescheduleBooking(
    id: string | number,
    newSlot: { start: string; end: string }
  ): Promise<CalBookingResponse> {
    return this.request<CalBookingResponse>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({
        startTime: newSlot.start,
        endTime: newSlot.end,
      }),
    });
  }

  // Event Type Management
  async getEventTypes(): Promise<{ data: CalEventType[] }> {
    return this.request<{ data: CalEventType[] }>('/event-types');
  }

  async getEventType(id: number): Promise<CalEventType> {
    return this.request<CalEventType>(`/event-types/${id}`);
  }

  // Webhook Management
  async createWebhook(
    eventTypeId: number,
    subscriberUrl: string,
    triggers: string[]
  ): Promise<CalWebhookEvent> {
    return this.request<CalWebhookEvent>(`/event-types/${eventTypeId}/webhooks`, {
      method: 'POST',
      body: JSON.stringify({
        subscriberUrl,
        triggers,
        active: true,
        payloadTemplate: JSON.stringify({
          triggerEvent: '{{triggerEvent}}',
          createdAt: '{{createdAt}}',
          payload: '{{payload}}',
        }),
      }),
    });
  }

  async getWebhooks(eventTypeId: number): Promise<{ data: CalWebhookEvent[] }> {
    return this.request<{ data: CalWebhookEvent[] }>(`/event-types/${eventTypeId}/webhooks`);
  }

  async deleteWebhook(eventTypeId: number, webhookId: string): Promise<void> {
    await this.request(`/event-types/${eventTypeId}/webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }

  // Analytics and Metrics
  async getBookingMetrics(params: {
    startDate: string;
    endDate: string;
    eventTypeIds?: number[];
  }): Promise<{
    totalappointments: number;
    confirmedappointments: number;
    cancelledappointments: number;
    totalRevenue: number;
    dailyMetrics: Array<{
      date: string;
      appointments: number;
      revenue: number;
    }>;
  }> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    if (params.eventTypeIds?.length) {
      searchParams.append('eventTypeIds', params.eventTypeIds.join(','));
    }

    return this.request(`/analytics/appointments?${searchParams.toString()}`);
  }

  // Utility Methods
  createBookingLink(
    username: string,
    eventTypeSlug: string,
    prefill: Record<string, string> = {}
  ): string {
    const baseUrl = `https://cal.com/${username}/${eventTypeSlug}`;
    
    if (Object.keys(prefill).length === 0) {
      return baseUrl;
    }

    const searchParams = new URLSearchParams(prefill);
    return `${baseUrl}?${searchParams.toString()}`;
  }

  // Health Check
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      await this.request('/ping');
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch {
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  }
}

/**
 * LEGACY V1 API FUNCTIONS (for backward compatibility)
 * These functions use the v1 API and will be deprecated
 */

/**
 * Get appointments from Cal.com API v1
 * @deprecated Use calApi.getappointments() instead
 */
export async function getCalappointments({
  limit = 100,
  status,
  eventTypeId,
}: GetCalappointmentsOptions = {}): Promise<CalBookingPayload[]> {
  if (!env.CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const params = new URLSearchParams();
  void params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (eventTypeId) params.append('eventTypeId', String(eventTypeId));

  const response = await fetch(`${CAL_API_V1_URL}/appointments?${params.toString()}&apiKey=${env.CAL_API_KEY}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Cal.com appointments: ${error}`);
  }

  const data = await response.json();
  return data.appointments ?? [];
}

/**
 * Get booking by UID from Cal.com API v1
 * @deprecated Use calApi.getBookingById() instead
 */
export async function getCalBookingByUid(uid: string): Promise<CalBookingPayload> {
  if (!env.CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(`${CAL_API_V1_URL}/appointments/${uid}?apiKey=${env.CAL_API_KEY}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Cal.com booking: ${error}`);
  }

  return response.json();
}

/**
 * Get event types from Cal.com API v1
 * @deprecated Use calApi.getEventTypes() instead
 */
export async function getCalEventTypes(): Promise<CalEventType[]> {
  if (!env.CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(`${CAL_API_V1_URL}/event-types?apiKey=${env.CAL_API_KEY}`, {
    headers: {
      'Content-Type': 'application/json',
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
 * Get availability from Cal.com API v1
 * @deprecated Use new calApi methods instead
 */
export async function getCalAvailability(
  username: string,
  dateFrom: string,
  dateTo: string,
  eventTypeId?: number
): Promise<CalAvailabilityResponse> {
  if (!env.CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const params = new URLSearchParams({
    username,
    dateFrom,
    dateTo,
  });

  if (eventTypeId) {
    params.append('eventTypeId', String(eventTypeId));
  }

  const response = await fetch(`${CAL_API_V1_URL}/availability?${params.toString()}&apiKey=${env.CAL_API_KEY}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Cal.com availability: ${error}`);
  }

  return response.json();
}

/**
 * Update a booking status
 * @deprecated Use calApi.updateappointmentstatus() instead
 */
export async function updateCalappointmentstatus(
  uid: string,
  status: 'accepted' | 'rejected' | 'cancelled'
): Promise<CalBookingPayload> {
  if (!env.CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(`${CAL_API_V1_URL}/appointments/${uid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: env.CAL_API_KEY,
      status,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update Cal.com booking status: ${error}`);
  }

  return response.json();
}

/**
 * Reschedule a booking
 * @deprecated Use calApi.rescheduleBooking() instead
 */
export async function rescheduleCalBooking(
  uid: string,
  newTime: { start: string; end: string }
): Promise<CalBookingPayload> {
  if (!env.CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }

  const response = await fetch(`${CAL_API_V1_URL}/appointments/${uid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: env.CAL_API_KEY,
      startTime: newTime.start,
      endTime: newTime.end,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to reschedule Cal.com booking: ${error}`);
  }

  return response.json();
}

// Webhook Signature Verification
export function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature || !env.CAL_WEBHOOK_SECRET) {
    return false;
  }

  try {
    const expectedSignature = createHmac('sha256', env.CAL_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    return timingSafeEqual(
      Buffer.from(signature.replace('sha256=', '')),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Export singleton instance
export const calApi = new CalApiClient();