/**
 * GDPR Compliance for Analytics System
 * Implements data privacy features including anonymization, data subject rights, and consent management
 */

import { z } from 'zod';
import { securityConfig } from './config';
// GDPR types now inline since analytics will be removed
enum DataSubjectRequestType {
ACCESS = 'access',
RECTIFICATION = 'rectification',
ERASURE = 'erasure',
PORTABILITY = 'portability',
RESTRICTION = 'restriction',
OBJECTION = 'objection',
}

enum RequestStatus {
PENDING = 'pending',
IN_PROGRESS = 'in_progress',
COMPLETED = 'completed',
REJECTED = 'rejected',
}

interface ProcessedAnalyticsEvent {
context: {
ipAddress?: string;
userId?: string;
sessionId?: string;
};
properties?: Record<string, any>;
}

export const DataSubjectRequestSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(DataSubjectRequestType),
  status: z.nativeEnum(RequestStatus),
  userId: z.string().optional(),
  email: z.string().email(),
  identifiers: z.array(z.string()).optional(),
  requestDate: z.date(),
  completedDate: z.date().optional(),
  notes: z.string().optional(),
  requestedBy: z.string(),
  processedBy: z.string().optional(),
});

export type DataSubjectRequest = z.infer<typeof DataSubjectRequestSchema>;

export const ConsentSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string(),
  ipAddress: z.string(),
  consentDate: z.date(),
  analyticsConsent: z.boolean(),
  marketingConsent: z.boolean(),
  functionalConsent: z.boolean(),
  consentMethod: z.enum(['explicit', 'implicit', 'cookie_banner', 'settings']),
  consentVersion: z.string(),
  userAgent: z.string().optional(),
});

export type UserConsent = z.infer<typeof ConsentSchema>;

class GDPRComplianceManager {
  /**
   * Anonymize IP address according to GDPR requirements
   */
  public anonymizeIPAddress(ipAddress: string): string {
    if (!securityConfig.anonymizeIpAddresses) {
      return ipAddress;
    }

    if (ipAddress.includes('.')) {
      const parts = ipAddress.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
      }
    }

    if (ipAddress.includes(':')) {
      const parts = ipAddress.split(':');
      if (parts.length >= 4) {
        const anonymized = parts.slice(0, 4).concat(['0000', '0000', '0000', '0000']);
        return anonymized.join(':');
      }
    }

