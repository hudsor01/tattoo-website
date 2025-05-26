import { z } from 'zod';
import { router, protectedProcedure } from '@/lib/trpc/procedures';
import { prisma } from '@/lib/db/prisma';
import { TRPCError } from '@trpc/server';

// Define validation schemas
const generalSettingsSchema = z.object({
  siteName: z.string().min(1),
  siteDescription: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  address: z.string(),
  businessHours: z.string(),
  timezone: z.string(),
});

const bookingSettingsSchema = z.object({
  bookingEnabled: z.boolean(),
  requireDeposit: z.boolean(),
  depositAmount: z.number().min(0),
  maxAdvanceBookingDays: z.number().min(1),
  minAdvanceBookingHours: z.number().min(1),
  cancellationHours: z.number().min(1),
  autoConfirmBookings: z.boolean(),
  sendReminderEmails: z.boolean(),
  reminderHoursBefore: z.number().min(1),
});

const emailSettingsSchema = z.object({
  emailProvider: z.enum(['resend', 'sendgrid', 'smtp']),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  replyToEmail: z.string().email(),
  sendWelcomeEmails: z.boolean(),
  sendBookingConfirmations: z.boolean(),
  sendPaymentConfirmations: z.boolean(),
  sendCancellationNotices: z.boolean(),
});

const securitySettingsSchema = z.object({
  requireTwoFactor: z.boolean(),
  sessionTimeout: z.number().min(1),
  maxLoginAttempts: z.number().min(1),
  lockoutDuration: z.number().min(1),
  requireStrongPasswords: z.boolean(),
  allowApiAccess: z.boolean(),
  logSecurityEvents: z.boolean(),
});

const notificationSettingsSchema = z.object({
  newBookingAlerts: z.boolean(),
  paymentAlerts: z.boolean(),
  cancellationAlerts: z.boolean(),
  systemMaintenanceAlerts: z.boolean(),
  errorAlerts: z.boolean(),
  weeklyReports: z.boolean(),
  monthlyReports: z.boolean(),
});

