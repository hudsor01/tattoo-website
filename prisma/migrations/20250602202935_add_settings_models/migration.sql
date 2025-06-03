-- CreateEnum
CREATE TYPE "CalBookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'NO_SHOW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'RUNNING', 'SUCCESS', 'ERROR', 'PARTIAL_SUCCESS');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "avgRating" DOUBLE PRECISION,
ADD COLUMN     "bookingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "communicationPrefs" JSONB,
ADD COLUMN     "lastBookingAt" TIMESTAMP(3),
ADD COLUMN     "preferredEventTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "cal_bookings" (
    "id" TEXT NOT NULL,
    "calBookingId" INTEGER NOT NULL,
    "calBookingUid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "CalBookingStatus" NOT NULL DEFAULT 'PENDING',
    "attendeeEmail" TEXT NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "attendeePhone" TEXT,
    "attendeeTimeZone" TEXT NOT NULL DEFAULT 'UTC',
    "hostId" TEXT,
    "hostEmail" TEXT NOT NULL,
    "hostName" TEXT NOT NULL,
    "serviceId" TEXT,
    "serviceName" TEXT NOT NULL,
    "servicePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceCurrency" TEXT NOT NULL DEFAULT 'USD',
    "eventTypeId" INTEGER NOT NULL,
    "eventTypeSlug" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentId" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentAmount" DOUBLE PRECISION,
    "paymentCurrency" TEXT,
    "source" TEXT DEFAULT 'website',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "customFields" JSONB,
    "attendeeResponses" JSONB,
    "internalNotes" TEXT,
    "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "remindersSent" BOOLEAN NOT NULL DEFAULT false,
    "followUpSent" BOOLEAN NOT NULL DEFAULT false,
    "feedbackCollected" BOOLEAN NOT NULL DEFAULT false,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "rescheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "noShowAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cal_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_event_types" (
    "id" TEXT NOT NULL,
    "calEventTypeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "length" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "requiresPayment" BOOLEAN NOT NULL DEFAULT false,
    "disableGuests" BOOLEAN NOT NULL DEFAULT false,
    "minimumBookingNotice" INTEGER NOT NULL DEFAULT 0,
    "beforeEventBuffer" INTEGER NOT NULL DEFAULT 0,
    "afterEventBuffer" INTEGER NOT NULL DEFAULT 0,
    "slotInterval" INTEGER,
    "locations" JSONB,
    "integrations" JSONB,
    "customInputs" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastBookingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cal_event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_webhook_events" (
    "id" TEXT NOT NULL,
    "triggerEvent" TEXT NOT NULL,
    "calBookingId" INTEGER,
    "calBookingUid" TEXT,
    "payload" JSONB NOT NULL,
    "signature" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_metrics_snapshots" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" INTEGER,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "confirmedBookings" INTEGER NOT NULL DEFAULT 0,
    "cancelledBookings" INTEGER NOT NULL DEFAULT 0,
    "pendingBookings" INTEGER NOT NULL DEFAULT 0,
    "noShowBookings" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confirmedRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageBookingValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "websiteVisitors" INTEGER NOT NULL DEFAULT 0,
    "bookingPageViews" INTEGER NOT NULL DEFAULT 0,
    "bookingStarted" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topServiceId" TEXT,
    "topServiceBookings" INTEGER NOT NULL DEFAULT 0,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "returningCustomers" INTEGER NOT NULL DEFAULT 0,
    "liveVisitors" INTEGER NOT NULL DEFAULT 0,
    "activeSessions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_metrics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_integration_health" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" "HealthStatus" NOT NULL DEFAULT 'HEALTHY',
    "responseTime" INTEGER,
    "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastSuccessAt" TIMESTAMP(3),
    "lastErrorAt" TIMESTAMP(3),
    "lastErrorMessage" TEXT,
    "uptimePercentage" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "checksPerformed" INTEGER NOT NULL DEFAULT 0,
    "checksSuccessful" INTEGER NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_integration_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_sync_states" (
    "id" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "nextSyncAt" TIMESTAMP(3),
    "isRunning" BOOLEAN NOT NULL DEFAULT false,
    "lastRunStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "lastRunError" TEXT,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
    "recordsError" INTEGER NOT NULL DEFAULT 0,
    "avgProcessingTime" INTEGER NOT NULL DEFAULT 0,
    "lastRunDuration" INTEGER NOT NULL DEFAULT 0,
    "syncInterval" INTEGER NOT NULL DEFAULT 300,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_sync_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_analytics_event" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "properties" JSONB,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "deviceType" TEXT,
    "browserName" TEXT,
    "osName" TEXT,
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cal_analytics_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_service_analytics" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "serviceName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "totalRevenue" DOUBLE PRECISION,
    "avgBookingTime" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_service_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_user_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "sessionStart" TIMESTAMP(3) NOT NULL,
    "sessionEnd" TIMESTAMP(3),
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION,
    "conversionType" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_user_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_performance_metrics" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "rating" TEXT NOT NULL,
    "deviceType" TEXT,
    "connectionType" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "userId" TEXT,

    CONSTRAINT "cal_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_booking_funnel" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "abandoned" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "serviceId" TEXT,
    "userId" TEXT,

    CONSTRAINT "cal_booking_funnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_error_log" (
    "id" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "stackTrace" TEXT,
    "url" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "severity" TEXT NOT NULL DEFAULT 'medium',

    CONSTRAINT "cal_error_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_gdpr_request" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestData" JSONB,
    "responseData" JSONB,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_gdpr_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_data_retention" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "retentionPolicy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "cal_data_retention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_cache_entry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cal_cache_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "valueType" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings_history" (
    "id" TEXT NOT NULL,
    "settingId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings_backups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_backups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cal_bookings_calBookingId_key" ON "cal_bookings"("calBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "cal_bookings_calBookingUid_key" ON "cal_bookings"("calBookingUid");

-- CreateIndex
CREATE INDEX "cal_bookings_calBookingId_idx" ON "cal_bookings"("calBookingId");

-- CreateIndex
CREATE INDEX "cal_bookings_calBookingUid_idx" ON "cal_bookings"("calBookingUid");

-- CreateIndex
CREATE INDEX "cal_bookings_attendeeEmail_idx" ON "cal_bookings"("attendeeEmail");

-- CreateIndex
CREATE INDEX "cal_bookings_startTime_idx" ON "cal_bookings"("startTime");

-- CreateIndex
CREATE INDEX "cal_bookings_status_idx" ON "cal_bookings"("status");

-- CreateIndex
CREATE INDEX "cal_bookings_eventTypeId_idx" ON "cal_bookings"("eventTypeId");

-- CreateIndex
CREATE INDEX "cal_bookings_syncedAt_idx" ON "cal_bookings"("syncedAt");

-- CreateIndex
CREATE INDEX "cal_bookings_bookedAt_idx" ON "cal_bookings"("bookedAt");

-- CreateIndex
CREATE UNIQUE INDEX "cal_event_types_calEventTypeId_key" ON "cal_event_types"("calEventTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "cal_event_types_slug_key" ON "cal_event_types"("slug");

-- CreateIndex
CREATE INDEX "cal_event_types_calEventTypeId_idx" ON "cal_event_types"("calEventTypeId");

-- CreateIndex
CREATE INDEX "cal_event_types_slug_idx" ON "cal_event_types"("slug");

-- CreateIndex
CREATE INDEX "cal_event_types_isActive_idx" ON "cal_event_types"("isActive");

-- CreateIndex
CREATE INDEX "cal_event_types_category_idx" ON "cal_event_types"("category");

-- CreateIndex
CREATE INDEX "cal_event_types_syncedAt_idx" ON "cal_event_types"("syncedAt");

-- CreateIndex
CREATE INDEX "cal_webhook_events_triggerEvent_idx" ON "cal_webhook_events"("triggerEvent");

-- CreateIndex
CREATE INDEX "cal_webhook_events_calBookingId_idx" ON "cal_webhook_events"("calBookingId");

-- CreateIndex
CREATE INDEX "cal_webhook_events_processed_idx" ON "cal_webhook_events"("processed");

-- CreateIndex
CREATE INDEX "cal_webhook_events_receivedAt_idx" ON "cal_webhook_events"("receivedAt");

-- CreateIndex
CREATE INDEX "cal_webhook_events_retryCount_idx" ON "cal_webhook_events"("retryCount");

-- CreateIndex
CREATE INDEX "cal_metrics_snapshots_date_idx" ON "cal_metrics_snapshots"("date");

-- CreateIndex
CREATE INDEX "cal_metrics_snapshots_hour_idx" ON "cal_metrics_snapshots"("hour");

-- CreateIndex
CREATE INDEX "cal_metrics_snapshots_createdAt_idx" ON "cal_metrics_snapshots"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cal_metrics_snapshots_date_hour_key" ON "cal_metrics_snapshots"("date", "hour");

-- CreateIndex
CREATE INDEX "cal_integration_health_service_idx" ON "cal_integration_health"("service");

-- CreateIndex
CREATE INDEX "cal_integration_health_status_idx" ON "cal_integration_health"("status");

-- CreateIndex
CREATE INDEX "cal_integration_health_checkedAt_idx" ON "cal_integration_health"("checkedAt");

-- CreateIndex
CREATE INDEX "cal_sync_states_lastSyncAt_idx" ON "cal_sync_states"("lastSyncAt");

-- CreateIndex
CREATE INDEX "cal_sync_states_nextSyncAt_idx" ON "cal_sync_states"("nextSyncAt");

-- CreateIndex
CREATE INDEX "cal_sync_states_isRunning_idx" ON "cal_sync_states"("isRunning");

-- CreateIndex
CREATE UNIQUE INDEX "cal_sync_states_syncType_key" ON "cal_sync_states"("syncType");

-- CreateIndex
CREATE INDEX "cal_analytics_event_eventType_idx" ON "cal_analytics_event"("eventType");

-- CreateIndex
CREATE INDEX "cal_analytics_event_eventName_idx" ON "cal_analytics_event"("eventName");

-- CreateIndex
CREATE INDEX "cal_analytics_event_userId_idx" ON "cal_analytics_event"("userId");

-- CreateIndex
CREATE INDEX "cal_analytics_event_sessionId_idx" ON "cal_analytics_event"("sessionId");

-- CreateIndex
CREATE INDEX "cal_analytics_event_timestamp_idx" ON "cal_analytics_event"("timestamp");

-- CreateIndex
CREATE INDEX "cal_service_analytics_serviceId_idx" ON "cal_service_analytics"("serviceId");

-- CreateIndex
CREATE INDEX "cal_service_analytics_serviceName_idx" ON "cal_service_analytics"("serviceName");

-- CreateIndex
CREATE INDEX "cal_service_analytics_eventType_idx" ON "cal_service_analytics"("eventType");

-- CreateIndex
CREATE INDEX "cal_service_analytics_date_idx" ON "cal_service_analytics"("date");

-- CreateIndex
CREATE INDEX "cal_user_analytics_userId_idx" ON "cal_user_analytics"("userId");

-- CreateIndex
CREATE INDEX "cal_user_analytics_sessionId_idx" ON "cal_user_analytics"("sessionId");

-- CreateIndex
CREATE INDEX "cal_user_analytics_sessionStart_idx" ON "cal_user_analytics"("sessionStart");

-- CreateIndex
CREATE INDEX "cal_user_analytics_source_idx" ON "cal_user_analytics"("source");

-- CreateIndex
CREATE INDEX "cal_performance_metrics_page_idx" ON "cal_performance_metrics"("page");

-- CreateIndex
CREATE INDEX "cal_performance_metrics_metricType_idx" ON "cal_performance_metrics"("metricType");

-- CreateIndex
CREATE INDEX "cal_performance_metrics_rating_idx" ON "cal_performance_metrics"("rating");

-- CreateIndex
CREATE INDEX "cal_performance_metrics_timestamp_idx" ON "cal_performance_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_sessionId_idx" ON "cal_booking_funnel"("sessionId");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_step_idx" ON "cal_booking_funnel"("step");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_stepOrder_idx" ON "cal_booking_funnel"("stepOrder");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_timestamp_idx" ON "cal_booking_funnel"("timestamp");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_completed_idx" ON "cal_booking_funnel"("completed");

-- CreateIndex
CREATE INDEX "cal_error_log_errorType_idx" ON "cal_error_log"("errorType");

-- CreateIndex
CREATE INDEX "cal_error_log_timestamp_idx" ON "cal_error_log"("timestamp");

-- CreateIndex
CREATE INDEX "cal_error_log_resolved_idx" ON "cal_error_log"("resolved");

-- CreateIndex
CREATE INDEX "cal_error_log_severity_idx" ON "cal_error_log"("severity");

-- CreateIndex
CREATE INDEX "cal_gdpr_request_userId_idx" ON "cal_gdpr_request"("userId");

-- CreateIndex
CREATE INDEX "cal_gdpr_request_email_idx" ON "cal_gdpr_request"("email");

-- CreateIndex
CREATE INDEX "cal_gdpr_request_requestType_idx" ON "cal_gdpr_request"("requestType");

-- CreateIndex
CREATE INDEX "cal_gdpr_request_status_idx" ON "cal_gdpr_request"("status");

-- CreateIndex
CREATE INDEX "cal_gdpr_request_createdAt_idx" ON "cal_gdpr_request"("createdAt");

-- CreateIndex
CREATE INDEX "cal_data_retention_tableName_idx" ON "cal_data_retention"("tableName");

-- CreateIndex
CREATE INDEX "cal_data_retention_expiresAt_idx" ON "cal_data_retention"("expiresAt");

-- CreateIndex
CREATE INDEX "cal_data_retention_processed_idx" ON "cal_data_retention"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "cal_cache_entry_key_key" ON "cal_cache_entry"("key");

-- CreateIndex
CREATE INDEX "cal_cache_entry_key_idx" ON "cal_cache_entry"("key");

-- CreateIndex
CREATE INDEX "cal_cache_entry_expiresAt_idx" ON "cal_cache_entry"("expiresAt");

-- CreateIndex
CREATE INDEX "settings_domain_idx" ON "settings"("domain");

-- CreateIndex
CREATE INDEX "settings_isSystem_idx" ON "settings"("isSystem");

-- CreateIndex
CREATE INDEX "settings_updatedAt_idx" ON "settings"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_domain_key_key" ON "settings"("domain", "key");

-- CreateIndex
CREATE INDEX "settings_history_settingId_idx" ON "settings_history"("settingId");

-- CreateIndex
CREATE INDEX "settings_history_createdAt_idx" ON "settings_history"("createdAt");

-- CreateIndex
CREATE INDEX "settings_history_changedBy_idx" ON "settings_history"("changedBy");

-- CreateIndex
CREATE INDEX "settings_backups_createdBy_idx" ON "settings_backups"("createdBy");

-- CreateIndex
CREATE INDEX "settings_backups_createdAt_idx" ON "settings_backups"("createdAt");

-- CreateIndex
CREATE INDEX "Customer_totalSpent_idx" ON "Customer"("totalSpent");

-- CreateIndex
CREATE INDEX "Customer_lastBookingAt_idx" ON "Customer"("lastBookingAt");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "account_providerId_idx" ON "account"("providerId");

-- CreateIndex
CREATE INDEX "rateLimit_key_idx" ON "rateLimit"("key");

-- CreateIndex
CREATE INDEX "rateLimit_lastRequest_idx" ON "rateLimit"("lastRequest");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_token_idx" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_emailVerified_idx" ON "user"("emailVerified");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "verification"("expiresAt");

-- AddForeignKey
ALTER TABLE "cal_bookings" ADD CONSTRAINT "cal_bookings_attendeeEmail_fkey" FOREIGN KEY ("attendeeEmail") REFERENCES "Customer"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings_history" ADD CONSTRAINT "settings_history_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