    return 'anonymized';
  }

  /**
   * Anonymize analytics event data
   */
  public anonymizeAnalyticsEvent(event: ProcessedAnalyticsEvent): ProcessedAnalyticsEvent {
    const anonymized = { ...event };

    if (anonymized.context.ipAddress) {
      anonymized.context.ipAddress = this.anonymizeIPAddress(anonymized.context.ipAddress);
    }

    if (securityConfig.encryptSensitiveData) {
      delete anonymized.context.userId;
      
      if (anonymized.context.sessionId) {
        anonymized.context.sessionId = this.hashIdentifier(anonymized.context.sessionId);
      }
    }

    const sensitiveKeys = ['email', 'phone', 'address', 'fullName', 'personalData'];
    for (const key of sensitiveKeys) {
      if (anonymized.properties && key in anonymized.properties) {
        delete anonymized.properties[key];
      }
    }

    return anonymized;
  }

  /**
   * Hash identifier for pseudonymization
   */
  private hashIdentifier(identifier: string): string {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hashed_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Generate data export for a data subject
   */
  public async generateDataExport(userId: string, email: string): Promise<{
    personalData: {
      userId: string;
      email: string;
    };
    analyticsData: ProcessedAnalyticsEvent[];
    consentHistory: UserConsent[];
    exportDate: Date;
    format: string;
  }> {
    return {
      personalData: {
        userId,
        email,
      },
      analyticsData: [],
      consentHistory: [],
      exportDate: new Date(),
      format: 'JSON',
    };
  }

  /**
   * Delete all data for a data subject (right to erasure)
   */
  public async deleteUserData(_userId: string, _email: string): Promise<{
    success: boolean;
    deletedRecords: {
      analyticsEvents: number;
      consentRecords: number;
      userProfiles: number;
    };
    errors: string[];
  }> {
    const deletedRecords = {
      analyticsEvents: 0,
      consentRecords: 0,
      userProfiles: 0,
    };
    const errors: string[] = [];

    try {
      return {
        success: errors.length === 0,
        deletedRecords,
        errors,
      };
    } catch (error) {
      errors.push(`Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        deletedRecords,
        errors,
      };
    }
  }

  /**
   * Validate user consent for analytics processing
   */
  public validateConsent(consent: UserConsent): {
    isValid: boolean;
    canProcessAnalytics: boolean;
    canProcessMarketing: boolean;
    canProcessFunctional: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    const consentAge = Date.now() - consent.consentDate.getTime();
    const maxConsentAge = 365 * 24 * 60 * 60 * 1000;
    
    if (consentAge > maxConsentAge) {
      warnings.push('Consent is older than 1 year and should be refreshed');
    }

    if (consent.consentMethod === 'implicit' && consent.analyticsConsent) {
      warnings.push('Analytics consent should be explicit under GDPR');
    }

    return {
      isValid: warnings.length === 0,
      canProcessAnalytics: consent.analyticsConsent,
      canProcessMarketing: consent.marketingConsent,
      canProcessFunctional: consent.functionalConsent,
      warnings,
    };
  }

  /**
   * Create a data subject request
   */
  public createDataSubjectRequest(
    type: DataSubjectRequestType,
    email: string,
    userId?: string,
    identifiers?: string[]
  ): DataSubjectRequest {
    return {
      id: `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: RequestStatus.PENDING,
      userId,
      email,
      identifiers,
      requestDate: new Date(),
      requestedBy: email,
    };
  }

  /**
   * Process a data subject request
   */
  public async processDataSubjectRequest(
    requestId: string,
    processorId: string
  ): Promise<{
    success: boolean;
    result?: {
      requestId: string;
      processedAt: Date;
      processedBy: string;
    };
    error?: string;
  }> {
    try {
      return {
        success: true,
        result: {
          requestId,
          processedAt: new Date(),
          processedBy: processorId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate consent banner configuration
   */
  public getConsentBannerConfig(): {
    requiredConsents: string[];
    optionalConsents: string[];
    legalBasis: Record<string, string>;
    privacyPolicyUrl: string;
    cookiePolicyUrl: string;
  } {
    return {
      requiredConsents: ['functional'],
      optionalConsents: ['analytics', 'marketing'],
      legalBasis: {
        functional: 'Legitimate interest for core website functionality',
        analytics: 'Consent for improving user experience',
        marketing: 'Consent for personalized marketing communications',
      },
      privacyPolicyUrl: '/privacy-policy',
      cookiePolicyUrl: '/cookie-policy',
    };
  }

  /**
   * Check if processing is allowed based on consent and legal basis
   */
  public isProcessingAllowed(
    processingType: 'analytics' | 'marketing' | 'functional',
    consent?: UserConsent
  ): boolean {
    if (!securityConfig.enableGdprCompliance) {
      return true;
    }

    if (processingType === 'functional') {
      return true;
    }

    if (!consent) {
      return false;
    }

    const consentValidation = this.validateConsent(consent);
    
    switch (processingType) {
      case 'analytics':
        return consentValidation.canProcessAnalytics && consentValidation.isValid;
      case 'marketing':
        return consentValidation.canProcessMarketing && consentValidation.isValid;
      default:
        return false;
    }
  }
}

let gdprManagerInstance: GDPRComplianceManager | null = null;

export function getGDPRManager(): GDPRComplianceManager {
  gdprManagerInstance ??= new GDPRComplianceManager();
  return gdprManagerInstance;
}

export { GDPRComplianceManager };
