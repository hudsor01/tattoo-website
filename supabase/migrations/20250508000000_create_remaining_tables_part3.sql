-- Migration to create remaining tables from Prisma schema (part 3)

-- Create AnalyticsEvent table
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
  "userId" UUID,
  "sessionId" TEXT,
  "category" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "label" TEXT,
  "value" FLOAT,
  "path" TEXT,
  "referrer" TEXT,
  "deviceType" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Create indices on AnalyticsEvent
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_category_idx" ON "AnalyticsEvent"("category");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_action_idx" ON "AnalyticsEvent"("action");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_path_idx" ON "AnalyticsEvent"("path");

-- Create Lead table
CREATE TABLE IF NOT EXISTS "Lead" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "leadMagnetType" TEXT NOT NULL,
  "downloadDate" TIMESTAMP NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "customerId" UUID,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

-- Create Contact table
CREATE TABLE IF NOT EXISTS "Contact" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "customerId" UUID,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

-- Create Testimonial table
CREATE TABLE IF NOT EXISTS "Testimonial" (
  "id" SERIAL PRIMARY KEY,
  "clientName" TEXT NOT NULL,
  "clientImage" TEXT,
  "tattooType" TEXT,
  "rating" INTEGER NOT NULL DEFAULT 5,
  "comment" TEXT NOT NULL,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "verified" BOOLEAN NOT NULL DEFAULT true,
  "publishedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "customerId" UUID,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

-- Add missing fields to Appointment table from Prisma schema
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "calendarEventId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "calendarSyncStatus" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "lastSyncedAt" TIMESTAMP;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "syncError" TEXT;
