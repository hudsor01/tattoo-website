/**
 * Settings Router - Refactored Version
 * 
 * This is a refactored version of the settings router that uses proper database persistence
 * via the SettingsService, providing better type safety, error handling, and maintainability.
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '@/lib/trpc/procedures';
import { TRPCError } from '@trpc/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email/email-service';
import { logger } from '@/lib/logger';
import { settingsService } from '@/lib/services/settings-service';
// Settings form types - simplified inline definitions
type GeneralSettingsForm = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  timezone: string;
  logo?: string;
};

type BookingSettingsForm = {
  enableBooking: boolean;
  defaultDuration: number;
  advanceBookingDays: number;
  minNoticeHours: number;
  maxBookingsPerDay: number;
  requireApproval: boolean;
};

type EmailSettingsForm = {
  enableEmailNotifications: boolean;
  adminEmail: string;
  confirmationTemplate: string;
  reminderTemplate: string;
  sendReminders: boolean;
  reminderHours: number;
};

type SecuritySettingsForm = {
  enableTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requirePasswordComplexity: boolean;
};

type NotificationSettingsForm = {
  enablePushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationChannels: string[];
};

// Validation schemas (same as before)
const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name cannot be empty').max(100, 'Site name is too long'),
  siteDescription: z.string().max(500, 'Site description is too long'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().regex(/^\+?[0-9\-() ]{7,20}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  address: z.string().max(300, 'Address is too long'),
  businessHours: z.string().max(500, 'Business hours text is too long'),
  timezone: z.string().regex(/^[A-Za-z_/+-]+$/, 'Invalid timezone format'),
  logoUrl: z.string().url('Logo must be a valid URL').optional().nullable(),
  faviconUrl: z.string().url('Favicon must be a valid URL').optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  googleAnalyticsId: z.string().optional().nullable(),
  facebookPixelId: z.string().optional().nullable(),
}).strict();

const bookingSettingsSchema = z.object({
  bookingEnabled: z.boolean(),
  requireDeposit: z.boolean(),
  depositAmount: z.number().min(0, 'Deposit amount cannot be negative').max(10000, 'Deposit amount is too high'),
  maxAdvanceBookingDays: z.number().int().min(1, 'Must be at least 1 day').max(365, 'Cannot exceed 365 days'),
  minAdvanceBookingHours: z.number().int().min(1, 'Must be at least 1 hour').max(168, 'Cannot exceed 168 hours (1 week)'),
  cancellationHours: z.number().int().min(1, 'Must be at least 1 hour').max(168, 'Cannot exceed 168 hours (1 week)'),
  autoConfirmBookings: z.boolean(),
  sendReminderEmails: z.boolean(),
  reminderHoursBefore: z.number().int().min(1, 'Must be at least 1 hour').max(168, 'Cannot exceed 168 hours (1 week)'),
  slotDuration: z.number().int().min(15, 'Minimum slot is 15 minutes').max(240, 'Maximum slot is 240 minutes (4 hours)').default(60),
  bufferTimeBetweenAppointments: z.number().int().min(0, 'Cannot be negative').max(120, 'Cannot exceed 120 minutes (2 hours)').default(30),
  workingDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),
  workingHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:MM').default('09:00'),
  workingHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:MM').default('17:00'),
}).strict();

const emailSettingsSchema = z.object({
  emailProvider: z.enum(['resend', 'sendgrid', 'smtp']),
  fromName: z.string().min(1, 'From name cannot be empty').max(100, 'From name is too long'),
  fromEmail: z.string().email('Please enter a valid from email address'),
  replyToEmail: z.string().email('Please enter a valid reply-to email address'),
  sendWelcomeEmails: z.boolean(),
  sendBookingConfirmations: z.boolean(),
  sendPaymentConfirmations: z.boolean(),
  sendCancellationNotices: z.boolean(),
  emailTemplateStyle: z.enum(['modern', 'classic', 'minimal']).default('modern'),
  emailFooterText: z.string().max(500, 'Footer text is too long').optional().nullable(),
  emailLogoUrl: z.string().url('Logo must be a valid URL').optional().nullable(),
  smtpHost: z.string().optional().nullable(),
  smtpPort: z.number().int().min(1).max(65535).optional().nullable(),
  smtpUser: z.string().optional().nullable(),
  smtpPassword: z.string().optional().nullable(),
  smtpSecure: z.boolean().optional().nullable(),
}).strict();

const securitySettingsSchema = z.object({
  requireTwoFactor: z.boolean(),
  sessionTimeout: z.number().int().min(1, 'Session timeout must be at least 1 hour').max(720, 'Session timeout cannot exceed 720 hours (30 days)'),
  maxLoginAttempts: z.number().int().min(1, 'Must allow at least 1 attempt').max(20, 'Cannot exceed 20 attempts'),
  lockoutDuration: z.number().int().min(1, 'Lockout must be at least 1 minute').max(1440, 'Lockout cannot exceed 1440 minutes (24 hours)'),
  requireStrongPasswords: z.boolean(),
  passwordMinLength: z.number().int().min(8, 'Password must be at least 8 characters').max(128, 'Password cannot exceed 128 characters').default(12),
  passwordRequireUppercase: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireSymbols: z.boolean().default(true),
  allowApiAccess: z.boolean(),
  logSecurityEvents: z.boolean(),
  ipRateLimit: z.number().int().min(10, 'Rate limit must be at least 10 requests').max(1000, 'Rate limit cannot exceed 1000 requests').default(100),
  ipRateLimitWindowMinutes: z.number().int().min(1, 'Rate limit window must be at least 1 minute').max(1440, 'Rate limit window cannot exceed 1440 minutes (24 hours)').default(15),
}).strict();

const notificationSettingsSchema = z.object({
  newBookingAlerts: z.boolean(),
  paymentAlerts: z.boolean(),
  cancellationAlerts: z.boolean(),
  systemMaintenanceAlerts: z.boolean(),
  errorAlerts: z.boolean(),
  weeklyReports: z.boolean(),
  monthlyReports: z.boolean(),
  notificationEmail: z.string().email('Please enter a valid notification email').optional().nullable(),
  smsNotifications: z.boolean().default(false),
  notificationPhone: z.string().optional().nullable(),
  slackWebhook: z.string().url('Slack webhook must be a valid URL').optional().nullable(),
  discordWebhook: z.string().url('Discord webhook must be a valid URL').optional().nullable(),
  pushNotifications: z.boolean().default(false),
}).strict();

const testEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  template: z.enum(['basic', 'booking', 'payment', 'welcome']).default('basic')
}).strict();

// Type transformation functions to ensure compatibility with exact optional property types
function transformToGeneralSettings(data: z.infer<typeof generalSettingsSchema>): GeneralSettingsForm {
  const result: GeneralSettingsForm = {
    siteName: data.siteName,
    siteDescription: data.siteDescription,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone ?? '',
    address: data.address,
    businessHours: data.businessHours,
    timezone: data.timezone,
    logoUrl: data.logoUrl ?? null,
    faviconUrl: data.faviconUrl ?? null,
    googleAnalyticsId: data.googleAnalyticsId ?? null,
    facebookPixelId: data.facebookPixelId ?? null,
  };
  
  // Only add optional properties if they have values
  if (data.primaryColor !== undefined) {
    result.primaryColor = data.primaryColor;
  }
  if (data.secondaryColor !== undefined) {
    result.secondaryColor = data.secondaryColor;
  }
  
  return result;
}

function transformToBookingSettings(data: z.infer<typeof bookingSettingsSchema>): BookingSettingsForm {
  return {
    bookingEnabled: data.bookingEnabled,
    requireDeposit: data.requireDeposit,
    depositAmount: data.depositAmount,
    maxAdvanceBookingDays: data.maxAdvanceBookingDays,
    minAdvanceBookingHours: data.minAdvanceBookingHours,
    cancellationHours: data.cancellationHours,
    autoConfirmBookings: data.autoConfirmBookings,
    sendReminderEmails: data.sendReminderEmails,
    reminderHoursBefore: data.reminderHoursBefore,
    slotDuration: data.slotDuration,
    bufferTimeBetweenAppointments: data.bufferTimeBetweenAppointments,
    workingDays: data.workingDays,
    workingHoursStart: data.workingHoursStart,
    workingHoursEnd: data.workingHoursEnd,
  };
}

function transformToEmailSettings(data: z.infer<typeof emailSettingsSchema>): EmailSettingsForm {
  return {
    emailProvider: data.emailProvider,
    fromName: data.fromName,
    fromEmail: data.fromEmail,
    replyToEmail: data.replyToEmail,
    sendWelcomeEmails: data.sendWelcomeEmails,
    sendBookingConfirmations: data.sendBookingConfirmations,
    sendPaymentConfirmations: data.sendPaymentConfirmations,
    sendCancellationNotices: data.sendCancellationNotices,
    emailTemplateStyle: data.emailTemplateStyle,
    emailFooterText: data.emailFooterText ?? null,
    emailLogoUrl: data.emailLogoUrl ?? null,
    smtpHost: data.smtpHost ?? null,
    smtpPort: data.smtpPort ?? null,
    smtpUser: data.smtpUser ?? null,
    smtpPassword: data.smtpPassword ?? null,
    smtpSecure: data.smtpSecure ?? null,
  };
}

function transformToSecuritySettings(data: z.infer<typeof securitySettingsSchema>): SecuritySettingsForm {
  return {
    requireTwoFactor: data.requireTwoFactor,
    sessionTimeout: data.sessionTimeout,
    maxLoginAttempts: data.maxLoginAttempts,
    lockoutDuration: data.lockoutDuration,
    requireStrongPasswords: data.requireStrongPasswords,
    passwordMinLength: data.passwordMinLength,
    passwordRequireUppercase: data.passwordRequireUppercase,
    passwordRequireNumbers: data.passwordRequireNumbers,
    passwordRequireSymbols: data.passwordRequireSymbols,
    allowApiAccess: data.allowApiAccess,
    logSecurityEvents: data.logSecurityEvents,
    ipRateLimit: data.ipRateLimit,
    ipRateLimitWindowMinutes: data.ipRateLimitWindowMinutes,
  };
}

function transformToNotificationSettings(data: z.infer<typeof notificationSettingsSchema>): NotificationSettingsForm {
  return {
    newBookingAlerts: data.newBookingAlerts,
    paymentAlerts: data.paymentAlerts,
    cancellationAlerts: data.cancellationAlerts,
    systemMaintenanceAlerts: data.systemMaintenanceAlerts,
    errorAlerts: data.errorAlerts,
    weeklyReports: data.weeklyReports,
    monthlyReports: data.monthlyReports,
    notificationEmail: data.notificationEmail ?? null,
    smsNotifications: data.smsNotifications,
    notificationPhone: data.notificationPhone ?? null,
    slackWebhook: data.slackWebhook ?? null,
    discordWebhook: data.discordWebhook ?? null,
    pushNotifications: data.pushNotifications,
  };
}

/**
 * Enhanced Settings Router using SettingsService
 */
