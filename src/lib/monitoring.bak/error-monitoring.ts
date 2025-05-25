/**
 * Production Error Monitoring and Logging System
 * Provides comprehensive error tracking, performance monitoring, and user analytics
 */

import { User } from '@clerk/nextjs/server'

export interface ErrorContext {
  userId?: string
  userEmail?: string
  sessionId?: string
  route?: string
  userAgent?: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  timestamp: Date
  tags?: Record<string, string>
}

export interface UserActivity {
  userId?: string
  action: string
  page?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export class ErrorMonitor {
  private static instance: ErrorMonitor
  private isProduction = process.env.NODE_ENV === 'production'
  private sentryDsn = process.env.SENTRY_DSN
  private posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  // Error Logging
  logError(error: Error, context?: Partial<ErrorContext>): void {
    const errorContext: ErrorContext = {
      timestamp: new Date(),
      severity: 'medium',
      route: this.getCurrentRoute(),
      ...context,
    }

    if (this.isProduction) {
      this.sendToSentry(error, errorContext)
    } else {
      this.logToConsole(error, errorContext)
    }

    // Always log to our internal system
    this.logToDatabase(error, errorContext)
  }

  // Performance Monitoring
  trackPerformance(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const performanceMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date(),
    }

    if (this.isProduction) {
      this.sendPerformanceToAnalytics(performanceMetric)
    } else {
      console.info('Performance Metric:', performanceMetric)
    }
  }

  // User Activity Tracking
  trackUserActivity(activity: Omit<UserActivity, 'timestamp'>): void {
    const userActivity: UserActivity = {
      ...activity,
      timestamp: new Date(),
    }

    if (this.isProduction && this.posthogKey) {
      this.sendToPostHog(userActivity)
    } else {
      console.info('User Activity:', userActivity)
    }
  }

  // Critical Error Handler
  handleCriticalError(error: Error, context?: Partial<ErrorContext>): void {
    this.logError(error, { ...context, severity: 'critical' })
    
    // Send immediate alerts for critical errors
    if (this.isProduction) {
      this.sendAlert(error, context)
    }
  }

  // Database Error Handler
  handleDatabaseError(error: Error, query?: string, params?: unknown[]): void {
    this.logError(error, {
      severity: 'high',
      tags: { type: 'database' },
      extra: { query, params },
    })
  }

  // API Error Handler
  handleAPIError(error: Error, endpoint: string, method: string): void {
    this.logError(error, {
      severity: 'medium',
      tags: { type: 'api', endpoint, method },
    })
  }

  // Authentication Error Handler
  handleAuthError(error: Error, userId?: string): void {
    this.logError(error, {
      severity: 'high',
      userId,
      tags: { type: 'authentication' },
    })
  }

  // Payment Error Handler
  handlePaymentError(error: Error, amount?: number, paymentMethod?: string): void {
    this.logError(error, {
      severity: 'critical',
      tags: { type: 'payment' },
      extra: { amount, paymentMethod },
    })
  }

  // Private Methods
  private getCurrentRoute(): string {
    if (typeof window !== 'undefined') {
      return window.location.pathname
    }
    return 'server-side'
  }

  private sendToSentry(error: Error, context: ErrorContext): void {
    // Sentry integration would go here
    // This is a placeholder for the actual Sentry implementation
    if (this.sentryDsn) {
      console.log('Sending to Sentry:', { error: error.message, context })
    }
  }

  private sendToPostHog(activity: UserActivity): void {
    // PostHog integration would go here
    if (this.posthogKey) {
      console.log('Sending to PostHog:', activity)
    }
  }

  private sendPerformanceToAnalytics(metric: PerformanceMetric): void {
    // Send to analytics service (PostHog, Google Analytics, etc.)
    console.log('Performance metric:', metric)
  }

  private logToConsole(error: Error, context: ErrorContext): void {
    console.group(`🚨 ${context.severity.toUpperCase()} ERROR`)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Context:', context)
    console.groupEnd()
  }

  private async logToDatabase(error: Error, context: ErrorContext): Promise<void> {
    try {
      // In a real implementation, you would save to your database
      // For now, we'll just structure the data as it would be saved
      const errorLog = {
        message: error.message,
        stack: error.stack,
        severity: context.severity,
        userId: context.userId,
        route: context.route,
        userAgent: context.userAgent,
        timestamp: context.timestamp,
        tags: context.tags || {},
        extra: context.extra || {},
      }

      // Save to database (implement based on your ORM/database)
      console.log('Would save to database:', errorLog)
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError)
    }
  }

  private sendAlert(error: Error, context?: Partial<ErrorContext>): void {
    // Send alerts via email, Slack, PagerDuty, etc.
    console.log('🚨 CRITICAL ERROR ALERT:', {
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
    })
  }
}

