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
  ee.emit('booking', event);
}

export function emitAppointmentEvent(event: AppointmentEvent) {
  ee.emit('appointment', event);
}

export function emitCustomerEvent(event: CustomerEvent) {
  ee.emit('customer', event);
}

export function emitGalleryEvent(event: GalleryEvent) {
  ee.emit('gallery', event);
}

// Export the subscription router with all procedures
export const subscriptionRouter = router({
  // Booking events subscription
  bookingEvents: protectedProcedure
    .input(z.object({
      artistId: z.string().optional(),
    }).optional())
    .subscription(({ input, ctx }) => {
      // Verify user has access to booking events
      const isAdmin = ctx.user?.role === 'admin';
      const isArtist = ctx.user?.role === 'artist';
      
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
            emit.next(data);
            return;
          }
          
          // Artists can only see their own bookings
          if (isArtist && data.data.artistId === input?.artistId) {
            emit.next(data);
            return;
          }
        };
        
        // Subscribe to booking events
        ee.on('booking', onBookingEvent);
        
        // Cleanup when client unsubscribes
        return () => {
          ee.off('booking', onBookingEvent);
        };
      });
    }),
    
  // Appointment events subscription
  appointmentEvents: protectedProcedure
    .input(z.object({
      artistId: z.string().optional(),
      customerId: z.string().optional(),
    }).optional())
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
          
          emit.next(data);
        };
        
        // Subscribe to appointment events
        ee.on('appointment', onAppointmentEvent);
        
        // Cleanup when client unsubscribes
        return () => {
          ee.off('appointment', onAppointmentEvent);
        };
      });
    }),
    
  // Customer events subscription (admin only)
  customerEvents: adminProcedure
    .input(z.object({
      customerId: z.string().optional(),
    }).optional())
    .subscription(({ input }) => {
      // Create observable for subscription
      return observable<CustomerEvent>((emit) => {
        const onCustomerEvent = (data: CustomerEvent) => {
          // Filter by customerId if provided
          if (input?.customerId && data.id !== input.customerId) {
            return;
          }
          
          emit.next(data);
        };
        
        // Subscribe to customer events
        ee.on('customer', onCustomerEvent);
        
        // Cleanup when client unsubscribes
        return () => {
          ee.off('customer', onCustomerEvent);
        };
      });
    }),
    
  // Gallery events subscription (public)
  galleryEvents: publicProcedure
    .subscription(() => {
      // Create observable for subscription - public access for all visitors
      return observable<GalleryEvent>((emit) => {
        const onGalleryEvent = (data: GalleryEvent) => {
          // Only emit events for approved designs or all events for approved designs
          if (data.type === 'approved' || (data.type === 'created' && data.data.isApproved)) {
            emit.next(data);
          }
        };
        
        // Subscribe to gallery events
        ee.on('gallery', onGalleryEvent);
        
        // Cleanup when client unsubscribes
        return () => {
          ee.off('gallery', onGalleryEvent);
        };
      });
    }),
    
  // Gallery events subscription (admin only - sees all events)
  galleryAdminEvents: adminProcedure
    .subscription(() => {
      // Create observable for subscription
      return observable<GalleryEvent>((emit) => {
        const onGalleryEvent = (data: GalleryEvent) => {
          // Admin sees all gallery events
          emit.next(data);
        };
        
        // Subscribe to gallery events
        ee.on('gallery', onGalleryEvent);
        
        // Cleanup when client unsubscribes
        return () => {
          ee.off('gallery', onGalleryEvent);
        };
      });
    }),
    
  // Dashboard activity stream (admin only)
  dashboardActivity: adminProcedure
    .subscription(() => {
      // Create a generator-based subscription for more complex event handling
      return observable<DashboardActivityEvent>((emit) => {
        // Combined event handler for all activity types
        const onActivity = (type: string, data: BookingEvent | AppointmentEvent | CustomerEvent | GalleryEvent) => {
          emit.next({
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
        
        ee.on('booking', onBooking);
        ee.on('appointment', onAppointment);
        ee.on('customer', onCustomer);
        ee.on('gallery', onGallery);
        
        // Cleanup when client unsubscribes
        return () => {
          ee.off('booking', onBooking);
          ee.off('appointment', onAppointment);
          ee.off('customer', onCustomer);
          ee.off('gallery', onGallery);
        };
      });
    }),
});
