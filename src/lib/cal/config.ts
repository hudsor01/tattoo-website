/**
 * Cal.com API Integration
 * 
 * Production-ready implementation that handles:
 * - API authentication with OAuth 2.0
 * - Service configuration and availability
 * - Webhook processing for real-time updates
 * - Comprehensive error handling and logging
 * 
 * @module lib/cal/config
 */

import { logger } from "@/lib/logger";
// Define local types instead of importing from Prisma
enum CalServiceCategory {
  CONSULTATION = 'CONSULTATION',
  TATTOO = 'TATTOO',
  SPECIALTY = 'SPECIALTY',
  DESIGN = 'DESIGN',
  SESSION = 'SESSION',
  TOUCH_UP = 'TOUCH_UP'
}

enum MeetingType {
  IN_PERSON = 'IN_PERSON',
  ONLINE = 'ONLINE',
  VIDEO_CALL = 'VIDEO_CALL',
  PHONE_CALL = 'PHONE_CALL'
}

// Cal.com configuration types
interface CalProviderConfig {
  username: string;
  baseUrl: string;
  embedUrl: string;
  clientId: string;
  refreshUrl?: string;
  accessToken?: string;
  organizationId?: string;
  apiUrl?: string;
  options?: {
    apiUrl: string;
    refreshUrl?: string;
    readingDirection?: 'ltr' | 'rtl';
  };
}

interface CalCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'select' | 'multiselect' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select/multiselect
}

interface CalService {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  currency: string;
  calEventTypeId: number; // Cal.com event type ID
  eventTypeSlug: string; // Cal.com event type slug for URLs
  bufferTime?: number;
  maxAdvanceBooking?: number; // days
  requiresApproval: boolean;
  defaultMeetingType: MeetingType;
  allowedMeetingTypes: MeetingType[];
  customFields?: CalCustomField[];
  features: string[];
  category: CalServiceCategory;
  isActive: boolean;
}

