/**
 * Analytics Configuration
 * Central configuration for the Cal.com Analytics system
 */

// Analytics configuration type
type AnalyticsConfig = {
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  enableDebugMode: boolean;
  enableDataRetention: boolean;
  dataRetentionDays: number;
  enableRealTimeMetrics: boolean;
  realTimeUpdateInterval: number;
  enableCaching: boolean;
  cacheExpiration: number;
  enableRateLimiting: boolean;
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
  enableBatchProcessing: boolean;
  enableCompression: boolean;
  enableDataValidation: boolean;
  enableErrorReporting: boolean;
  enablePerformanceMonitoring: boolean;
};

import { logger } from "@/lib/logger";
// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Analytics configuration with environment-specific defaults
export const analyticsConfig: AnalyticsConfig = {
  // Batch processing settings
  batchSize: parseInt(process.env['ANALYTICS_BATCH_SIZE'] ?? '10'),
  flushInterval: parseInt(process.env['ANALYTICS_FLUSH_INTERVAL'] ?? '5000'), // 5 seconds
  
  // Retry settings
  maxRetries: parseInt(process.env['ANALYTICS_MAX_RETRIES'] ?? '3'),
  retryDelay: parseInt(process.env['ANALYTICS_RETRY_DELAY'] ?? '1000'), // 1 second
  
  // Feature flags  
  enableBatchProcessing: process.env['ANALYTICS_ENABLE_BATCHING'] !== 'false', // enabled by default
  enableErrorReporting: process.env['ANALYTICS_ENABLE_ERROR_LOGGING'] !== 'false', // enabled by default
  
  // Additional required properties
  enableDebugMode: process.env['NODE_ENV'] === 'development',
  enableDataRetention: true,
  dataRetentionDays: 90,
  enableRealTimeMetrics: true,
  realTimeUpdateInterval: 5000,
  enableCaching: true,
  cacheExpiration: 300000, // 5 minutes
  enableRateLimiting: true,
  rateLimitWindow: 900000, // 15 minutes
  rateLimitMaxRequests: 100,
  enableCompression: true,
  enableDataValidation: true,
  enablePerformanceMonitoring: true,
};

// Development overrides
if (isDevelopment) {
  // Smaller batches and faster flushing for development
  analyticsConfig.batchSize = 3;
  analyticsConfig.flushInterval = 2000; // 2 seconds
  analyticsConfig.enableErrorReporting = true;
}

// Production optimizations
if (isProduction) {
  // Larger batches for better performance in production
  analyticsConfig.batchSize = 20;
  analyticsConfig.flushInterval = 10000; // 10 seconds
  analyticsConfig.maxRetries = 5;
}

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: parseInt(process.env['ANALYTICS_RATE_LIMIT'] ?? '1000'), // per window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// Monitoring configuration
export const monitoringConfig = {
  enableHealthChecks: process.env['ANALYTICS_ENABLE_HEALTH_CHECKS'] !== 'false',
  healthCheckInterval: parseInt(process.env['ANALYTICS_HEALTH_CHECK_INTERVAL'] ?? '30000'), // 30 seconds
  enableMetricsCollection: process.env['ANALYTICS_ENABLE_METRICS'] !== 'false',
  metricsPort: parseInt(process.env['ANALYTICS_METRICS_PORT'] ?? '9090'),
};

// Data retention configuration
export const dataRetentionConfig = {
  // How long to keep different types of analytics data
  eventDataRetentionDays: parseInt(process.env['ANALYTICS_EVENT_RETENTION_DAYS'] ?? '365'), // 1 year
  sessionDataRetentionDays: parseInt(process.env['ANALYTICS_SESSION_RETENTION_DAYS'] ?? '90'), // 3 months
  errorLogRetentionDays: parseInt(process.env['ANALYTICS_ERROR_LOG_RETENTION_DAYS'] ?? '30'), // 1 month
  
  // Cleanup job configuration
  enableDataCleanup: process.env['ANALYTICS_ENABLE_DATA_CLEANUP'] !== 'false',
  cleanupJobCron: process.env['ANALYTICS_CLEANUP_CRON'] ?? '0 2 * * *', // Daily at 2 AM
  
  // Logging settings
  verboseLogging: process.env['ANALYTICS_VERBOSE_LOGGING'] === 'true' || process.env.NODE_ENV === 'development',
  
  // Performance tuning
  chunkSize: parseInt(process.env['ANALYTICS_CLEANUP_CHUNK_SIZE'] ?? '1000'), // Delete in batches of 1000
  pauseBetweenChunks: parseInt(process.env['ANALYTICS_CLEANUP_PAUSE'] ?? '100'), // Milliseconds between chunks
  
  // Metrics collection
  storeCleanupMetrics: process.env['ANALYTICS_STORE_CLEANUP_METRICS'] !== 'false', // Store metrics by default
};

// Security configuration
export const securityConfig = {
  // IP address anonymization
  anonymizeIpAddresses: process.env['ANALYTICS_ANONYMIZE_IPS'] === 'true',
  ipAnonymizationMask: process.env['ANALYTICS_IP_MASK'] ?? '255.255.255.0',
  
  // Data encryption
  encryptSensitiveData: process.env['ANALYTICS_ENCRYPT_DATA'] === 'true',
  encryptionKey: process.env['ANALYTICS_ENCRYPTION_KEY'],
  
  // GDPR compliance
  enableGdprCompliance: process.env['ANALYTICS_GDPR_COMPLIANCE'] !== 'false',
  dataSubjectRequestsEnabled: process.env['ANALYTICS_DATA_SUBJECT_REQUESTS'] !== 'false',
};

// Export all configurations
export const config = {
  analytics: analyticsConfig,
  rateLimit: rateLimitConfig,
  monitoring: monitoringConfig,
  dataRetention: dataRetentionConfig,
  security: securityConfig,
} as const;

// Configuration validation
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate analytics config
  if (analyticsConfig.batchSize < 1) {
    errors.push('Analytics batch size must be at least 1');
  }
  
  if (analyticsConfig.flushInterval < 1000) {
    errors.push('Analytics flush interval must be at least 1000ms');
  }
  
  if (analyticsConfig.maxRetries < 0) {
    errors.push('Analytics max retries must be 0 or greater');
  }
  
  // Validate security config
  if (securityConfig.encryptSensitiveData && !securityConfig.encryptionKey) {
    errors.push('Encryption key is required when data encryption is enabled');
  }
  
  // Validate monitoring config
  if (monitoringConfig.healthCheckInterval < 5000) {
    errors.push('Health check interval must be at least 5000ms');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Log configuration on startup (development only)
if (isDevelopment) {
  void logger.warn('Analytics Configuration:', {
    batchSize: analyticsConfig.batchSize,
    flushInterval: analyticsConfig.flushInterval,
    enableBatchProcessing: analyticsConfig.enableBatchProcessing,
    maxRetries: analyticsConfig.maxRetries,
  });
  
  const validation = validateConfig();
  if (!validation.isValid) {
    void logger.warn('Analytics configuration validation failed:', validation.errors);
  }
}
