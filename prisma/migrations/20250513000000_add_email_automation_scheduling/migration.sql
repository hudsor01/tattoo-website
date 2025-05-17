-- Create EmailAutomation table
CREATE TABLE "public"."EmailAutomation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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
  "last_run" TIMESTAMP WITH TIME ZONE,
  "last_run_status" TEXT,
  "next_run" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "created_by" UUID,
  "updated_by" UUID,
  
  CONSTRAINT "EmailAutomation_pkey" PRIMARY KEY ("id")
);

-- Create EmailTemplate table
CREATE TABLE "public"."EmailTemplate" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "created_by" UUID,
  "updated_by" UUID,
  
  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- Create AutomationRun table to track execution history
CREATE TABLE "public"."AutomationRun" (
  "id" TEXT NOT NULL,
  "automation_id" UUID,
  "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end_time" TIMESTAMP WITH TIME ZONE,
  "status" TEXT NOT NULL,
  "duration_ms" INTEGER,
  "success_count" INTEGER DEFAULT 0,
  "failure_count" INTEGER DEFAULT 0,
  "total_automations" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- Create EmailLog table to track sent emails
CREATE TABLE "public"."EmailLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "recipient" TEXT NOT NULL,
  "template_id" TEXT NOT NULL,
  "data" JSONB,
  "status" TEXT NOT NULL,
  "message_id" TEXT,
  "error_message" TEXT,
  "sent_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "automation_id" UUID,
  "automation_run_id" TEXT,
  
  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- Create foreign key constraints
ALTER TABLE "public"."AutomationRun" 
  ADD CONSTRAINT "AutomationRun_automation_id_fkey" 
  FOREIGN KEY ("automation_id") REFERENCES "public"."EmailAutomation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."EmailLog" 
  ADD CONSTRAINT "EmailLog_automation_id_fkey" 
  FOREIGN KEY ("automation_id") REFERENCES "public"."EmailAutomation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "EmailAutomation_active_idx" ON "public"."EmailAutomation" ("active");
CREATE INDEX "EmailAutomation_trigger_type_idx" ON "public"."EmailAutomation" ("trigger_type");
CREATE INDEX "EmailAutomation_next_run_idx" ON "public"."EmailAutomation" ("next_run");
CREATE INDEX "EmailLog_sent_at_idx" ON "public"."EmailLog" ("sent_at");
CREATE INDEX "EmailLog_automation_id_idx" ON "public"."EmailLog" ("automation_id");
CREATE INDEX "EmailLog_automation_run_id_idx" ON "public"."EmailLog" ("automation_run_id");
CREATE INDEX "AutomationRun_status_idx" ON "public"."AutomationRun" ("status");
CREATE INDEX "AutomationRun_start_time_idx" ON "public"."AutomationRun" ("start_time");

-- Add default templates
INSERT INTO "public"."EmailTemplate" ("name", "subject", "body", "description") 
VALUES 
  ('appointment-confirmation', 'Your Tattoo Appointment Confirmation', '<!DOCTYPE html><html><body><h1>Appointment Confirmation</h1><p>Dear {{client.first_name}},</p><p>Your tattoo appointment has been confirmed for {{appointment.date}} at {{appointment.time}}.</p><p>Thanks,<br>Ink 37</p></body></html>', 'Confirmation email sent when an appointment is created'),
  ('appointment-reminder', 'Reminder: Your Tattoo Appointment Tomorrow', '<!DOCTYPE html><html><body><h1>Appointment Reminder</h1><p>Dear {{client.first_name}},</p><p>This is a reminder that your tattoo appointment is scheduled for tomorrow, {{appointment.date}} at {{appointment.time}}.</p><p>Thanks,<br>Ink 37</p></body></html>', 'Reminder email sent 24 hours before appointment'),
  ('deposit-confirmation', 'Deposit Received for Your Tattoo Appointment', '<!DOCTYPE html><html><body><h1>Deposit Received</h1><p>Dear {{client.first_name}},</p><p>We have received your deposit payment for your upcoming tattoo appointment on {{appointment.date}}.</p><p>Thanks,<br>Ink 37</p></body></html>', 'Confirmation sent when deposit is marked as paid'),
  ('aftercare-instructions', 'Tattoo Aftercare Instructions', '<!DOCTYPE html><html><body><h1>Aftercare Instructions</h1><p>Dear {{client.first_name}},</p><p>Thank you for choosing Ink 37. Here are detailed instructions for taking care of your new tattoo.</p><ol><li>Keep the bandage on for at least 2 hours</li><li>Wash gently with soap and water</li><li>Apply a thin layer of aftercare ointment</li><li>Avoid swimming and direct sunlight</li></ol><p>Thanks,<br>Ink 37</p></body></html>', 'Aftercare instructions sent after appointment is completed'),
  ('review-request', 'How Was Your Tattoo Experience?', '<!DOCTYPE html><html><body><h1>We Value Your Feedback</h1><p>Dear {{client.first_name}},</p><p>We hope you are enjoying your new tattoo! We would appreciate if you could take a moment to share your experience by leaving a review.</p><p>Thanks,<br>Ink 37</p></body></html>', 'Review request sent 7 days after appointment completion'),
  ('client-reengagement', 'We'd Love to See You Again at Ink 37', '<!DOCTYPE html><html><body><h1>Missing You!</h1><p>Dear {{client.first_name}},</p><p>It's been a while since your last visit to Ink 37. We have exciting new designs and would love to see you again!</p><p>Thanks,<br>Ink 37</p></body></html>', 'Re-engagement email for customers who have not booked recently');