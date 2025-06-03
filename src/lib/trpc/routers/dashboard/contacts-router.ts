/**
 * Dashboard Contacts tRPC Router
 *
 * Provides type-safe procedures for contact management within the dashboard.
 * Split from dashboard-router.ts for better maintainability and organization.
 */

import { z } from 'zod';
import { logger } from '@/lib/logger';
import { router, publicProcedure } from '@/lib/trpc/procedures';
import { prisma } from '@/lib/db/prisma';
import { TRPCError } from '@trpc/server';
// Recent contacts schema using Zod
const RecentContactsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
  search: z.string().optional(),
  orderBy: z.enum(['newest', 'oldest', 'name']).default('newest'),
});

export const contactsRouter = router({
  getRecentContacts: publicProcedure.input(RecentContactsSchema).query(async ({ input }) => {
    const { limit } = input;

    try {
      const contacts = await prisma.contact.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          createdAt: true,
        },
      });

      // Transform contacts for frontend consumption
      const transformedContacts = contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject ?? 'No Subject',
        message: contact.message.length > 100 
          ? `${contact.message.substring(0, 100)}...` 
          : contact.message,
        fullMessage: contact.message,
        read: false, // Default to unread since Contact model doesn't have read field
        createdAt: contact.createdAt.toISOString(),
        timeAgo: getTimeAgo(contact.createdAt),
      }));

      return {
        contacts: transformedContacts,
        unreadCount: contacts.length, // All contacts considered unread since no read field
      };
    } catch (error) {
      void logger.error('Error fetching recent contacts:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recent contacts',
        cause: error,
      });
    }
  }),

  // Note: markContactAsRead removed since Contact model doesn't have read field
  // If read status is needed, add read field to Contact model in Prisma schema

  deleteContact: publicProcedure
    .input(z.object({ id: z.number() })) // Contact id is number based on schema
    .mutation(async ({ input }) => {
      try {
        await prisma.contact.delete({
          where: { id: input.id },
        });

        return {
          success: true,
        };
      } catch (error) {
        void logger.error('Error deleting contact:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete contact',
          cause: error,
        });
      }
    }),
});

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