/**
 * Subscription Router
 *
 * This router handles all real-time subscription endpoints using tRPC's
 * subscription feature with Server-Sent Events (SSE).
 */
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../server';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';
import type { UserMetadata } from '@/types/clerk-types';

// Global event emitter for real-time updates
const ee = new EventEmitter();

// Set higher max listeners to avoid warnings
ee.setMaxListeners(100);

// Define base event data types
interface BookingEventData {
  id: number;
  name?: string;
  email?: string;
  artistId?: string;
  customerId?: string;
  preferredDate?: Date;
  tattooType?: string;
  status?: string;
  depositPaid?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  [key: string]: unknown;
}

interface AppointmentEventData {
  id: string;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  artistId?: string;
  customerId?: string;
  bookingId?: number;
  location?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  [key: string]: unknown;
}

interface CustomerEventData {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  noteId?: string;
  content?: string;
  type?: string;
  tagId?: string;
  tagName?: string;
  tagColor?: string;
  [key: string]: unknown;
}

interface GalleryEventData {
  id: string;
  title?: string;
  url?: string;
  thumbUrl?: string;
  artistId?: string;
  isApproved?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  [key: string]: unknown;
}

// Define dashboard activity event type
interface DashboardActivityEvent {
  type: string;
  data: BookingEvent | AppointmentEvent | CustomerEvent | GalleryEvent;
  timestamp: Date;
}

// Define event types
type BookingEvent = {
  id: number;
  type: 'created' | 'updated' | 'deleted';
  data: BookingEventData;
};

type AppointmentEvent = {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'status_changed';
  data: AppointmentEventData;
};

type CustomerEvent = {
  id: string;
  type: 'created' | 'updated' | 'note_added' | 'tag_added' | 'tag_removed';
  data: CustomerEventData;
};

type GalleryEvent = {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'approved';
  data: GalleryEventData;
};

// Export helper functions to emit events
export function emitBookingEvent(event: BookingEvent) {
  void ee.emit('booking', event);
}

export function emitAppointmentEvent(event: AppointmentEvent) {
  void ee.emit('appointment', event);
}

export function emitCustomerEvent(event: CustomerEvent) {
  void ee.emit('customer', event);
}

export function emitGalleryEvent(event: GalleryEvent) {
  void ee.emit('gallery', event);
}

// Export the subscription router with all procedures
export const subscriptionRouter = router({
  // Booking events subscription
  bookingEvents: protectedProcedure
    .input(
      z
        .object({
          artistId: z.string().optional(),
        })
        .optional()
    )
    .subscription(({ input, ctx }) => {
      // Verify user has access to booking events
      const userRole = ctx.user?.role ?? (ctx.user?.publicMetadata as UserMetadata)?.role ?? 'user';
      const isAdmin = userRole === 'admin';
      const isArtist = userRole === 'artist';

      if (!isAdmin && !isArtist && input?.artistId) {
        throw new Error('Unauthorized to subscribe to booking events');
      }

      // Create observable for subscription
      return observable<BookingEvent>((emit) => {
        const onBookingEvent = (data: BookingEvent) => {
          // Filter by artistId if provided
          if (input?.artistId && data.data.artistId !== input.artistId) {
            return;
          }

          // Admin can see all events
          if (isAdmin) {
            void emit.next(data);
            return;
          }

          // Artists can only see their own bookings
          if (isArtist && data.data.artistId === input?.artistId) {
            void emit.next(data);
          }
        };

        // Subscribe to booking events
        void ee.on('booking', onBookingEvent);

        // Cleanup when client unsubscribes
        return () => {
          void ee.off('booking', onBookingEvent);
        };
      });
    }),

  // Appointment events subscription
  appointmentEvents: protectedProcedure
    .input(
      z
        .object({
          artistId: z.string().optional(),
          customerId: z.string().optional(),
        })
        .optional()
    )
    .subscription(({ input }) => {
      // Create observable for subscription
      return observable<AppointmentEvent>((emit) => {
        const onAppointmentEvent = (data: AppointmentEvent) => {
          // Filter by artistId if provided
          if (input?.artistId && data.data.artistId !== input.artistId) {
            return;
          }

          // Filter by customerId if provided
          if (input?.customerId && data.data.customerId !== input.customerId) {
            return;
          }

          void emit.next(data);
        };

        // Subscribe to appointment events
        void ee.on('appointment', onAppointmentEvent);

        // Cleanup when client unsubscribes
        return () => {
          void ee.off('appointment', onAppointmentEvent);
        };
      });
    }),

  // Customer events subscription (admin only)
  customerEvents: adminProcedure
    .input(
      z
        .object({
          customerId: z.string().optional(),
        })
        .optional()
    )
    .subscription(({ input }) => {
      // Create observable for subscription
      return observable<CustomerEvent>((emit) => {
        const onCustomerEvent = (data: CustomerEvent) => {
          // Filter by customerId if provided
          if (input?.customerId && data.id !== input.customerId) {
            return;
          }

          void emit.next(data);
        };

        // Subscribe to customer events
        void ee.on('customer', onCustomerEvent);

        // Cleanup when client unsubscribes
        return () => {
          void ee.off('customer', onCustomerEvent);
        };
      });
    }),

  // Gallery events subscription (public)
  galleryEvents: publicProcedure.subscription(() => {
    // Create observable for subscription - public access for all visitors
    return observable<GalleryEvent>((emit) => {
      const onGalleryEvent = (data: GalleryEvent) => {
        // Only emit events for approved designs or all events for approved designs
        if (data.type === 'approved' || (data.type === 'created' && data.data.isApproved)) {
          void emit.next(data);
        }
      };

      // Subscribe to gallery events
      void ee.on('gallery', onGalleryEvent);

      // Cleanup when client unsubscribes
      return () => {
        void ee.off('gallery', onGalleryEvent);
      };
    });
  }),

  // Gallery events subscription (admin only - sees all events)
  galleryAdminEvents: adminProcedure.subscription(() => {
    // Create observable for subscription
    return observable<GalleryEvent>((emit) => {
      const onGalleryEvent = (data: GalleryEvent) => {
        // Admin sees all gallery events
        void emit.next(data);
      };

      // Subscribe to gallery events
      void ee.on('gallery', onGalleryEvent);

      // Cleanup when client unsubscribes
      return () => {
        void ee.off('gallery', onGalleryEvent);
      };
    });
  }),

  // Dashboard activity stream (admin only)
  dashboardActivity: adminProcedure.subscription(() => {
    // Create a generator-based subscription for more complex event handling
    return observable<DashboardActivityEvent>((emit) => {
      // Combined event handler for all activity types
      const onActivity = (
        type: string,
        data: BookingEvent | AppointmentEvent | CustomerEvent | GalleryEvent
      ) => {
        void emit.next({
          type,
          data,
          timestamp: new Date(),
        });
      };

      // Subscribe to all event types for dashboard
      const onBooking = (data: BookingEvent) => onActivity('booking', data);
      const onAppointment = (data: AppointmentEvent) => onActivity('appointment', data);
      const onCustomer = (data: CustomerEvent) => onActivity('customer', data);
      const onGallery = (data: GalleryEvent) => onActivity('gallery', data);

      void ee.on('booking', onBooking);
      void ee.on('appointment', onAppointment);
      void ee.on('customer', onCustomer);
      void ee.on('gallery', onGallery);

      // Cleanup when client unsubscribes
      return () => {
        void ee.off('booking', onBooking);
        void ee.off('appointment', onAppointment);
        void ee.off('customer', onCustomer);
        void ee.off('gallery', onGallery);
      };
    });
  }),
});