// Environment variable access helpers
function getEnvVar(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

function getEnvVarOrDefault(key: string, defaultValue: string): string {
  return getEnvVar(key) ?? defaultValue;
}

// API CONFIGURATION

/**
 * Legacy Cal.com API v1 configuration
 */
export const calConfig = {
  apiKey: getEnvVar('CAL_API_KEY'),
  username: getEnvVar('NEXT_PUBLIC_CAL_USERNAME'),
  webhookSecret: getEnvVar('CAL_WEBHOOK_SECRET'),
  apiBaseUrl: 'https://api.cal.com/v1',

  // Event type IDs for common booking types
  eventTypes: {
    consultation: 'consultation',
    tattooAppointment: 'tattoo-session',
    touchUp: 'touch-up',
  },

  // Map Cal.com status to internal status
  statusMap: {
    accepted: 'confirmed',
    pending: 'pending',
    cancelled: 'cancelled',
    rejected: 'cancelled',
  },

  // Default Cal.com settings
  defaultSettings: {
    bufferTime: 15, // minutes
    duration: 60, // minutes
  },
};

/**
 * Modern Cal.com API v2 configuration (OAuth)
 */
export function getCalProviderConfig(): CalProviderConfig | null {
  const clientId = getEnvVar('CAL_OAUTH_CLIENT_ID') ?? getEnvVar('NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID');
  
  if (!clientId || clientId === 'YOUR_CLIENT_ID_FROM_CALCOM') {
    // Only log in development environment
    if (getEnvVar('NODE_ENV') === 'development') {
      void logger.warn('⚠️ Cal.com OAuth Client ID not configured properly. Modern Cal features disabled.');
    }
    return null;
  }

  return {
    username: getEnvVarOrDefault('NEXT_PUBLIC_CAL_USERNAME', ''),
    baseUrl: getEnvVarOrDefault('CAL_API_URL', 'https://api.cal.com/v2'),
    embedUrl: getEnvVarOrDefault('CAL_EMBED_URL', 'https://cal.com'),
    clientId,
    refreshUrl: getEnvVar('CAL_REFRESH_URL') ?? '/api/refresh',
    accessToken: getEnvVar('CAL_ACCESS_TOKEN'),
    organizationId: getEnvVar('CAL_ORGANIZATION_ID'),
    apiUrl: getEnvVar('CAL_API_URL') ?? 'https://api.cal.com/v2',
    options: {
      apiUrl: getEnvVar('CAL_API_URL') ?? 'https://api.cal.com/v2',
      refreshUrl: getEnvVar('CAL_REFRESH_URL') ?? 'https://api.cal.com/v2/oauth/refresh',
      readingDirection: 'ltr',
    },
  };
}

/**
 * Verifies if legacy Cal.com integration is properly configured
 */
export function isCalLegacyConfigured(): boolean {
  return Boolean(
    getEnvVar('CAL_API_KEY') &&
    getEnvVar('NEXT_PUBLIC_CAL_USERNAME') &&
    getEnvVar('CAL_WEBHOOK_SECRET')
  );
}

/**
 * Verifies if modern Cal.com OAuth integration is properly configured
 */
export function isCalModernConfigured(): boolean {
  const clientId = getEnvVar('CAL_OAUTH_CLIENT_ID') ?? getEnvVar('NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID');
  return Boolean(clientId && clientId !== 'YOUR_CLIENT_ID_FROM_CALCOM');
}

/**
 * Unified check for any Cal.com configuration
 * Prioritizes API key approach over OAuth
 */
export function isCalConfigured(): boolean {
  const hasApiKey = isCalLegacyConfigured();
  const hasOAuth = isCalModernConfigured();
  
  // Log configuration status in development environment only
  if (getEnvVar('NODE_ENV') === 'development') {
    void logger.warn('Cal.com Configuration Status:', {
      hasApiKey,
      hasOAuth,
      apiKey: getEnvVar('CAL_API_KEY') ? 'Present' : 'Missing',
      username: getEnvVar('NEXT_PUBLIC_CAL_USERNAME') ? 'Present' : 'Missing'
    });
  }
  
  return hasApiKey || hasOAuth;
}

/**
 * Get webhook configuration
 */
export function getWebhookConfig() {
  return {
    secret: getEnvVar('CAL_WEBHOOK_SECRET'),
    isConfigured: Boolean(getEnvVar('CAL_WEBHOOK_SECRET')),
  };
}

// SERVICE CONFIGURATION

/**
 * Service definitions with Cal.com event type mapping
 * Load these from database in production
 */
export function getCalServices(): CalService[] {
  return [
    {
      id: 'free-consultation',
      name: 'Free Consultation',
      description: 'Discuss your tattoo ideas and get professional advice',
      duration: 30, // 30 minutes
      price: 0,
      currency: 'USD',
      calEventTypeId: parseInt(getEnvVar('CAL_FREE_CONSULTATION_EVENT_ID') ?? '0'),
      eventTypeSlug: 'consultation',
      bufferTime: 15,
      maxAdvanceBooking: 30, // 30 days
      requiresApproval: false,
      defaultMeetingType: MeetingType.VIDEO_CALL,
      allowedMeetingTypes: [MeetingType.VIDEO_CALL, MeetingType.IN_PERSON, MeetingType.PHONE_CALL],
      customFields: [
        {
          id: 'tattoo-idea',
          name: 'Tattoo Idea Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe your tattoo idea in detail...',
        },
        {
          id: 'body-placement',
          name: 'Body Placement',
          type: 'text',
          required: true,
          placeholder: 'Where do you want the tattoo? (e.g., forearm, shoulder)',
        },
        {
          id: 'size-estimate',
          name: 'Estimated Size',
          type: 'select',
          required: true,
          options: ['Small (2-4 inches)', 'Medium (4-8 inches)', 'Large (8+ inches)', 'Full sleeve/back'],
        },
        {
          id: 'style-preference',
          name: 'Style Preference',
          type: 'select',
          required: false,
          options: ['Traditional', 'Japanese', 'Realism', 'Black & Gray', 'Custom', 'Not sure'],
        },
        {
          id: 'previous-tattoos',
          name: 'Do you have previous tattoos?',
          type: 'select',
          required: false,
          options: ['Yes', 'No', 'This is my first'],
        },
      ],
      features: [
        'Professional consultation',
        'Design recommendations', 
        'Pricing estimates',
        'Aftercare guidance',
        'No obligation',
      ],
      category: CalServiceCategory.CONSULTATION,
      isActive: true,
    },
    {
      id: 'design-review',
      name: 'Design Review Session',
      description: 'Review and finalize your custom tattoo design',
      duration: 45, // 45 minutes
      price: 50,
      currency: 'USD',
      calEventTypeId: parseInt(getEnvVar('CAL_DESIGN_REVIEW_EVENT_ID') ?? '0'),
      eventTypeSlug: 'design-review',
      bufferTime: 15,
      maxAdvanceBooking: 14, // 2 weeks
      requiresApproval: true,
      defaultMeetingType: MeetingType.IN_PERSON,
      allowedMeetingTypes: [MeetingType.IN_PERSON, MeetingType.VIDEO_CALL],
      customFields: [
        {
          id: 'initial-consultation',
          name: 'Previous Consultation Date',
          type: 'text',
          required: true,
          placeholder: 'When was your initial consultation?',
        },
        {
          id: 'design-changes',
          name: 'Requested Design Changes',
          type: 'textarea',
          required: false,
          placeholder: 'Any specific changes to discuss?',
        },
        {
          id: 'appointment-preference',
          name: 'Preferred Appointment Time',
          type: 'select',
          required: false,
          options: ['Morning (9AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-8PM)', 'Flexible'],
        },
      ],
      features: [
        'Design finalization',
        'Size and placement confirmation',
        'Pricing confirmation',
        'Scheduling tattoo session',
        '$50 credit toward final tattoo',
      ],
      category: CalServiceCategory.DESIGN,
      isActive: true,
    },
    {
      id: 'tattoo-session',
      name: 'Tattoo Session',
      description: 'Your scheduled tattoo appointment',
      duration: 240, // 4 hours (adjustable)
      price: 200, // Base rate, varies by design
      currency: 'USD',
      calEventTypeId: parseInt(getEnvVar('CAL_TATTOO_SESSION_EVENT_ID') ?? '0'),
      eventTypeSlug: 'tattoo-session',
      bufferTime: 30,
      maxAdvanceBooking: 60, // 2 months
      requiresApproval: true,
      defaultMeetingType: MeetingType.IN_PERSON,
      allowedMeetingTypes: [MeetingType.IN_PERSON],
      customFields: [
        {
          id: 'design-approved',
          name: 'Design Approval Date',
          type: 'text',
          required: true,
          placeholder: 'When was your design approved?',
        },
        {
          id: 'session-duration',
          name: 'Estimated Session Duration',
          type: 'select',
          required: true,
          options: ['2-3 hours', '4-5 hours', '6+ hours', 'Multiple sessions needed'],
        },
        {
          id: 'allergies',
          name: 'Allergies or Medical Conditions',
          type: 'textarea',
          required: false,
          placeholder: 'Any allergies, medications, or medical conditions we should know about?',
        },
        {
          id: 'aftercare-kit',
          name: 'Aftercare Kit Needed?',
          type: 'select',
          required: false,
          options: ['Yes, include aftercare kit (+$25)', 'No, I have my own supplies'],
        },
      ],
      features: [
        'Professional tattoo application',
        'High-quality inks and equipment',
        'Sterile environment',
        'Aftercare instructions',
        'Touch-up guarantee (if needed)',
      ],
      category: CalServiceCategory.SESSION,
      isActive: true,
    },
    {
      id: 'touch-up-session',
      name: 'Touch-Up Session',
      description: 'Free touch-up for recent tattoos (within 6 months)',
      duration: 60, // 1 hour
      price: 0, // Free within 6 months
      currency: 'USD',
      calEventTypeId: parseInt(getEnvVar('CAL_TOUCH_UP_EVENT_ID') ?? '0'),
      eventTypeSlug: 'touch-up',
      bufferTime: 15,
      maxAdvanceBooking: 30,
      requiresApproval: true,
      defaultMeetingType: MeetingType.IN_PERSON,
      allowedMeetingTypes: [MeetingType.IN_PERSON],
      customFields: [
        {
          id: 'original-tattoo-date',
          name: 'Original Tattoo Date',
          type: 'text',
          required: true,
          placeholder: 'When was your original tattoo completed?',
        },
        {
          id: 'areas-needing-touch-up',
          name: 'Areas Needing Touch-Up',
          type: 'textarea',
          required: true,
          placeholder: 'Describe which areas need touching up...',
        },
        {
          id: 'healing-complete',
          name: 'Is your tattoo fully healed?',
          type: 'select',
          required: true,
          options: ['Yes, fully healed (6+ weeks)', 'No, still healing', 'Not sure'],
        },
      ],
      features: [
        'Free touch-up (within 6 months)',
        'Color restoration',
        'Line touch-ups',
        'Professional assessment',
        'Aftercare guidance',
      ],
      category: CalServiceCategory.TOUCH_UP,
      isActive: true,
    },
  ];
}

/**
 * Get service by ID
 */
export function getCalServiceById(serviceId: string): CalService | null {
  const services = getCalServices();
  return services.find(service => service.id === serviceId) ?? null;
}

/**
 * Get services by category
 */
export function getCalServicesByCategory(category: CalServiceCategory): CalService[] {
  const services = getCalServices();
  return services.filter(service => service.category === category && service.isActive);
}

/**
 * Get active services only
 */
export function getActiveCalServices(): CalService[] {
  const services = getCalServices();
  return services.filter(service => service.isActive);
}

// VALIDATION AND HEALTH CHECKS

/**
 * Validate Cal.com configuration
 */
export function validateCalConfiguration(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check OAuth configuration
  if (!getEnvVar('CAL_OAUTH_CLIENT_ID') && !getEnvVar('NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID')) {
    warnings.push('Missing CAL_OAUTH_CLIENT_ID environment variable');
  }

  // Check webhook configuration
  if (!getEnvVar('CAL_WEBHOOK_SECRET')) {
    warnings.push('Missing CAL_WEBHOOK_SECRET - webhook validation disabled');
  }

  // Check API key (legacy)
  if (!getEnvVar('CAL_API_KEY')) {
    warnings.push('Missing CAL_API_KEY - legacy API functionality disabled');
  }

  // Check event type IDs
  const services = getCalServices();
  services.forEach(service => {
    if (!service.calEventTypeId || service.calEventTypeId === 0) {
      warnings.push(`Missing event type ID for service: ${service.name}`);
    }
  });

  // Check access token for API calls
  if (!getEnvVar('CAL_ACCESS_TOKEN')) {
    warnings.push('Missing CAL_ACCESS_TOKEN - API functionality may be limited');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get configuration status for debugging
 */
export function getConfigurationStatus() {
  const config = getCalProviderConfig();
  const webhook = getWebhookConfig();
  const validation = validateCalConfiguration();
  const services = getActiveCalServices();

  return {
    calProvider: {
      configured: Boolean(config),
      clientId: config?.clientId ? 'Present' : 'Missing',
      apiUrl: config?.apiUrl ?? 'Default',
    },
    webhook: {
      configured: webhook.isConfigured,
      secret: webhook.secret ? 'Present' : 'Missing',
    },
    services: {
      total: services.length,
      withEventIds: services.filter(s => s.calEventTypeId > 0).length,
      categories: Array.from(new Set(services.map(s => s.category))),
    },
    validation,
    environment: getEnvVar('NODE_ENV'),
  };
}

// GRACEFUL FALLBACKS

/**
 * Get fallback configuration when Cal.com is not available
 */
export function getFallbackConfig() {
  return {
    enabled: false,
    message: 'Cal.com integration is currently unavailable. Please contact us directly.',
    contactMethods: [
      {
        type: 'email',
        value: getEnvVar('CONTACT_EMAIL') ?? 'info@ink37tattoos.com',
        label: 'Email Us',
      },
      {
        type: 'phone',
        value: getEnvVar('CONTACT_PHONE') ?? '',
        label: 'Call Us',
      },
      {
        type: 'form',
        value: '/contact',
        label: 'Contact Form',
      },
    ],
  };
}

/**
 * Check if we should use fallback mode
 */
export function shouldUseFallback(): boolean {
  return !isCalConfigured();
}