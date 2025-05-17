-- Migration to create remaining tables from Prisma schema (part 2)

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
  "schedule_config" JSONB DEFAULT '{}',
  "last_run" TIMESTAMP,
  "last_run_status" TEXT,
  "next_run" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "created_by" TEXT,
  "updated_by" TEXT
);

-- Create indices on EmailAutomation
CREATE INDEX IF NOT EXISTS "EmailAutomation_active_idx" ON "EmailAutomation"("active");
CREATE INDEX IF NOT EXISTS "EmailAutomation_trigger_type_idx" ON "EmailAutomation"("trigger_type");
CREATE INDEX IF NOT EXISTS "EmailAutomation_next_run_idx" ON "EmailAutomation"("next_run");

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

-- Create AutomationRun table
CREATE TABLE IF NOT EXISTS "AutomationRun" (
  "id" UUID PRIMARY KEY,
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

-- Create indices on AutomationRun
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
  "automation_run_id" UUID,
  FOREIGN KEY ("automation_id") REFERENCES "EmailAutomation"("id"),
  FOREIGN KEY ("automation_run_id") REFERENCES "AutomationRun"("id")
);

-- Create indices on EmailLog
CREATE INDEX IF NOT EXISTS "EmailLog_sent_at_idx" ON "EmailLog"("sent_at");
CREATE INDEX IF NOT EXISTS "EmailLog_automation_id_idx" ON "EmailLog"("automation_id");
CREATE INDEX IF NOT EXISTS "EmailLog_automation_run_id_idx" ON "EmailLog"("automation_run_id");
