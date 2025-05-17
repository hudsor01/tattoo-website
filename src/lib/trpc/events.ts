/**
 * Event Emitters for tRPC Subscriptions
 * 
 * This file provides utility functions to emit events for the tRPC subscription system.
 * These functions can be called from anywhere in the codebase to trigger real-time updates.
 */

import { 
  emitBookingEvent, 
  emitAppointmentEvent,
  emitCustomerEvent 
} from './routers/subscription-router';

/**
 * Emit a booking created event
 */
export function emitBookingCreated(data: {
  id: number;
  name: string;
  email: string;
  artistId?: string;
  customerId?: string;
  preferredDate: Date;
  tattooType: string;
}) {
  emitBookingEvent({
    id: data.id,
    type: 'created',
    data: {
      ...data,
      createdAt: new Date(),
    },
  });
}

/**
 * Emit a booking updated event
 */
export interface BookingUpdateData {
  id: number;
  artistId?: string;
  customerId?: string;
  depositPaid?: boolean;
  status?: string;
  preferredDate?: Date;
  preferredTime?: string;
  tattooType?: string;
  size?: string;
  placement?: string;
  description?: string;
  updatedAt?: Date;
  [key: string]: unknown;
}

export function emitBookingUpdated(data: BookingUpdateData) {
  emitBookingEvent({
    id: data.id,
    type: 'updated',
    data,
  });
}

/**
 * Emit a booking deleted event
 */
export function emitBookingDeleted(id: number, artistId?: string) {
  emitBookingEvent({
    id,
    type: 'deleted',
    data: {
      id,
      artistId,
      deletedAt: new Date(),
    },
  });
}

/**
 * Emit an appointment created event
 */
export function emitAppointmentCreated(data: {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: string;
  artistId: string;
  customerId: string;
  bookingId?: number;
}) {
  emitAppointmentEvent({
    id: data.id,
    type: 'created',
    data: {
      ...data,
      createdAt: new Date(),
    },
  });
}

/**
 * Emit an appointment updated event
 */
export interface AppointmentUpdateData {
  id: string;
  artistId?: string;
  customerId?: string;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  description?: string;
  location?: string;
  notes?: string;
  updatedAt?: Date;
  bookingId?: number;
  [key: string]: unknown;
}

export function emitAppointmentUpdated(data: AppointmentUpdateData) {
  emitAppointmentEvent({
    id: data.id,
    type: 'updated',
    data,
  });
}

/**
 * Emit an appointment status changed event
 */
export function emitAppointmentStatusChanged(data: {
  id: string;
  status: string;
  artistId: string;
  customerId: string;
}) {
  emitAppointmentEvent({
    id: data.id,
    type: 'status_changed',
    data,
  });
}

/**
 * Emit an appointment deleted event
 */
export function emitAppointmentDeleted(id: string, artistId?: string, customerId?: string) {
  emitAppointmentEvent({
    id,
    type: 'deleted',
    data: {
      id,
      artistId,
      customerId,
      deletedAt: new Date(),
    },
  });
}

/**
 * Emit a customer created event
 */
export function emitCustomerCreated(data: {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}) {
  emitCustomerEvent({
    id: data.id,
    type: 'created',
    data: {
      ...data,
      createdAt: new Date(),
    },
  });
}

/**
 * Emit a customer updated event
 */
export interface CustomerUpdateData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: Date | string;
  notes?: string;
  updatedAt?: Date;
  [key: string]: unknown;
}

export function emitCustomerUpdated(data: CustomerUpdateData) {
  emitCustomerEvent({
    id: data.id,
    type: 'updated',
    data,
  });
}

/**
 * Emit a customer note added event
 */
export function emitCustomerNoteAdded(data: {
  customerId: string;
  noteId: string;
  content: string;
  type: string;
}) {
  emitCustomerEvent({
    id: data.customerId,
    type: 'note_added',
    data,
  });
}

/**
 * Emit a customer tag added event
 */
export function emitCustomerTagAdded(data: {
  customerId: string;
  tagId: string;
  tagName: string;
  tagColor: string;
}) {
  emitCustomerEvent({
    id: data.customerId,
    type: 'tag_added',
    data,
  });
}

/**
 * Emit a customer tag removed event
 */
export function emitCustomerTagRemoved(data: {
  customerId: string;
  tagId: string;
  tagName: string;
}) {
  emitCustomerEvent({
    id: data.customerId,
    type: 'tag_removed',
    data,
  });
}
