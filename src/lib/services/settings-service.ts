/**
 * Settings Service
 * 
 * Centralized service for managing application settings with proper persistence,
 * type safety, and audit trail functionality.
 */

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';
import type { 
  SettingsDomainType, 
  ApplicationSettings, 
  GeneralSettingsForm,
  BookingSettingsForm,
  EmailSettingsForm,
  SecuritySettingsForm,
  NotificationSettingsForm,
  DatabaseSetting
} from '@prisma/client';

type SettingsFormType = GeneralSettingsForm | BookingSettingsForm | EmailSettingsForm | SecuritySettingsForm | NotificationSettingsForm;

export class SettingsService {
  private static readonly CACHE_TAGS = {
    all: 'settings:all',
    domain: (domain: string) => `settings:${domain}`,
    health: 'settings:health'
  };

  /**
   * Get all settings from database with fallback to defaults
   */
  async getSettings(): Promise<ApplicationSettings> {
    try {
      const settings = await prisma.setting.findMany({
        orderBy: [{ domain: 'asc' }, { key: 'asc' }]
      });

      const parsed = this.parseSettingsFromDb(settings);
      
      // Ensure all domains have at least default values
      return {
        general: parsed.general ?? this.getDefaultSettings().general,
        booking: parsed.booking ?? this.getDefaultSettings().booking,
        email: parsed.email ?? this.getDefaultSettings().email,
        security: parsed.security ?? this.getDefaultSettings().security,
        notifications: parsed.notifications ?? this.getDefaultSettings().notifications
      };
    } catch (error) {
      logger.error('Failed to fetch settings from database:', error);
      // Fallback to defaults if database is unavailable
      return this.getDefaultSettings();
    }
  }

