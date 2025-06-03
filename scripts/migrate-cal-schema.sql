-- Cal.com Integration Database Migration
-- This script adds Cal.com tables to the existing database
-- Run this after updating your schema.prisma file

-- =========================================
-- Cal.com Booking Management Tables
-- =========================================

-- Cal.com Bookings Sync Table
CREATE TABLE IF NOT EXISTS "cal_bookings" (
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

-- Cal.com Event Types Sync Table
CREATE TABLE IF NOT EXISTS "cal_event_types" (
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

-- Cal.com Webhook Events Table
CREATE TABLE IF NOT EXISTS "cal_webhook_events" (
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

-- Cal.com Metrics Snapshots Table
CREATE TABLE IF NOT EXISTS "cal_metrics_snapshots" (
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

-- Cal.com Integration Health Table
CREATE TABLE IF NOT EXISTS "cal_integration_health" (
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

-- Cal.com Sync State Table
CREATE TABLE IF NOT EXISTS "cal_sync_states" (
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

-- =========================================
-- Create Enums (if they don't exist)
-- =========================================

-- Cal.com Booking Status Enum
DO $$ BEGIN
    CREATE TYPE "CalBookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'NO_SHOW', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Status Enum
DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Health Status Enum
DO $$ BEGIN
    CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'WARNING', 'ERROR', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sync Status Enum
DO $$ BEGIN
    CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'RUNNING', 'SUCCESS', 'ERROR', 'PARTIAL_SUCCESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================================
-- Create Unique Constraints
-- =========================================

-- Cal Bookings unique constraints
ALTER TABLE "cal_bookings" ADD CONSTRAINT "cal_bookings_calBookingId_key" UNIQUE ("calBookingId");
ALTER TABLE "cal_bookings" ADD CONSTRAINT "cal_bookings_calBookingUid_key" UNIQUE ("calBookingUid");

-- Cal Event Types unique constraints
ALTER TABLE "cal_event_types" ADD CONSTRAINT "cal_event_types_calEventTypeId_key" UNIQUE ("calEventTypeId");
ALTER TABLE "cal_event_types" ADD CONSTRAINT "cal_event_types_slug_key" UNIQUE ("slug");

-- Cal Metrics Snapshots unique constraint
ALTER TABLE "cal_metrics_snapshots" ADD CONSTRAINT "cal_metrics_snapshots_date_hour_key" UNIQUE ("date", "hour");

-- Cal Sync States unique constraint
ALTER TABLE "cal_sync_states" ADD CONSTRAINT "cal_sync_states_syncType_key" UNIQUE ("syncType");

-- =========================================
-- Create Indexes for Performance
-- =========================================

-- Cal Bookings indexes
CREATE INDEX IF NOT EXISTS "cal_bookings_calBookingId_idx" ON "cal_bookings"("calBookingId");
CREATE INDEX IF NOT EXISTS "cal_bookings_calBookingUid_idx" ON "cal_bookings"("calBookingUid");
CREATE INDEX IF NOT EXISTS "cal_bookings_attendeeEmail_idx" ON "cal_bookings"("attendeeEmail");
CREATE INDEX IF NOT EXISTS "cal_bookings_startTime_idx" ON "cal_bookings"("startTime");
CREATE INDEX IF NOT EXISTS "cal_bookings_status_idx" ON "cal_bookings"("status");
CREATE INDEX IF NOT EXISTS "cal_bookings_eventTypeId_idx" ON "cal_bookings"("eventTypeId");
CREATE INDEX IF NOT EXISTS "cal_bookings_syncedAt_idx" ON "cal_bookings"("syncedAt");
CREATE INDEX IF NOT EXISTS "cal_bookings_bookedAt_idx" ON "cal_bookings"("bookedAt");

-- Cal Event Types indexes
CREATE INDEX IF NOT EXISTS "cal_event_types_calEventTypeId_idx" ON "cal_event_types"("calEventTypeId");
CREATE INDEX IF NOT EXISTS "cal_event_types_slug_idx" ON "cal_event_types"("slug");
CREATE INDEX IF NOT EXISTS "cal_event_types_isActive_idx" ON "cal_event_types"("isActive");
CREATE INDEX IF NOT EXISTS "cal_event_types_category_idx" ON "cal_event_types"("category");
CREATE INDEX IF NOT EXISTS "cal_event_types_syncedAt_idx" ON "cal_event_types"("syncedAt");

-- Cal Webhook Events indexes
CREATE INDEX IF NOT EXISTS "cal_webhook_events_triggerEvent_idx" ON "cal_webhook_events"("triggerEvent");
CREATE INDEX IF NOT EXISTS "cal_webhook_events_calBookingId_idx" ON "cal_webhook_events"("calBookingId");
CREATE INDEX IF NOT EXISTS "cal_webhook_events_processed_idx" ON "cal_webhook_events"("processed");
CREATE INDEX IF NOT EXISTS "cal_webhook_events_receivedAt_idx" ON "cal_webhook_events"("receivedAt");
CREATE INDEX IF NOT EXISTS "cal_webhook_events_retryCount_idx" ON "cal_webhook_events"("retryCount");

-- Cal Metrics Snapshots indexes
CREATE INDEX IF NOT EXISTS "cal_metrics_snapshots_date_idx" ON "cal_metrics_snapshots"("date");
CREATE INDEX IF NOT EXISTS "cal_metrics_snapshots_hour_idx" ON "cal_metrics_snapshots"("hour");
CREATE INDEX IF NOT EXISTS "cal_metrics_snapshots_createdAt_idx" ON "cal_metrics_snapshots"("createdAt");

-- Cal Integration Health indexes
CREATE INDEX IF NOT EXISTS "cal_integration_health_service_idx" ON "cal_integration_health"("service");
CREATE INDEX IF NOT EXISTS "cal_integration_health_status_idx" ON "cal_integration_health"("status");
CREATE INDEX IF NOT EXISTS "cal_integration_health_checkedAt_idx" ON "cal_integration_health"("checkedAt");

-- Cal Sync States indexes
CREATE INDEX IF NOT EXISTS "cal_sync_states_lastSyncAt_idx" ON "cal_sync_states"("lastSyncAt");
CREATE INDEX IF NOT EXISTS "cal_sync_states_nextSyncAt_idx" ON "cal_sync_states"("nextSyncAt");
CREATE INDEX IF NOT EXISTS "cal_sync_states_isRunning_idx" ON "cal_sync_states"("isRunning");

-- =========================================
-- Update Customer Table for Cal.com Integration
-- =========================================

-- Add Cal.com integration fields to existing Customer table
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "bookingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "lastBookingAt" TIMESTAMP(3);
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "avgRating" DOUBLE PRECISION;
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "preferredEventTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "communicationPrefs" JSONB;

-- Add indexes for new Customer fields
CREATE INDEX IF NOT EXISTS "customer_totalSpent_idx" ON "customer"("totalSpent");
CREATE INDEX IF NOT EXISTS "customer_lastBookingAt_idx" ON "customer"("lastBookingAt");

-- =========================================
-- Create Foreign Key Constraints
-- =========================================

-- Cal Bookings to Customer relationship (optional, since email might not exist in customer table)
-- This will be handled at the application level due to optional nature

-- =========================================
-- Insert Initial Data
-- =========================================

-- Insert initial sync states
INSERT INTO "cal_sync_states" ("syncType", "isEnabled") 
VALUES 
    ('bookings', true),
    ('event_types', true),
    ('analytics', true)
ON CONFLICT ("syncType") DO NOTHING;

-- Insert initial health monitoring records
INSERT INTO "cal_integration_health" ("service", "status") 
VALUES 
    ('api', 'HEALTHY'),
    ('webhook', 'HEALTHY'),
    ('sync', 'HEALTHY')
ON CONFLICT DO NOTHING;

-- =========================================
-- Migration Complete
-- =========================================

-- Create a migration record
CREATE TABLE IF NOT EXISTS "_cal_migrations" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "_cal_migrations" ("name") VALUES ('cal_integration_v1_initial') ON CONFLICT DO NOTHING;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'Cal.com integration migration completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run: npx prisma generate';
    RAISE NOTICE '2. Configure environment variables';
    RAISE NOTICE '3. Run: npm run cal:sync to sync initial data';
END $$;