export const settingsRouter = router({
  // Get all settings
  getSettings: protectedProcedure.query(async () => {
    try {
      const settings = await prisma.settings.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      // Return default values if no settings exist
      if (!settings) {
        return {
          general: {
            siteName: "Fernando's Tattoo Studio",
            siteDescription: 'Professional tattoo artistry and custom designs',
            contactEmail: 'contact@fernandostattoo.com',
            contactPhone: '',
            address: '123 Tattoo Street, Art City, AC 12345',
            businessHours: 'Monday - Saturday: 10:00 AM - 8:00 PM',
            timezone: 'America/New_York',
          },
          booking: {
            bookingEnabled: true,
            requireDeposit: true,
            depositAmount: 100,
            maxAdvanceBookingDays: 90,
            minAdvanceBookingHours: 24,
            cancellationHours: 24,
            autoConfirmBookings: false,
            sendReminderEmails: true,
            reminderHoursBefore: 24,
          },
          email: {
            emailProvider: 'resend' as const,
            fromName: "Fernando's Tattoo Studio",
            fromEmail: 'noreply@ink37tattoos.com',
            replyToEmail: 'contact@ink37tattoos.com',
            sendWelcomeEmails: true,
            sendBookingConfirmations: true,
            sendPaymentConfirmations: true,
            sendCancellationNotices: true,
          },
          security: {
            requireTwoFactor: false,
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            lockoutDuration: 30,
            requireStrongPasswords: true,
            allowApiAccess: true,
            logSecurityEvents: true,
          },
          notifications: {
            newBookingAlerts: true,
            paymentAlerts: true,
            cancellationAlerts: true,
            systemMaintenanceAlerts: true,
            errorAlerts: true,
            weeklyReports: true,
            monthlyReports: true,
          },
        };
      }

      return {
        general: settings.generalSettings as unknown,
        booking: settings.bookingSettings as unknown,
        email: settings.emailSettings as unknown,
        security: settings.securitySettings as unknown,
        notifications: settings.notificationSettings as unknown,
      };
    } catch (error) {
      void console.error('Error fetching settings:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch settings',
      });
    }
  }),

  // Update general settings
  updateGeneralSettings: protectedProcedure
    .input(generalSettingsSchema)
    .mutation(async ({ input }) => {
      try {
        const settings = await prisma.settings.upsert({
          where: { id: 1 },
          create: {
            generalSettings: input,
            bookingSettings: {},
            emailSettings: {},
            securitySettings: {},
            notificationSettings: {},
          },
          update: {
            generalSettings: input,
            updatedAt: new Date(),
          },
        });

        return { success: true, settings };
      } catch (error) {
        void console.error('Error updating general settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update general settings',
        });
      }
    }),

  // Update booking settings
  updateBookingSettings: protectedProcedure
    .input(bookingSettingsSchema)
    .mutation(async ({ input }) => {
      try {
        const settings = await prisma.settings.upsert({
          where: { id: 1 },
          create: {
            generalSettings: {},
            bookingSettings: input,
            emailSettings: {},
            securitySettings: {},
            notificationSettings: {},
          },
          update: {
            bookingSettings: input,
            updatedAt: new Date(),
          },
        });

        return { success: true, settings };
      } catch (error) {
        void console.error('Error updating booking settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update booking settings',
        });
      }
    }),

  // Update email settings
  updateEmailSettings: protectedProcedure.input(emailSettingsSchema).mutation(async ({ input }) => {
    try {
      const settings = await prisma.settings.upsert({
        where: { id: 1 },
        create: {
          generalSettings: {},
          bookingSettings: {},
          emailSettings: input,
          securitySettings: {},
          notificationSettings: {},
        },
        update: {
          emailSettings: input,
          updatedAt: new Date(),
        },
      });

      return { success: true, settings };
    } catch (error) {
      void console.error('Error updating email settings:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update email settings',
      });
    }
  }),

  // Update security settings
  updateSecuritySettings: protectedProcedure
    .input(securitySettingsSchema)
    .mutation(async ({ input }) => {
      try {
        const settings = await prisma.settings.upsert({
          where: { id: 1 },
          create: {
            generalSettings: {},
            bookingSettings: {},
            emailSettings: {},
            securitySettings: input,
            notificationSettings: {},
          },
          update: {
            securitySettings: input,
            updatedAt: new Date(),
          },
        });

        return { success: true, settings };
      } catch (error) {
        void console.error('Error updating security settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update security settings',
        });
      }
    }),

  // Update notification settings
  updateNotificationSettings: protectedProcedure
    .input(notificationSettingsSchema)
    .mutation(async ({ input }) => {
      try {
        const settings = await prisma.settings.upsert({
          where: { id: 1 },
          create: {
            generalSettings: {},
            bookingSettings: {},
            emailSettings: {},
            securitySettings: {},
            notificationSettings: input,
          },
          update: {
            notificationSettings: input,
            updatedAt: new Date(),
          },
        });

        return { success: true, settings };
      } catch (error) {
        void console.error('Error updating notification settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update notification settings',
        });
      }
    }),

  // Send test email
  sendTestEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement actual email sending logic using Resend
        void console.warn('Sending test email to:', input.email);

        // For now, just return success
        return { success: true, message: 'Test email sent successfully' };
      } catch (error) {
        void console.error('Error sending test email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send test email',
        });
      }
    }),

  // Backup database
  backupDatabase: protectedProcedure.mutation(async () => {
    try {
      // TODO: Implement actual database backup logic
      void console.warn('Creating database backup...');

      // For now, just return success
      return { success: true, message: 'Database backup initiated' };
    } catch (error) {
      void console.error('Error creating backup:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create backup',
      });
    }
  }),

  // Clear cache
  clearCache: protectedProcedure.mutation(async () => {
    try {
      // TODO: Implement actual cache clearing logic
      void console.warn('Clearing cache...');

      // For now, just return success
      return { success: true, message: 'Cache cleared successfully' };
    } catch (error) {
      void console.error('Error clearing cache:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to clear cache',
      });
    }
  }),
});
