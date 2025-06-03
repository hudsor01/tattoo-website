/**
 * Dashboard Activity tRPC Router
 *
 * Provides type-safe procedures for activity tracking and notifications within the dashboard.
 * Split from dashboard-router.ts for better maintainability and organization.
 */

import { z } from 'zod';
import { logger } from '@/lib/logger';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '@/lib/trpc/procedures';
import { prisma } from '@/lib/db/prisma';
import { TRPCError } from '@trpc/server';
import type { Prisma } from '@prisma/client';

// Activity and notification schemas using Zod
const RecentActivitySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  includeSystem: z.boolean().default(false),
  types: z.array(z.string()).optional(),
});

const ActivityFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  types: z.array(z.enum(['contact', 'customer', 'booking', 'payment'])).optional(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

// Type for activity items - this is a UI type, not a database model
type ActivityItem = {
  id: string;
  type: 'contact' | 'customer' | 'booking' | 'payment';
  title: string;
  message: string;
  time: string;
  timeAgo: string;
  link: string;
  data: Record<string, unknown>;
};

// Type for notification-like items derived from existing models
type NotificationItem = {
  id: string;
  type: 'contact' | 'customer' | 'booking' | 'payment';
  title: string;
  message: string;
  time: string;
  timeAgo: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  link: string;
  data: Record<string, unknown>;
};

/**
 * Helper function to get human-readable time ago string
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

export const activityRouter = router({
  getRecentActivity: publicProcedure.input(RecentActivitySchema).query(async ({ input }) => {
    const { limit } = input;

    try {
      // Since bookings and appointments are handled by Cal.com integration,
      // we'll focus on internal activities like contact forms, customer additions, etc.
      
      // Get recent contacts
      const recentContacts = await prisma.contact.findMany({
        take: Math.ceil(limit / 3), // Split between contacts, customers, and payments
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          createdAt: true,
        },
      });

      // Get recent customers
      const recentCustomers = await prisma.customer.findMany({
        take: Math.ceil(limit / 3),
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      // Get recent payments
      const recentPayments = await prisma.payment.findMany({
        take: Math.ceil(limit / 3),
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          customerName: true,
          customerEmail: true,
          serviceName: true,
          createdAt: true,
        },
      });

      // Transform into activity items
      const activityItems: ActivityItem[] = [
        ...recentContacts.map((contact) => ({
          id: `contact-${contact.id}`,
          type: 'contact' as const,
          title: 'New Contact Message',
          message: `${contact.name} sent a message: ${contact.subject ?? 'No subject'}`,
          time: contact.createdAt.toISOString(),
          timeAgo: getTimeAgo(contact.createdAt),
          link: `/admin/contacts?id=${contact.id}`,
          data: {
            contactId: contact.id,
            contactName: contact.name,
            contactEmail: contact.email,
          },
        })),
        ...recentCustomers.map((customer) => ({
          id: `customer-${customer.id}`,
          type: 'customer' as const,
          title: 'New Customer',
          message: `${customer.firstName} ${customer.lastName} joined`,
          time: customer.createdAt.toISOString(),
          timeAgo: getTimeAgo(customer.createdAt),
          link: `/admin/customers?id=${customer.id}`,
          data: {
            customerId: customer.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerEmail: customer.email,
          },
        })),
        ...recentPayments.map((payment) => ({
          id: `payment-${payment.id}`,
          type: 'payment' as const,
          title: 'Payment Received',
          message: `${payment.customerName} paid ${payment.currency} ${payment.amount} for ${payment.serviceName ?? 'Service'}`,
          time: payment.createdAt.toISOString(),
          timeAgo: getTimeAgo(payment.createdAt),
          link: `/admin/payments?id=${payment.id}`,
          data: {
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
          },
        })),
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, limit);

      return {
        activities: activityItems,
        total: activityItems.length,
      };
    } catch (error) {
      void logger.error('Error fetching recent activity:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recent activity',
        cause: error,
      });
    }
  }),

  getNotifications: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      unreadOnly: z.boolean().default(false),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    }))
    .query(async ({ input }) => {
      const { limit } = input;

      try {
        // Since we don't have a notifications table, we'll create "notifications" 
        // from recent unhandled contacts and pending payments
        
        // Get recent unhandled contacts (as high priority notifications)
        const recentContacts = await prisma.contact.findMany({
          orderBy: { createdAt: 'desc' },
          take: Math.ceil(limit / 2),
          select: {
            id: true,
            name: true,
            email: true,
            subject: true,
            message: true,
            createdAt: true,
          },
        });

        // Get pending payments (as medium priority notifications)
        const pendingPayments = await prisma.payment.findMany({
          where: {
            status: 'PENDING',
          },
          orderBy: { createdAt: 'desc' },
          take: Math.ceil(limit / 2),
          select: {
            id: true,
            amount: true,
            currency: true,
            customerName: true,
            customerEmail: true,
            serviceName: true,
            createdAt: true,
          },
        });

        // Transform into notification items
        const notifications: NotificationItem[] = [
          ...recentContacts.map((contact) => ({
            id: `contact-${contact.id}`,
            type: 'contact' as const,
            title: 'New Contact Message',
            message: `${contact.name}: ${contact.subject ?? 'New message'}`,
            time: contact.createdAt.toISOString(),
            timeAgo: getTimeAgo(contact.createdAt),
            priority: 'high' as const,
            read: false, // Contacts are always "unread" since we don't track this
            link: `/admin/contacts?id=${contact.id}`,
            data: {
              contactId: contact.id,
              preview: contact.message.substring(0, 100),
            },
          })),
          ...pendingPayments.map((payment) => ({
            id: `payment-${payment.id}`,
            type: 'payment' as const,
            title: 'Pending Payment',
            message: `${payment.customerName} - ${payment.currency} ${payment.amount}`,
            time: payment.createdAt.toISOString(),
            timeAgo: getTimeAgo(payment.createdAt),
            priority: 'medium' as const,
            read: false, // Pending payments are "unread"
            link: `/admin/payments?id=${payment.id}`,
            data: {
              paymentId: payment.id,
              amount: payment.amount,
              currency: payment.currency,
            },
          })),
        ]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, limit);

        return {
          notifications,
          unreadCount: notifications.filter(n => !n.read).length,
          total: notifications.length,
        };
      } catch (error) {
        void logger.error('Error fetching notifications:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
          cause: error,
        });
      }
    }),

  // Get activity statistics
  getActivityStats: protectedProcedure
    .input(z.object({
      timeRange: z.enum(['day', 'week', 'month', 'year']).default('week'),
    }))
    .query(async ({ input }) => {
      try {
        const now = new Date();
        let startDate: Date;

        switch (input.timeRange) {
          case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case 'year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        }

        // Get counts in parallel
        const [contactsCount, customersCount, paymentsCount, bookingsCount] = await Promise.all([
          prisma.contact.count({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
          }),
          prisma.customer.count({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
          }),
          prisma.payment.count({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
          }),
          prisma.calBooking.count({
            where: {
              createdAt: {
                gte: startDate,
              },
            },
          }),
        ]);

        return {
          timeRange: input.timeRange,
          startDate: startDate.toISOString(),
          stats: {
            contacts: contactsCount,
            customers: customersCount,
            payments: paymentsCount,
            bookings: bookingsCount,
            total: contactsCount + customersCount + paymentsCount + bookingsCount,
          },
        };
      } catch (error) {
        void logger.error('Error fetching activity stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch activity statistics',
          cause: error,
        });
      }
    }),

  // Get filtered activity with pagination
  getFilteredActivity: protectedProcedure
    .input(ActivityFilterSchema)
    .query(async ({ input }) => {
      try {
        const { startDate, endDate, types, limit } = input;

        // Build date filter
        const dateFilter: Prisma.DateTimeFilter = {};
        if (startDate) {
          dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
          dateFilter.lte = new Date(endDate);
        }

        // Initialize arrays for each type
        const activities: ActivityItem[] = [];

        // Fetch data based on selected types (or all if none specified)
        const shouldFetchContacts = !types || types.includes('contact');
        const shouldFetchCustomers = !types || types.includes('customer');
        const shouldFetchPayments = !types || types.includes('payment');
        const shouldFetchBookings = !types || types.includes('booking');

        // Fetch each type in parallel
        const [contacts, customers, payments, bookings] = await Promise.all([
          shouldFetchContacts
            ? prisma.contact.findMany({
                where: { createdAt: dateFilter },
                orderBy: { createdAt: 'desc' },
                take: Math.ceil(limit / 4),
                select: {
                  id: true,
                  name: true,
                  email: true,
                  subject: true,
                  createdAt: true,
                },
              })
            : [],
          shouldFetchCustomers
            ? prisma.customer.findMany({
                where: { createdAt: dateFilter },
                orderBy: { createdAt: 'desc' },
                take: Math.ceil(limit / 4),
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  createdAt: true,
                },
              })
            : [],
          shouldFetchPayments
            ? prisma.payment.findMany({
                where: { createdAt: dateFilter },
                orderBy: { createdAt: 'desc' },
                take: Math.ceil(limit / 4),
                select: {
                  id: true,
                  amount: true,
                  currency: true,
                  status: true,
                  customerName: true,
                  serviceName: true,
                  createdAt: true,
                },
              })
            : [],
          shouldFetchBookings
            ? prisma.calBooking.findMany({
                where: { createdAt: dateFilter },
                orderBy: { createdAt: 'desc' },
                take: Math.ceil(limit / 4),
                select: {
                  id: true,
                  title: true,
                  attendeeName: true,
                  attendeeEmail: true,
                  serviceName: true,
                  startTime: true,
                  status: true,
                  createdAt: true,
                },
              })
            : [],
        ]);

        // Transform contacts
        if (contacts.length > 0) {
          activities.push(
            ...contacts.map((contact) => ({
              id: `contact-${contact.id}`,
              type: 'contact' as const,
              title: 'New Contact Message',
              message: `${contact.name} sent a message: ${contact.subject ?? 'No subject'}`,
              time: contact.createdAt.toISOString(),
              timeAgo: getTimeAgo(contact.createdAt),
              link: `/admin/contacts?id=${contact.id}`,
              data: {
                contactId: contact.id,
                contactName: contact.name,
                contactEmail: contact.email,
              },
            }))
          );
        }

        // Transform customers
        if (customers.length > 0) {
          activities.push(
            ...customers.map((customer) => ({
              id: `customer-${customer.id}`,
              type: 'customer' as const,
              title: 'New Customer',
              message: `${customer.firstName} ${customer.lastName} joined`,
              time: customer.createdAt.toISOString(),
              timeAgo: getTimeAgo(customer.createdAt),
              link: `/admin/customers?id=${customer.id}`,
              data: {
                customerId: customer.id,
                customerName: `${customer.firstName} ${customer.lastName}`,
                customerEmail: customer.email,
              },
            }))
          );
        }

        // Transform payments
        if (payments.length > 0) {
          activities.push(
            ...payments.map((payment) => ({
              id: `payment-${payment.id}`,
              type: 'payment' as const,
              title: 'Payment Activity',
              message: `${payment.customerName} - ${payment.currency} ${payment.amount} (${payment.status})`,
              time: payment.createdAt.toISOString(),
              timeAgo: getTimeAgo(payment.createdAt),
              link: `/admin/payments?id=${payment.id}`,
              data: {
                paymentId: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
              },
            }))
          );
        }

        // Transform bookings
        if (bookings.length > 0) {
          activities.push(
            ...bookings.map((booking) => ({
              id: `booking-${booking.id}`,
              type: 'booking' as const,
              title: 'Booking Activity',
              message: `${booking.attendeeName} booked ${booking.serviceName}`,
              time: booking.createdAt.toISOString(),
              timeAgo: getTimeAgo(booking.createdAt),
              link: `/admin/bookings?id=${booking.id}`,
              data: {
                bookingId: booking.id,
                attendeeName: booking.attendeeName,
                serviceName: booking.serviceName,
                startTime: booking.startTime.toISOString(),
                status: booking.status,
              },
            }))
          );
        }

        // Sort by time and limit
        const sortedActivities = activities
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, limit);

        return {
          activities: sortedActivities,
          total: sortedActivities.length,
          hasMore: sortedActivities.length >= limit,
        };
      } catch (error) {
        void logger.error('Error fetching filtered activity:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch filtered activity',
          cause: error,
        });
      }
    }),
});