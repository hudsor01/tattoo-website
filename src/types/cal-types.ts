/**
 * Cal.com Integration Types
 * 
 * Specific types for Cal.com API responses and data structures.
 */

/**
 * Cal.com Event Type structure
 */
export interface CalEventType {
  id: number;
  title: string;
  slug: string;
  description?: string;
  length: number;
  hidden: boolean;
  requiresConfirmation: boolean;
  disableGuests: boolean;
  minimumBookingNotice: number;
  beforeEventBuffer: number;
  afterEventBuffer: number;
  schedulingType: 'ROUND_ROBIN' | 'COLLECTIVE' | null;
  price: number;
  currency: string;
  slotInterval: number | null;
  successRedirectUrl: string | null;
  team: {
    id: number;
    name: string;
    slug: string;
  } | null;
  users: Array<{
    id: number;
    username: string;
    name: string;
    email: string;
  }>;
  locations: Array<{
    type: string;
    address?: string;
    link?: string;
  }>;
  customInputs: Array<{
    id: number;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select';
    required: boolean;
    placeholder?: string;
    options?: string;
  }>;
  metadata: Record<string, string | number | boolean>;
}

/**
 * Cal.com Availability Response
 */
export interface CalAvailabilityResponse {
  busy: Array<{
    start: string;
    end: string;
    title?: string;
    source?: string;
  }>;
  timeZone: string;
  workingHours: Array<{
    days: number[];
    startTime: number; // minutes from midnight
    endTime: number; // minutes from midnight
    userId?: number;
  }>;
  dateOverrides: Array<{
    date: string;
    startTime?: number;
    endTime?: number;
    workingHours?: Array<{
      startTime: number;
      endTime: number;
    }>;
  }>;
}

/**
 * Cal.com API Error Response
 */
export interface CalApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string | number | boolean>;
  };
  timestamp: string;
  path?: string;
}

/**
 * Cal.com Booking List Response
 */
export interface CalBookingListResponse {
  bookings: CalBookingPayload[];
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * Cal.com Event Types List Response  
 */
export interface CalEventTypesResponse {
  event_types: CalEventType[];
}

/**
 * Cal.com Booking Payload
 */
export interface CalBookingPayload {
  id: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    id: number;
    email: string;
    name: string;
    timeZone: string;
    locale?: string;
  }>;
  organizer: {
    id: number;
    email: string;
    name: string;
    timeZone: string;
  };
  responses?: Record<string, string | number | boolean>;
  customInputs?: Array<{
    label: string;
    value: string | number | boolean;
    required?: boolean;
  }>;
  location?: string;
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
  paid?: boolean;
  payment?: Array<{
    id: number;
    success: boolean;
    paymentOption: string;
  }>;
  metadata?: Record<string, string | number | boolean>;
  eventType: {
    id: number;
    title: string;
    slug: string;
    length: number;
    currency: string;
    price: number;
  };
  user?: {
    id: number;
    username: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  rescheduledFromUid?: string;
  references?: Array<{
    id: number;
    type: string;
    uid: string;
    meetingId?: string;
    meetingPassword?: string;
    meetingUrl?: string;
  }>;
}

/**
 * Cal.com Webhook Payload
 */
export interface CalWebhookPayload {
  triggerEvent: 'BOOKING_CREATED' | 'BOOKING_RESCHEDULED' | 'BOOKING_CANCELLED' | 'BOOKING_CONFIRMED' | 'BOOKING_REJECTED' | 'MEETING_ENDED';
  createdAt: string;
  payload: CalBookingPayload;
}

/**
 * Cal.com API Options for fetching bookings
 */
export interface GetCalBookingsOptions {
  limit?: number;
  status?: string;
  eventTypeId?: number;
}