// Performance Monitoring Class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private errorMonitor = ErrorMonitor.getInstance()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Track API response times
  trackAPIResponse(endpoint: string, duration: number, status: number): void {
    this.errorMonitor.trackPerformance({
      name: 'api_response_time',
      value: duration,
      unit: 'ms',
      tags: { endpoint, status: status.toString() },
    })
  }

  // Track database query times
  trackDatabaseQuery(query: string, duration: number): void {
    this.errorMonitor.trackPerformance({
      name: 'database_query_time',
      value: duration,
      unit: 'ms',
      tags: { query_type: this.getQueryType(query) },
    })
  }

  // Track page load times
  trackPageLoad(page: string, duration: number): void {
    this.errorMonitor.trackPerformance({
      name: 'page_load_time',
      value: duration,
      unit: 'ms',
      tags: { page },
    })
  }

  // Track memory usage
  trackMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      this.errorMonitor.trackPerformance({
        name: 'memory_usage_rss',
        value: usage.rss,
        unit: 'bytes',
      })
      this.errorMonitor.trackPerformance({
        name: 'memory_usage_heap_used',
        value: usage.heapUsed,
        unit: 'bytes',
      })
    }
  }

  private getQueryType(query: string): string {
    const normalized = query.toLowerCase().trim()
    if (normalized.startsWith('select')) return 'select'
    if (normalized.startsWith('insert')) return 'insert'
    if (normalized.startsWith('update')) return 'update'
    if (normalized.startsWith('delete')) return 'delete'
    return 'other'
  }
}

// User Activity Tracker
export class UserActivityTracker {
  private static instance: UserActivityTracker
  private errorMonitor = ErrorMonitor.getInstance()

  static getInstance(): UserActivityTracker {
    if (!UserActivityTracker.instance) {
      UserActivityTracker.instance = new UserActivityTracker()
    }
    return UserActivityTracker.instance
  }

  // Track user actions
  trackAction(userId: string | undefined, action: string, metadata?: Record<string, unknown>): void {
    this.errorMonitor.trackUserActivity({
      userId,
      action,
      page: this.getCurrentPage(),
      metadata,
    })
  }

  // Track booking events
  trackBooking(userId: string | undefined, bookingId: string, action: 'created' | 'updated' | 'cancelled'): void {
    this.trackAction(userId, `booking_${action}`, { bookingId })
  }

  // Track payment events
  trackPayment(userId: string | undefined, amount: number, status: 'success' | 'failed'): void {
    this.trackAction(userId, `payment_${status}`, { amount })
  }

  // Track contact form submissions
  trackContactForm(formType: string, success: boolean): void {
    this.trackAction(undefined, 'contact_form_submitted', { formType, success })
  }

  // Track gallery interactions
  trackGalleryView(userId: string | undefined, imageId: string): void {
    this.trackAction(userId, 'gallery_image_viewed', { imageId })
  }

  private getCurrentPage(): string {
    if (typeof window !== 'undefined') {
      return window.location.pathname
    }
    return 'server'
  }
}

// Global error handler setup
export function setupGlobalErrorHandlers(): void {
  const errorMonitor = ErrorMonitor.getInstance()

  // Handle unhandled promise rejections
  if (typeof process !== 'undefined') {
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      errorMonitor.handleCriticalError(error, {
        tags: { type: 'unhandled_rejection' },
        extra: { promise: promise.toString() },
      })
    })

    process.on('uncaughtException', (error: Error) => {
      errorMonitor.handleCriticalError(error, {
        tags: { type: 'uncaught_exception' },
      })
      // Don't exit in production, but log the error
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1)
      }
    })
  }

  // Handle client-side errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      errorMonitor.logError(event.error, {
        tags: { type: 'javascript_error' },
        extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      errorMonitor.logError(error, {
        tags: { type: 'unhandled_promise_rejection' },
      })
    })
  }
}

// Convenience function to create monitoring instances
export const monitoring = {
  error: ErrorMonitor.getInstance(),
  performance: PerformanceMonitor.getInstance(),
  activity: UserActivityTracker.getInstance(),
}