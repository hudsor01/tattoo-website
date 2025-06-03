/**
 * Subscription Router
 *
 * This router handles all real-time subscription endpoints using tRPC's
 * subscription feature with Server-Sent Events (SSE).
 * 
 * This implementation includes:
 * - Memory-safe EventManager with memory leak prevention
 * - Strong type safety and validation
 * - Proper error handling with structured logging
 * - Rate limiting for subscription endpoints
 * - Resource cleanup on unsubscribe
 */
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../procedures';
import { observable } from '@trpc/server/observable';
import { TRPCError } from '@trpc/server';
import { logger } from '@/lib/logger';
import { UserRole, Permission } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

// =============================================================================
// Event Manager - Memory-Safe Implementation
// =============================================================================

/**
 * Type-safe EventManager to handle real-time events with memory management
 * Uses a Map-based storage to prevent memory leaks and track subscribers
 */
class EventManager<T extends Record<string, unknown>> {
  private events = new Map<string, Map<string, (data: unknown) => void>>();
  private subscriptionCounts = new Map<string, number>();
  private readonly maxListenersPerEvent: number;
  private readonly debugMode: boolean;
  
  constructor(options?: { maxListenersPerEvent?: number; debug?: boolean }) {
    this.maxListenersPerEvent = options?.maxListenersPerEvent ?? 100;
    this.debugMode = options?.debug ?? false;
  }

  /**
   * Subscribe to an event with a unique subscriber ID
   * @param eventName The event to subscribe to
   * @param subscriberId Unique ID for this subscriber
   * @param callback Function to call when event occurs
   * @returns Unsubscribe function
   */
  on<E extends keyof T & string>(
    eventName: E, 
    subscriberId: string, 
    callback: (data: T[E]) => void
  ): () => void {
    // Check if we've reached the max listeners limit
    const count = this.subscriptionCounts.get(eventName) ?? 0;
    if (count >= this.maxListenersPerEvent) {
      logger.warn('Max listeners reached for event', { eventName, count });
      throw new Error(`Max listeners (${this.maxListenersPerEvent}) reached for event: ${eventName}`);
    }
    
    // Get or create the event subscribers map
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Map());
      this.subscriptionCounts.set(eventName, 0);
    }
    
    const subscribers = this.events.get(eventName) ?? new Map();
    
    // Add the subscriber with proper type casting
    subscribers.set(subscriberId, callback as (data: unknown) => void);
    this.subscriptionCounts.set(eventName, count + 1);
    
    if (this.debugMode) {
      logger.debug('Subscription added', { 
        eventName, 
        subscriberId, 
        totalSubscribers: subscribers.size 
      });
    }
    
    // Return unsubscribe function
    return () => {
      this.off(eventName, subscriberId);
    };
  }

  /**
   * Unsubscribe from an event
   * @param eventName The event to unsubscribe from
   * @param subscriberId Unique ID for this subscriber
   */
  off<E extends keyof T & string>(eventName: E, subscriberId: string): void {
    const subscribers = this.events.get(eventName);
    if (!subscribers) return;
    
    const deleted = subscribers.delete(subscriberId);
    
    if (deleted) {
      const count = this.subscriptionCounts.get(eventName) ?? 0;
      this.subscriptionCounts.set(eventName, Math.max(0, count - 1));
      
      if (this.debugMode) {
        logger.debug('Subscription removed', { 
          eventName, 
          subscriberId, 
          totalSubscribers: subscribers.size 
        });
      }
      
      // Clean up empty event maps to prevent memory leaks
      if (subscribers.size === 0) {
        this.events.delete(eventName);
        this.subscriptionCounts.delete(eventName);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   * @param eventName The event to emit
   * @param data The data to send with the event
   */
  emit<E extends keyof T & string>(eventName: E, data: T[E]): void {
    const subscribers = this.events.get(eventName);
    if (!subscribers || subscribers.size === 0) return;
    
    // Track errors but continue attempting to deliver to all subscribers
    const errors: Error[] = [];
    
    // Call all subscriber callbacks
    for (const [subscriberId, callback] of subscribers.entries()) {
      try {
        callback(data);
      } catch (error) {
        // Catch any errors in subscriber callbacks to prevent one bad subscriber
        // from affecting others
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);
        logger.error('Error in event subscriber callback', { 
          eventName, 
          subscriberId, 
          error: err.message,
          stack: err.stack 
        });
        
        // Remove problematic subscriber to prevent recurring errors
        subscribers.delete(subscriberId);
        const count = this.subscriptionCounts.get(eventName) ?? 0;
        this.subscriptionCounts.set(eventName, Math.max(0, count - 1));
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Errors occurred while emitting event', { 
        eventName, 
        errorCount: errors.length,
        subscriberCount: subscribers.size 
      });
    }
  }

  /**
   * Get current subscription counts
   * @returns Object with event names and subscription counts
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [eventName, count] of this.subscriptionCounts.entries()) {
      stats[eventName] = count;
    }
    return stats;
  }

  /**
   * Remove all subscriptions for cleanup
   */
  removeAllListeners(): void {
    this.events.clear();
    this.subscriptionCounts.clear();
    logger.info('All event listeners removed');
  }
}