export const settingsRouter = router({
  // Get all settings
  getSettings: protectedProcedure.query(async () => {
    try {
      return await settingsService.getSettings();
    } catch (error) {
      logger.error('Error fetching settings:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch settings',
        cause: error,
      });
    }
  }),

  // Generic update settings endpoint with proper validation
  updateSettings: adminProcedure
    .input(z.object({
      domain: z.enum(['general', 'booking', 'email', 'security', 'notifications']),
      data: z.record(z.unknown())
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID is required for this operation',
          });
        }

        const { domain, data } = input;

        // Validate based on domain
        let validatedData;
        switch (domain) {
          case 'general':
            validatedData = transformToGeneralSettings(generalSettingsSchema.parse(data));
            break;
          case 'booking':
            validatedData = transformToBookingSettings(bookingSettingsSchema.parse(data));
            break;
          case 'email':
            validatedData = transformToEmailSettings(emailSettingsSchema.parse(data));
            break;
          case 'security':
            validatedData = transformToSecuritySettings(securitySettingsSchema.parse(data));
            break;
          case 'notifications':
            validatedData = transformToNotificationSettings(notificationSettingsSchema.parse(data));
            break;
          default:
            throw new Error(`Unknown domain: ${domain}`);
        }

        const result = await settingsService.updateDomainSettings(
          domain,
          validatedData,
          ctx.userId,
          'manual'
        );

        // Revalidate relevant pages
        revalidatePath('/admin/settings');
        revalidatePath('/admin/dashboard');

        return result;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.errors.map(err => 
            `${err.path.join('.')}: ${err.message}`
          ).join(', ');
          
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Validation error: ${errorMessages}`,
            cause: error,
          });
        }
        
        logger.error('Error updating settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update settings',
          cause: error,
        });
      }
    }),

  // Domain-specific update endpoints (for backward compatibility)
  updateGeneralSettings: adminProcedure
    .input(generalSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID is required for this operation',
        });
      }
      const transformedData = transformToGeneralSettings(input);
      return settingsService.updateDomainSettings('general', transformedData, ctx.userId, 'manual');
    }),

  updateBookingSettings: adminProcedure
    .input(bookingSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID is required for this operation',
        });
      }
      const transformedData = transformToBookingSettings(input);
      return settingsService.updateDomainSettings('booking', transformedData, ctx.userId, 'manual');
    }),

  updateEmailSettings: adminProcedure
    .input(emailSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID is required for this operation',
        });
      }
      const transformedData = transformToEmailSettings(input);
      return settingsService.updateDomainSettings('email', transformedData, ctx.userId, 'manual');
    }),

  updateSecuritySettings: adminProcedure
    .input(securitySettingsSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID is required for this operation',
        });
      }
      const transformedData = transformToSecuritySettings(input);
      return settingsService.updateDomainSettings('security', transformedData, ctx.userId, 'manual');
    }),

  updateNotificationSettings: adminProcedure
    .input(notificationSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID is required for this operation',
        });
      }
      const transformedData = transformToNotificationSettings(input);
      return settingsService.updateDomainSettings('notifications', transformedData, ctx.userId, 'manual');
    }),

  // Send test email
  sendTestEmail: adminProcedure
    .input(testEmailSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const settings = await settingsService.getSettings();
        const emailSettings = settings.email;

        // Create test email content based on template
        const { subject, htmlContent, textContent } = generateTestEmailContent(
          input.template, 
          input.email, 
          { general: settings.general }
        );

        const result = await sendEmail({
          to: input.email,
          subject,
          html: htmlContent,
          text: textContent,
          from: emailSettings.fromName ? 
                `${emailSettings.fromName} <${emailSettings.fromEmail}>` : 
                emailSettings.fromEmail
        });

        if (result.success) {
          logger.info('Test email sent successfully:', {
            userId: ctx.userId,
            recipient: input.email,
            template: input.template
          });

          return { 
            success: true, 
            message: 'Test email sent successfully',
            details: {
              recipient: input.email,
              subject,
              template: input.template,
              sentAt: new Date().toISOString(),
              emailProvider: emailSettings.emailProvider
            }
          };
        } else {
          const errorMessage = result.error instanceof Error 
            ? result.error.message 
            : typeof result.error === 'string' 
              ? result.error 
              : 'Failed to send email';
          throw new Error(errorMessage);
        }
      } catch (error) {
        logger.error('Error sending test email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send test email',
          cause: error,
        });
      }
    }),

  // Settings management
  createBackup: adminProcedure
    .input(z.object({
      name: z.string().min(1, 'Backup name is required'),
      description: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID is required for this operation',
          });
        }

        const backupId = await settingsService.createBackup(
          input.name,
          input.description ?? null,
          ctx.userId
        );

        return {
          success: true,
          message: 'Settings backup created successfully',
          backupId
        };
      } catch (error) {
        logger.error('Error creating settings backup:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create settings backup',
          cause: error,
        });
      }
    }),

  restoreBackup: adminProcedure
    .input(z.object({
      backupId: z.string(),
      confirmRestore: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!input.confirmRestore) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Restore confirmation required',
        });
      }

      try {
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID is required for this operation',
          });
        }

        await settingsService.restoreFromBackup(input.backupId, ctx.userId);

        // Revalidate all settings-related pages
        revalidatePath('/admin/settings');
        revalidatePath('/admin/dashboard');

        return {
          success: true,
          message: 'Settings restored successfully from backup'
        };
      } catch (error) {
        logger.error('Error restoring settings backup:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to restore settings from backup',
          cause: error,
        });
      }
    }),

  resetToDefaults: adminProcedure
    .input(z.object({
      domains: z.array(z.enum(['general', 'booking', 'email', 'security', 'notifications'])),
      confirmReset: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!input.confirmReset) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Reset confirmation required',
        });
}

      try {
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID is required for this operation',
          });
        }

        await settingsService.resetToDefaults(input.domains, ctx.userId);

        revalidatePath('/admin/settings');
        revalidatePath('/admin/dashboard');

        return {
          success: true,
          message: `Reset ${input.domains.length} setting domains to defaults`
        };
      } catch (error) {
        logger.error('Error resetting settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset settings to defaults',
          cause: error,
        });
      }
    }),

  getSettingsHistory: adminProcedure
    .input(z.object({
      domain: z.enum(['general', 'booking', 'email', 'security', 'notifications']).optional(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ input }) => {
      try {
        return await settingsService.getSettingsHistory(input.domain, input.limit);
      } catch (error) {
        logger.error('Error fetching settings history:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch settings history',
          cause: error,
        });
}
    }),

  // Simplified system operations
  clearCache: adminProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID is required for this operation',
        });
}      const criticalPaths = [
        '/admin/settings', '/admin/dashboard', '/'
];


      criticalPaths.forEach(path => {
        try {
          revalidatePath(path);
        } catch (error) {
          logger.warn(`Failed to revalidate path ${path}:`, error);
        }
      });

      logger.info('Cache cleared successfully:', {
        userId: ctx.userId,
        timestamp: new Date().toISOString()
      });

      return { 
        success: true, 
        message: 'Cache cleared successfully',
        details: {
          pathsCleared: criticalPaths.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Cache clearing operation failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to clear cache',
        cause: error,
      });
    }
  }),
});

/**
 * Helper function to generate test email content
 */
function generateTestEmailContent(
  template: string, 
  email: string, 
  settings: { general: { siteName?: string } }
): { subject: string; htmlContent: string; textContent: string } {
  const siteName = settings.general.siteName ?? 'Ink 37 Tattoos';

  switch (template) {
    case 'booking':
      return {
        subject: `Test: Booking Confirmation - ${siteName}`,
        htmlContent: `
          <h2>Booking Confirmation Test</h2>
          <p>This is a test booking confirmation email from ${siteName}.</p>
          <p>Test sent to: ${email}</p>
        `,
        textContent: `Booking Confirmation Test\n\nThis is a test booking confirmation email from ${siteName}.\nTest sent to: ${email}`
      };
    case 'payment':
      return {
        subject: `Test: Payment Confirmation - ${siteName}`,
        htmlContent: `
          <h2>Payment Confirmation Test</h2>
          <p>This is a test payment confirmation email from ${siteName}.</p>
          <p>Test sent to: ${email}</p>
        `,
        textContent: `Payment Confirmation Test\n\nThis is a test payment confirmation email from ${siteName}.\nTest sent to: ${email}`
      };
    case 'welcome':
      return {
        subject: `Test: Welcome to ${siteName}`,
        htmlContent: `
          <h2>Welcome Test</h2>
          <p>This is a test welcome email from ${siteName}.</p>
          <p>Test sent to: ${email}</p>
        `,
        textContent: `Welcome Test\n\nThis is a test welcome email from ${siteName}.\nTest sent to: ${email}`
      };
    default:
      return {
        subject: `Test Email from ${siteName}`,
        htmlContent: `
          <h2>Test Email</h2>
          <p>This is a test email from ${siteName}.</p>
          <p>If you received this, your email configuration is working correctly.</p>
          <p>Test sent to: ${email}</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
        textContent: `Test Email\n\nThis is a test email from ${siteName}.\nIf you received this, your email configuration is working correctly.\nTest sent to: ${email}\nTimestamp: ${new Date().toISOString()}`
      };
  }
}
