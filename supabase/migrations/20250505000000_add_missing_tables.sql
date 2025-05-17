-- Migration to add missing tables from Prisma schema

-- Create Tag table
CREATE TABLE IF NOT EXISTS "Tag" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT UNIQUE NOT NULL,
  "color" TEXT NOT NULL DEFAULT 'gray',
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT now()
);

-- Create _CustomerToTag join table for many-to-many relationship
CREATE TABLE IF NOT EXISTS "_CustomerToTag" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL,
  CONSTRAINT "_CustomerToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_CustomerToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE ("A", "B")
);

-- Create indexes for the join table
CREATE INDEX IF NOT EXISTS "_CustomerToTag_A_index" ON "_CustomerToTag"("A");
CREATE INDEX IF NOT EXISTS "_CustomerToTag_B_index" ON "_CustomerToTag"("B");

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

-- Create TattooDesign table
CREATE TABLE IF NOT EXISTS "TattooDesign" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "fileUrl" TEXT,
  "thumbnailUrl" TEXT,
  "designType" TEXT,
  "size" TEXT,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "approvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "artistId" UUID NOT NULL,
  "customerId" UUID,
  FOREIGN KEY ("artistId") REFERENCES "Artist"("id"),
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

-- Create Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "amount" FLOAT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "transactionId" TEXT,
  "receiptUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "customerId" UUID NOT NULL,
  "appointmentId" UUID,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
);

-- Create Interaction table
CREATE TABLE IF NOT EXISTS "Interaction" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" TEXT NOT NULL,
  "subject" TEXT,
  "content" TEXT,
  "direction" TEXT NOT NULL,
  "outcome" TEXT,
  "scheduledAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "customerId" UUID NOT NULL,
  "appointmentId" UUID,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
);

-- Create EmailTemplate table
CREATE TABLE IF NOT EXISTS "EmailTemplate" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "created_by" TEXT,
  "updated_by" TEXT
);

-- Create EmailAutomation table
CREATE TABLE IF NOT EXISTS "EmailAutomation" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "template_id" TEXT NOT NULL,
  "trigger_type" TEXT NOT NULL,
  "trigger_field" TEXT,
  "trigger_value" TEXT,
  "trigger_comparison" TEXT,
  "delay_minutes" INTEGER,
  "send_to_client" BOOLEAN NOT NULL DEFAULT true,
  "send_to_artist" BOOLEAN NOT NULL DEFAULT false,
  "schedule_type" TEXT,
  "schedule_config" JSONB NOT NULL DEFAULT '{}',
  "last_run" TIMESTAMP,
  "last_run_status" TEXT,
  "next_run" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "created_by" TEXT,
  "updated_by" TEXT
);

-- Create indexes for EmailAutomation table
CREATE INDEX IF NOT EXISTS "EmailAutomation_active_idx" ON "EmailAutomation"("active");
CREATE INDEX IF NOT EXISTS "EmailAutomation_trigger_type_idx" ON "EmailAutomation"("trigger_type");
CREATE INDEX IF NOT EXISTS "EmailAutomation_next_run_idx" ON "EmailAutomation"("next_run");

-- Create AutomationRun table
CREATE TABLE IF NOT EXISTS "AutomationRun" (
  "id" TEXT PRIMARY KEY,
  "automation_id" UUID,
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP,
  "status" TEXT NOT NULL,
  "duration_ms" INTEGER,
  "success_count" INTEGER DEFAULT 0,
  "failure_count" INTEGER DEFAULT 0,
  "total_automations" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("automation_id") REFERENCES "EmailAutomation"("id")
);

-- Create indexes for AutomationRun table
CREATE INDEX IF NOT EXISTS "AutomationRun_status_idx" ON "AutomationRun"("status");
CREATE INDEX IF NOT EXISTS "AutomationRun_start_time_idx" ON "AutomationRun"("start_time");

-- Create EmailLog table
CREATE TABLE IF NOT EXISTS "EmailLog" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "recipient" TEXT NOT NULL,
  "template_id" TEXT NOT NULL,
  "data" JSONB,
  "status" TEXT NOT NULL,
  "message_id" TEXT,
  "error_message" TEXT,
  "sent_at" TIMESTAMP NOT NULL DEFAULT now(),
  "automation_id" UUID,
  "automation_run_id" TEXT,
  FOREIGN KEY ("automation_id") REFERENCES "EmailAutomation"("id"),
  FOREIGN KEY ("automation_run_id") REFERENCES "AutomationRun"("id")
);

-- Create indexes for EmailLog table
CREATE INDEX IF NOT EXISTS "EmailLog_sent_at_idx" ON "EmailLog"("sent_at");
CREATE INDEX IF NOT EXISTS "EmailLog_automation_id_idx" ON "EmailLog"("automation_id");
CREATE INDEX IF NOT EXISTS "EmailLog_automation_run_id_idx" ON "EmailLog"("automation_run_id");

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

-- Create indexes for AnalyticsEvent table
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_category_idx" ON "AnalyticsEvent"("category");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_action_idx" ON "AnalyticsEvent"("action");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_path_idx" ON "AnalyticsEvent"("path");

-- Add calendar related fields to Appointment table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'calendarEventId') THEN
        ALTER TABLE "Appointment" ADD COLUMN "calendarEventId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'calendarSyncStatus') THEN
        ALTER TABLE "Appointment" ADD COLUMN "calendarSyncStatus" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'lastSyncedAt') THEN
        ALTER TABLE "Appointment" ADD COLUMN "lastSyncedAt" TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'syncError') THEN
        ALTER TABLE "Appointment" ADD COLUMN "syncError" TEXT;
    END IF;
END
$$;