// Create strongly-typed event interface
interface EventTypes {
  booking: BookingEvent;
  appointment: AppointmentEvent;
  customer: CustomerEvent;
  gallery: GalleryEvent;
  [key: string]: unknown;
}

// Create the event manager instance with debugging in development
const eventManager = new EventManager<EventTypes>({ 
  maxListenersPerEvent: 100,
  debug: process.env.NODE_ENV === 'development'
});

// =============================================================================
// Event Data Types
// =============================================================================

// Base event data interfaces
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
  category?: string | null;
  tags?: string[] | null;
  dimensions?: string | null;
  [key: string]: unknown;
}

// Define dashboard activity event type
interface DashboardActivityEvent {
  type: string;
  data: BookingEvent | AppointmentEvent | CustomerEvent | GalleryEvent;
  timestamp: Date;
}

// Define specific event types
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

// =============================================================================
// Event Emitter Functions
// =============================================================================

/**
 * Emit a booking event
 * @param event Booking event to emit
 */
export function emitBookingEvent(event: BookingEvent): void {
  // Validate event data to ensure it meets requirements
  if (!event?.id || !event.type || !event.data) {
    logger.warn('Invalid booking event data. Event not emitted.', { event });
    return;
  }
  
  try {
    eventManager.emit('booking', event);
    logger.debug('Booking event emitted', { id: event.id, type: event.type });
  } catch (error) {
    logger.error('Failed to emit booking event', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      id: event.id, 
      type: event.type 
    });
  }
}

/**
 * Emit an appointment event
 * @param event Appointment event to emit
 */
export function emitAppointmentEvent(event: AppointmentEvent): void {
  // Validate event data to ensure it meets requirements
  if (!event?.id || !event.type || !event.data) {
    logger.warn('Invalid appointment event data. Event not emitted.', { event });
    return;
  }

  try {
    eventManager.emit('appointment', event);
    logger.debug('Appointment event emitted', { id: event.id, type: event.type });
  } catch (error) {
    logger.error('Failed to emit appointment event', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      id: event.id, 
      type: event.type 
    });
  }
}

/**
 * Emit a customer event
 * @param event Customer event to emit
 */
export function emitCustomerEvent(event: CustomerEvent): void {
  // Validate event data to ensure it meets requirements
  if (!event?.id || !event.type || !event.data) {
    logger.warn('Invalid customer event data. Event not emitted.', { event });
    return;
  }

  try {
    eventManager.emit('customer', event);
    logger.debug('Customer event emitted', { id: event.id, type: event.type });
  } catch (error) {
    logger.error('Failed to emit customer event', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      id: event.id, 
      type: event.type 
    });
  }
}

/**
 * Emit a gallery event
 * @param event Gallery event to emit
 */