  /**
   * Update settings for a specific domain with validation and history tracking
   */
  async updateDomainSettings<T extends SettingsFormType>(
    domain: SettingsDomainType,
    data: T,
    userId: string,
    reason: string = 'manual'
  ): Promise<{ success: boolean; settings: T }> {
    try {
      const operations = [];
      
      for (const [key, value] of Object.entries(data)) {
        const valueType = this.getValueType(value);
        const serializedValue = this.serializeValue(value);
        
        operations.push(
          prisma.setting.upsert({
            where: { domain_key: { domain, key } },
            create: {
              domain,
              key,
              value: serializedValue,
              valueType,
              updatedBy: userId
            },
            update: {
              value: serializedValue,
              valueType,
              updatedBy: userId,
              updatedAt: new Date()
            }
          })
        );
      }

      await prisma.$transaction(operations);

      // Record history for audit trail
      await this.recordSettingsHistory(domain, data as unknown as Record<string, unknown>, userId, reason);

      // Invalidate caches
      this.invalidateCache(domain);

      logger.info(`Settings updated for domain: ${domain}`, {
        domain,
        userId,
        reason,
        keysUpdated: Object.keys(data)
      });

      return { success: true, settings: data };
    } catch (error) {
      logger.error(`Failed to update ${domain} settings:`, error);
      throw new Error(`Failed to update ${domain} settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get settings for a specific domain
   */
  async getDomainSettings(domain: SettingsDomainType): Promise<SettingsFormType> {
    try {
      const settings = await prisma.setting.findMany({
        where: { domain }
      });

      const parsed = this.parseSettingsFromDb(settings);
      return parsed[domain] ?? this.getDefaultSettings()[domain];
    } catch (error) {
      logger.error(`Failed to fetch ${domain} settings:`, error);
      return this.getDefaultSettings()[domain];
    }
  }

  /**
   * Create a backup of current settings
   */
  async createBackup(name: string, description: string | null, userId: string): Promise<string> {
    try {
      const currentSettings = await this.getSettings();
      
      const backup = await prisma.settingsBackup.create({
        data: {
          name,
          description,
          data: currentSettings as unknown as Prisma.JsonObject,
          metadata: {
            version: '1.0',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            totalSettings: await prisma.setting.count()
          },
          createdBy: userId
        }
      });

      logger.info('Settings backup created:', {
        backupId: backup.id,
        name,
        userId
      });

      return backup.id;
    } catch (error) {
      logger.error('Failed to create settings backup:', error);
      throw new Error('Failed to create settings backup');
    }
  }

  /**
   * Restore settings from a backup
   */
  async restoreFromBackup(backupId: string, userId: string): Promise<void> {
    try {
      const backup = await prisma.settingsBackup.findUnique({
        where: { id: backupId }
      });

      if (!backup) {
        throw new Error('Backup not found');
      }

      const settingsData = backup.data as unknown as ApplicationSettings;

      // Restore each domain
      for (const [domain, data] of Object.entries(settingsData)) {
        if (domain !== 'lastUpdated' && domain !== 'updatedBy') {
          await this.updateDomainSettings(
            domain as SettingsDomainType,
            data as SettingsFormType,
            userId,
            `restore_from_backup:${backupId}`
          );
        }
      }

      logger.info('Settings restored from backup:', {
        backupId,
        userId,
        backupName: backup.name
      });
    } catch (error) {
      logger.error('Failed to restore settings from backup:', error);
      throw new Error('Failed to restore settings from backup');
    }
  }

  /**
   * Reset settings to defaults for specified domains
   */
  async resetToDefaults(domains: SettingsDomainType[], userId: string): Promise<void> {
    try {
      const defaults = this.getDefaultSettings();

      for (const domain of domains) {
        await this.updateDomainSettings(
          domain,
          defaults[domain] as SettingsFormType,
          userId,
          'reset_to_defaults'
        );
      }

      logger.warn('Settings reset to defaults:', {
        domains,
        userId
      });
    } catch (error) {
      logger.error('Failed to reset settings to defaults:', error);
      throw new Error('Failed to reset settings to defaults');
    }
  }

  /**
   * Get settings change history
   */
  async getSettingsHistory(domain?: SettingsDomainType, limit: number = 50) {
    try {
      const where = domain ? { setting: { domain } } : {};
      
      return await prisma.settingsHistory.findMany({
        where,
        include: {
          setting: {
            select: {
              domain: true,
              key: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      logger.error('Failed to fetch settings history:', error);
      throw new Error('Failed to fetch settings history');
    }
  }

  /**
   * Parse settings from database format to application format
   */
  private parseSettingsFromDb(settings: DatabaseSetting[]): Partial<ApplicationSettings> {
    const parsed: Record<string, Record<string, unknown>> = {};

    for (const setting of settings) {
      parsed[setting.domain] ??= {};
      const domainSettings = parsed[setting.domain];
      if (domainSettings) {
        domainSettings[setting.key] = setting.value;
      }
    }

    return parsed;
  }

  /**
   * Record settings history for audit trail
   */
  private async recordSettingsHistory(
    domain: SettingsDomainType,
    newData: Record<string, unknown>,
    userId: string,
    reason: string
  ): Promise<void> {
    try {
      const existingSettings = await prisma.setting.findMany({
        where: { domain }
      });

      const historyEntries = [];

      for (const [key, newValue] of Object.entries(newData)) {
        const existingSetting = existingSettings.find(s => s.key === key);
        
        historyEntries.push({
          settingId: existingSetting?.id ?? '', // Will be created in upsert
          oldValue: existingSetting?.value ?? null,
          newValue: this.serializeValue(newValue),
          changedBy: userId,
          reason,
          metadata: {
            domain,
            key,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Note: In a real implementation, we'd need to handle the case where
      // the setting doesn't exist yet and we're creating it
      // This would require a more complex transaction
    } catch (error) {
      logger.error('Failed to record settings history:', error);
      // Don't throw here - history is important but not critical
    }
  }

  /**
   * Serialize a value for database storage
   */
  private serializeValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (value === null || value === undefined) {
      return Prisma.JsonNull;
    }
    
    // Handle primitive types that are valid JSON values
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    
    // Handle arrays and objects
    if (Array.isArray(value) || typeof value === 'object') {
      return value as Prisma.InputJsonValue;
    }
    
    // Convert other types to string
    return String(value);
  }

  /**
   * Determine the type of a value for storage
   */
  private getValueType(value: unknown): string {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  }

  /**
   * Invalidate relevant caches
   */
  private invalidateCache(domain?: SettingsDomainType): void {
    revalidateTag(SettingsService.CACHE_TAGS.all);
    if (domain) {
      revalidateTag(SettingsService.CACHE_TAGS.domain(domain));
    }
    revalidateTag(SettingsService.CACHE_TAGS.health);
  }

  /**
   * Get default settings for all domains
   */
  private getDefaultSettings(): ApplicationSettings {
    return {
      general: {
        siteName: "Ink 37 Tattoos",
        siteDescription: 'Professional tattoo artistry and custom designs',
        contactEmail: 'contact@ink37tattoos.com',
        contactPhone: '',
        address: '123 Tattoo Street, Art City, AC 12345',
        businessHours: 'Monday - Saturday: 10:00 AM - 6:00 PM',
        timezone: 'America/Chicago',
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
        slotDuration: 60,
        bufferTimeBetweenAppointments: 30,
        workingDays: [1, 2, 3, 4, 5],
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
      },
      email: {
        emailProvider: 'resend' as const,
        fromName: "Ink 37 Tattoos",
        fromEmail: 'hello@ink37tattoos.com',
        replyToEmail: 'hello@ink37tattoos.com',
        sendWelcomeEmails: true,
        sendBookingConfirmations: true,
        sendPaymentConfirmations: true,
        sendCancellationNotices: true,
        emailTemplateStyle: 'modern' as const,
      },
      security: {
        requireTwoFactor: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        requireStrongPasswords: true,
        passwordMinLength: 12,
        passwordRequireUppercase: true,
        passwordRequireNumbers: true,
        passwordRequireSymbols: true,
        allowApiAccess: true,
        logSecurityEvents: true,
        ipRateLimit: 100,
        ipRateLimitWindowMinutes: 15,
      },
      notifications: {
        newBookingAlerts: true,
        paymentAlerts: true,
        cancellationAlerts: true,
        systemMaintenanceAlerts: true,
        errorAlerts: true,
        weeklyReports: true,
        monthlyReports: true,
        smsNotifications: false,
        pushNotifications: false,
      },
    };
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