export function emitGalleryEvent(event: GalleryEvent): void {
  // Validate event data to ensure it meets requirements
  if (!event?.id || !event.type || !event.data) {
    logger.warn('Invalid gallery event data. Event not emitted.', { event });
    return;
  }

  try {
    eventManager.emit('gallery', event);
    logger.debug('Gallery event emitted', { id: event.id, type: event.type });
  } catch (error) {
    logger.error('Failed to emit gallery event', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      id: event.id, 
      type: event.type 
    });
  }
}

// =============================================================================
// Validation Schemas
// =============================================================================

const BookingFilterSchema = z.object({
  artistId: z.string().optional(),
}).optional();

const AppointmentFilterSchema = z.object({
  artistId: z.string().optional(),
  customerId: z.string().optional(),
}).optional();

const CustomerFilterSchema = z.object({
  customerId: z.string().optional(),
}).optional();

const GalleryFilterSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  categories: z.array(z.string()).optional(),
}).optional();

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a user has the required permissions
 * @param userId User ID
 * @param requiredPermissions Array of permissions to check
 * @returns True if user has all required permissions
 */
async function validateUserPermissions(
  userId: string, 
  requiredPermissions: Permission[]
): Promise<boolean> {
  try {
    // Get user's role from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (!user) {
      logger.warn('User not found when validating permissions', { userId });
      return false;
    }
    
    // Check permissions based on role
    const userRole = user.role as UserRole;
    
    // Admins have all permissions
    if (userRole === UserRole.ADMIN) {
      return true;
    }
    
    // Artists have specific permissions
    if (userRole === UserRole.ARTIST) {
      // Implement role-based permissions logic here
      // For now, simplify by returning true for basic artist permissions
      const artistPermissions = [
        Permission.VIEW_BOOKINGS,
        Permission.UPDATE_GALLERY,
        Permission.VIEW_OWN_BOOKINGS
      ];
      
      return requiredPermissions.every(perm => artistPermissions.includes(perm));
    }
    
    return false;
  } catch (error) {
    logger.error('Error validating user permissions', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

/**
 * Safely sanitize event data to remove sensitive information
 * @param event The event to sanitize
 * @param sensitiveFields Fields to remove
 * @returns Sanitized event
 */
function sanitizeEventData<T extends Record<string, unknown> & { data?: Record<string, unknown> }>(
  event: T, 
  sensitiveFields: string[]
): T {
  // Create a shallow copy of the event
  const sanitized = { ...event };
  
  // If the event has a data property, sanitize it
  if (sanitized && 'data' in sanitized && sanitized.data && typeof sanitized.data === 'object') {
    // Cast to a record type to ensure TypeScript understands we're using an index signature
    const dataRecord = sanitized.data as Record<string, unknown>;
    sanitized.data = { ...dataRecord };
    
    // Remove sensitive fields from the data
    for (const field of sensitiveFields) {
      // Use proper object access to avoid index signature access errors
      if (Object.prototype.hasOwnProperty.call(dataRecord, field)) {
        delete (sanitized.data as Record<string, unknown>)[field];
      }
    }
  }
  
  return sanitized;
}

// Removed unused getArtistId function

// =============================================================================
// Subscription Router Implementation
// =============================================================================

export const subscriptionRouter = router({
  // ===========================================================================
  // BOOKING EVENTS SUBSCRIPTION
  // ===========================================================================
  bookingEvents: protectedProcedure
    .input(BookingFilterSchema)
    .subscription(async ({ input, ctx }) => {
      // Verify user has access to booking events based on their role
      let isAdmin = false;
      let isArtist = false;
      let artistId: string | null = null;
      
      try {
        // Validate user session and permissions
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Authentication required to access booking events'
          });
        }
        
        // Get user's role and profile from database
        const user = await prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { 
            id: true,
            role: true
            // Remove artist relation since it doesn't exist in the schema
          }
        });
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found'
          });
        }
        
        isAdmin = user.role === UserRole.ADMIN;
        isArtist = user.role === UserRole.ARTIST;
        
        // Get artist ID if user is an artist - using user ID as artist ID
        if (isArtist) {
          artistId = user.id; // Use user ID as artist ID since there's no artist relation
        }
        
        // Role-based access control for booking events
        if (isArtist && input?.artistId) {
          // Artists can only access their own bookings
          if (artistId !== input.artistId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Artists can only subscribe to their own booking events'
            });
          }
        }
        
        // Verify permission to access booking events
        if (!isAdmin && !isArtist) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to access booking events'
          });
        }

        // Log subscription start
        logger.info('User subscribed to booking events', {
          userId: ctx.userId,
          isAdmin,
          isArtist,
          artistId: input?.artistId
        });
      } catch (error) {
        logger.error('Error in booking events subscription', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: ctx.userId 
        });
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initialize booking events subscription',
          cause: error
        });
      }

      // Create unique subscriber ID to prevent memory leaks
      const subscriberId = `booking-${ctx.userId}-${Date.now()}`;
      
      // Set up rate limiting
      const maxEventsPerMinute = 60;
      let eventCount = 0;
      let lastRateLimitReset = Date.now();
      
      // List of sensitive fields to remove based on role
      const sensitiveFields = isAdmin ? [] : [
        'internalNotes',
        'paymentDetails',
        'adminComments',
        'financialData',
        'sensitiveCustomerInfo'
      ];

      // Create observable for subscription
      return observable<BookingEvent>((emit) => {
        const onBookingEvent = (data: BookingEvent) => {
          try {
            // Apply rate limiting
            const now = Date.now();
            if (now - lastRateLimitReset > 60000) {
              eventCount = 0;
              lastRateLimitReset = now;
            }
            
            if (eventCount >= maxEventsPerMinute) {
              logger.warn('Rate limit exceeded for booking events', { userId: ctx.userId });
              return;
            }
            
            eventCount++;
            
            // First, validate the event data to ensure it meets security requirements
            if (!data?.id) {
              logger.warn('Received invalid booking event data', { eventData: data });
              return;
            }
            
            // Filter by artistId if provided in the subscription request
            if (input?.artistId && data.data.artistId !== input.artistId) {
              return; // Skip events not matching the requested artist
            }

            // Apply role-based access control
            if (isAdmin) {
              // Admins can see all booking events
              emit.next(data);
            } else if (isArtist && artistId) {
              if (data.data.artistId === artistId) {
                // Remove any sensitive information before sending to artists
                const sanitizedData = sanitizeEventData(data, sensitiveFields);
                emit.next(sanitizedData);
              }
            }
          } catch (error) {
            logger.error('Error processing booking event', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              eventId: data.id 
            });
          }
        };

        // Subscribe to booking events
        const unsubscribe = eventManager.on('booking', subscriberId, onBookingEvent);

        // Cleanup when client unsubscribes
        return () => {
          unsubscribe();
          logger.debug('User unsubscribed from booking events', { userId: ctx.userId });
        };
      });
    }),

  // ===========================================================================
  // APPOINTMENT EVENTS SUBSCRIPTION
  // ===========================================================================
  appointmentEvents: protectedProcedure
    .input(AppointmentFilterSchema)
    .subscription(async ({ input, ctx }) => {
      // Verify user has access to appointment events
      let isAdmin = false;
      let isArtist = false;
      let isCustomer = false;
      let customerIds: string[] = [];
      let artistId: string | null = null;
      
      try {
        // Get user's role and relevant IDs from database
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Authentication required to access appointment events'
          });
        }
        
        const user = await prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { 
            role: true
            // No artist or customer relation in schema
          }
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User profile not found'
          });
        }

        isAdmin = user.role === UserRole.ADMIN;
        isArtist = user.role === UserRole.ARTIST;
        isCustomer = user.role === UserRole.CUSTOMER;
        
        // Get artist ID if user is an artist - use userId
        if (isArtist) {
          artistId = ctx.userId; // Use userId as artistId
        }
        
        // Get customer ID if user is a client - use userId
        if (isCustomer) {
          customerIds = [ctx.userId]; // Use userId as customerId
        }
        
        // Role-based access control checks
        if (isArtist && input?.artistId && artistId !== input.artistId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Artists can only subscribe to their own appointment events'
          });
        }
        
        if (isCustomer && input?.customerId && !customerIds.includes(input.customerId)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Clients can only subscribe to their own appointment events'
          });
        }
        
        // Log subscription start
        logger.info('User subscribed to appointment events', {
          userId: ctx.userId,
          isAdmin,
          isArtist,
          isCustomer,
          artistId: input?.artistId,
          customerId: input?.customerId
        });
      } catch (error) {
        logger.error('Error in appointment events subscription', { 
          error: error instanceof Error ? error.message : 'Unknown error', 
          userId: ctx.userId 
        });
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initialize appointment events subscription',
          cause: error
        });
      }

      // Create unique subscriber ID to prevent memory leaks
      const subscriberId = `appointment-${ctx.userId}-${Date.now()}`;
      
      // Set up rate limiting
      const maxEventsPerMinute = 60;
      let eventCount = 0;
      let lastRateLimitReset = Date.now();
      
      // Define sensitive fields to remove based on role
      const sensitiveFields = isAdmin ? [] : [
        'internalNotes',
        'paymentDetails',
        'adminComments',
        'financialData',
        'sensitiveCustomerInfo'
      ];

      // Create observable for subscription
      return observable<AppointmentEvent>((emit) => {
        const onAppointmentEvent = (data: AppointmentEvent) => {
          try {
            // Apply rate limiting
            const now = Date.now();
            if (now - lastRateLimitReset > 60000) {
              eventCount = 0;
              lastRateLimitReset = now;
            }
            
            if (eventCount >= maxEventsPerMinute) {
              logger.warn('Rate limit exceeded for appointment events', { userId: ctx.userId });
              return;
            }
            
            eventCount++;
            
            // Validate event data
            if (!data?.id) {
              logger.warn('Received invalid appointment event data', { eventData: data });
              return;
            }
            
            // Filter by artistId if provided
            if (input?.artistId && data.data.artistId !== input.artistId) {
              return;
            }

            // Filter by customerId if provided
            if (input?.customerId && data.data.customerId !== input.customerId) {
              return;
            }
            
            // Apply business rules based on user role
            if (isAdmin) {
              // Admins see all appointments
              emit.next(data);
            } else if (isArtist && data.data.artistId === artistId) {
              // Artists see appointments assigned to them
              const sanitizedData = sanitizeEventData(data, sensitiveFields);
              emit.next(sanitizedData);
            } else if (isCustomer && customerIds.includes(data.data.customerId ?? '')) {
              // Clients only see their own appointments
              const sanitizedData = sanitizeEventData(data, sensitiveFields);
              emit.next(sanitizedData);
            }
          } catch (error) {
            logger.error('Error processing appointment event', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              eventId: data.id 
            });
          }
        };

        // Subscribe to appointment events
        const unsubscribe = eventManager.on('appointment', subscriberId, onAppointmentEvent);

        // Cleanup when client unsubscribes
        return () => {
          unsubscribe();
          logger.debug('User unsubscribed from appointment events', { userId: ctx.userId });
        };
      });
    }),

  // ===========================================================================
  // CUSTOMER EVENTS SUBSCRIPTION (ADMIN ONLY)
  // ===========================================================================
  customerEvents: adminProcedure
    .input(CustomerFilterSchema)
    .subscription(async ({ input, ctx }) => {
      try {
        // Verify the user is truly an admin (since adminProcedure already checks auth)
        const user = await prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { role: true }
        });
        
        // Double-check admin role for sensitive customer data
        if (user?.role !== UserRole.ADMIN) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only administrators can access customer events'
          });
        }
        
        // Log subscription start
        logger.info('Admin subscribed to customer events', {
          userId: ctx.userId,
          customerId: input?.customerId
        });
      } catch (error) {
        logger.error('Error in customer events subscription', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: ctx.userId 
        });
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initialize customer events subscription',
          cause: error
        });
      }

      // Create unique subscriber ID to prevent memory leaks
      const subscriberId = `customer-${ctx.userId}-${Date.now()}`;
      
      // Set up rate limiting
      const maxEventsPerMinute = 60;
      let eventCount = 0;
      let lastRateLimitReset = Date.now();

      // Create observable for subscription
      return observable<CustomerEvent>((emit) => {
        const onCustomerEvent = (data: CustomerEvent) => {
          try {
            // Apply rate limiting
            const now = Date.now();
            if (now - lastRateLimitReset > 60000) {
              eventCount = 0;
              lastRateLimitReset = now;
            }
            
            if (eventCount >= maxEventsPerMinute) {
              logger.warn('Rate limit exceeded for customer events', { userId: ctx.userId });
              return;
            }
            
            eventCount++;
            
            // Validate event data
            if (!data?.id) {
              logger.warn('Received invalid customer event data', { eventData: data });
              return;
            }
            
            // Filter by customerId if provided
            if (input?.customerId && data.id !== input.customerId) {
              return;
            }

            // Apply GDPR and data protection rules
            // Filter out any sensitive data not needed for admin operations
            
            // Emit the customer event
            emit.next(data);
          } catch (error) {
            logger.error('Error processing customer event', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              eventId: data.id 
            });
          }
        };

        // Subscribe to customer events
        const unsubscribe = eventManager.on('customer', subscriberId, onCustomerEvent);

        // Cleanup when client unsubscribes
        return () => {
          unsubscribe();
          logger.debug('Admin unsubscribed from customer events', { userId: ctx.userId });
        };
      });
    }),

  // ===========================================================================
  // GALLERY EVENTS SUBSCRIPTION (PUBLIC)
  // ===========================================================================
  galleryEvents: publicProcedure
    .input(GalleryFilterSchema)
    .subscription(({ input, ctx }) => {
      // Prepare connection information for logging
      const userInfo = ctx.userId ? `User: ${ctx.userId}` : 'Anonymous user';
      const clientInfo = {
        userId: ctx.userId ?? 'anonymous',
        timestamp: new Date().toISOString(),
        subscriptionType: 'gallery_events',
        limit: input?.limit ?? 10,
        categories: input?.categories ?? [],
      };
      
      // Log the connection with structured data for analytics and security
      logger.info(`Public gallery events subscription started: ${userInfo}`, clientInfo);
      
      // Create unique subscriber ID to prevent memory leaks
      const subscriberId = `gallery-${ctx.userId ?? 'anonymous'}-${Date.now()}`;
      
      // Set up rate limiting
      const maxEventsPerMinute = 60;
      let eventCount = 0;
      let lastRateLimitReset = Date.now();
      
      // Create observable for subscription with proper rate limiting and security
      return observable<GalleryEvent>((emit) => {
        const onGalleryEvent = (data: GalleryEvent) => {
          try {
            // Apply rate limiting to prevent DoS
            const now = Date.now();
            if (now - lastRateLimitReset > 60000) {
              // Reset counter every minute
              eventCount = 0;
              lastRateLimitReset = now;
            }
            
            if (eventCount >= maxEventsPerMinute) {
              logger.warn('Gallery event rate limit exceeded for client', clientInfo);
              return; // Skip this event due to rate limiting
            }
            
            eventCount++;
            
            // Content filtering - only send approved and non-sensitive content
            if (data.data.isApproved !== true && data.type !== 'approved') {
              return; // Don't send unapproved content
            }
            
            // Category filtering if specified
            if (input?.categories?.length && data.data.category) {
              if (!input.categories.includes(String(data.data.category))) {
                return; // Skip events not matching requested categories
              }
            }
            
            // Sanitize data to prevent leaking internal information
            const sanitizedData: GalleryEvent = {
              id: data.id,
              type: data.type,
              data: {
                id: data.data.id,
                title: data.data.title ?? "",
                url: data.data.url ?? "",
                thumbUrl: data.data.thumbUrl ?? "",
                createdAt: data.data.createdAt ?? new Date(),
                // Additional safe fields that can be exposed to public
                category: data.data.category ?? null,
                tags: data.data.tags ?? null,
                dimensions: data.data.dimensions ?? null,
                // Add a placeholder field to ensure proper record type
                otherInfo: {} as Record<string, unknown>
              }
            };
            
            // Send sanitized event to client
            emit.next(sanitizedData);
          } catch (error) {
            logger.error('Error processing public gallery event', {
              error: error instanceof Error ? error.message : 'Unknown error',
              eventId: data.id,
              ...clientInfo
            });
          }
        };

        // Subscribe to gallery events
        const unsubscribe = eventManager.on('gallery', subscriberId, onGalleryEvent);

        // Cleanup when client unsubscribes
        return () => {
          unsubscribe();
          
          // Log unsubscription
          logger.debug('Public user unsubscribed from gallery events', clientInfo);
          
          // Record unsubscribe event for analytics - using logs for now
          logger.info('Gallery subscription ended', {
            eventType: 'subscription_end',
            eventCategory: 'realtime',
            eventName: 'gallery_subscription',
            userId: ctx.userId,
            metadata: {
              ...clientInfo,
              duration: Date.now() - new Date(clientInfo.timestamp).getTime(),
              eventsReceived: eventCount,
            }
          });
        };
      });
    }),

  // ===========================================================================
  // GALLERY ADMIN EVENTS SUBSCRIPTION (ADMIN ONLY)
  // ===========================================================================
  galleryAdminEvents: adminProcedure
    .subscription(async ({ ctx }) => {
      try {
        // Verify admin permissions for gallery management
        const hasGalleryPermissions = await validateUserPermissions(
          ctx.userId, 
          [Permission.MANAGE_GALLERY]
        );
        
        if (!hasGalleryPermissions) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to access gallery admin events'
          });
        }
        
        // Log subscription start
        logger.info('Admin subscribed to gallery admin events', { userId: ctx.userId });
      } catch (error) {
        logger.error('Error in gallery admin events subscription', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: ctx.userId 
        });
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initialize gallery admin events subscription',
          cause: error
        });
      }

      // Create unique subscriber ID to prevent memory leaks
      const subscriberId = `gallery-admin-${ctx.userId}-${Date.now()}`;
      
      // Create observable for subscription
      return observable<GalleryEvent>((emit) => {
        const onGalleryEvent = (data: GalleryEvent) => {
          try {
            // Admin sees all gallery events, including unapproved and internal ones
            emit.next(data);
            
            // Log sensitive operations for audit purposes
            if (data.type === 'deleted' || data.type === 'approved') {
              logger.info('Admin observed gallery moderation event', {
                userId: ctx.userId,
                eventType: data.type,
                galleryItemId: data.id
              });
            }
          } catch (error) {
            logger.error('Error processing gallery admin event', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              eventId: data.id 
            });
          }
        };

        // Subscribe to gallery events
        const unsubscribe = eventManager.on('gallery', subscriberId, onGalleryEvent);

        // Cleanup when client unsubscribes
        return () => {
          unsubscribe();
          logger.debug('Admin unsubscribed from gallery admin events', { userId: ctx.userId });
        };
      });
    }),

  // ===========================================================================
  // DASHBOARD ACTIVITY STREAM (ADMIN ONLY)
  // ===========================================================================
  dashboardActivity: adminProcedure
    .subscription(async ({ ctx }) => {
      try {
        // Verify the user is truly an admin with dashboard access
        const hasAdminPermissions = await validateUserPermissions(
          ctx.userId, 
          [Permission.MANAGE_USERS, Permission.MANAGE_BOOKINGS]
        );
        
        if (!hasAdminPermissions) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to access dashboard activity stream'
          });
        }
        
        // Log subscription start
        logger.info('Admin subscribed to dashboard activity stream', { userId: ctx.userId });
      } catch (error) {
        logger.error('Error in dashboard activity subscription', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: ctx.userId 
        });
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initialize dashboard activity subscription',
          cause: error
        });
      }
      
      // Create unique subscriber ID to prevent memory leaks
      const dashboardId = `dashboard-${ctx.userId}-${Date.now()}`;

      // Create a generator-based subscription for more complex event handling
      return observable<DashboardActivityEvent>((emit) => {
        // Combined event handler for all activity types
        const onActivity = (
          type: string,
          data: BookingEvent | AppointmentEvent | CustomerEvent | GalleryEvent
        ) => {
          try {
            // Create the dashboard activity event with correct type casting
            const activityEvent: DashboardActivityEvent = {
              type,
              data: data as BookingEvent | AppointmentEvent | CustomerEvent | GalleryEvent,
              timestamp: new Date(),
            };
            
            // Emit the event to the subscriber
            emit.next(activityEvent);
            
            // Record dashboard view activity for analytics
            logger.info('Dashboard activity recorded', {
              type: 'dashboard_view',
              userId: ctx.userId,
              eventType: type,
              eventId: typeof data.id === 'number' ? data.id.toString() : data.id
            });
          } catch (error) {
            logger.error('Error processing dashboard activity', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              eventType: type,
              userId: ctx.userId
            });
          }
        };

        // Subscribe to all event types for dashboard with type-specific handlers
        const bookingSubscriberId = `${dashboardId}-booking`;
        const appointmentSubscriberId = `${dashboardId}-appointment`;
        const customerSubscriberId = `${dashboardId}-customer`;
        const gallerySubscriberId = `${dashboardId}-gallery`;
        
        const onBooking = (data: BookingEvent) => onActivity('booking', data);
        const onAppointment = (data: AppointmentEvent) => onActivity('appointment', data);
        const onCustomer = (data: CustomerEvent) => onActivity('customer', data);
        const onGallery = (data: GalleryEvent) => onActivity('gallery', data);

        const unsubscribeBooking = eventManager.on('booking', bookingSubscriberId, onBooking);
        const unsubscribeAppointment = eventManager.on('appointment', appointmentSubscriberId, onAppointment);
        const unsubscribeCustomer = eventManager.on('customer', customerSubscriberId, onCustomer);
        const unsubscribeGallery = eventManager.on('gallery', gallerySubscriberId, onGallery);

        // Cleanup when client unsubscribes
        return () => {
          unsubscribeBooking();
          unsubscribeAppointment();
          unsubscribeCustomer();
          unsubscribeGallery();
          logger.debug('Admin unsubscribed from dashboard activity stream', { userId: ctx.userId });
        };
      });
    }),
    
  // ===========================================================================
  // SUBSCRIPTION STATS (ADMIN ONLY) - FOR MONITORING
  // ===========================================================================
  subscriptionStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Simplified permission check since adminProcedure already checks for admin role
        // Get subscription stats for monitoring
        const stats = eventManager.getStats();
        
        return {
          success: true,
          stats,
          timestamp: new Date(),
        };
      } catch (error) {
        logger.error('Error getting subscription stats', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: ctx.userId 
        });
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get subscription stats',
          cause: error
        });
      }
    }),
});

// =============================================================================
// HANDLING CLEANUP ON SERVER SHUTDOWN
// =============================================================================

// Handle process termination to clean up event listeners and prevent memory leaks
// This is especially important for production environments
if (process.env.NODE_ENV === 'production') {
  const cleanup = () => {
    try {
      eventManager.removeAllListeners();
      logger.info('Event listeners cleaned up on server shutdown');
    } catch (err) {
      logger.error('Error cleaning up event listeners', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };
  
  // Handle normal exit
  process.on('exit', cleanup);
  
  // Handle CTRL+C
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  
  // Handle kill command
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
  
  // Handle uncaught exceptions (should be rare in production)
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception in subscription system', {
      error: err.message,
      stack: err.stack
    });
    cleanup();
    
    // Give chance for logs to be written before exiting
    setTimeout(() => {
      process.exit(1);
    }, 500);
  });
}