-- Add indexes for customer search queries
CREATE INDEX IF NOT EXISTS "Customer_firstName_idx" ON "public"."Customer"("firstName");
CREATE INDEX IF NOT EXISTS "Customer_lastName_idx" ON "public"."Customer"("lastName");
CREATE INDEX IF NOT EXISTS "Customer_email_idx" ON "public"."Customer"("email");
CREATE INDEX IF NOT EXISTS "Customer_phone_idx" ON "public"."Customer"("phone");
CREATE INDEX IF NOT EXISTS "Customer_createdAt_idx" ON "public"."Customer"("createdAt");

-- Add index for appointment date range queries
CREATE INDEX IF NOT EXISTS "Appointment_startDate_idx" ON "public"."Appointment"("startDate");
CREATE INDEX IF NOT EXISTS "Appointment_endDate_idx" ON "public"."Appointment"("endDate");
CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "public"."Appointment"("status");
CREATE INDEX IF NOT EXISTS "Appointment_customerId_idx" ON "public"."Appointment"("customerId");
CREATE INDEX IF NOT EXISTS "Appointment_artistId_idx" ON "public"."Appointment"("artistId");

-- Add indexes for booking queries
CREATE INDEX IF NOT EXISTS "Booking_createdAt_idx" ON "public"."Booking"("createdAt");
CREATE INDEX IF NOT EXISTS "Booking_preferredDate_idx" ON "public"."Booking"("preferredDate");
CREATE INDEX IF NOT EXISTS "Booking_email_idx" ON "public"."Booking"("email");
CREATE INDEX IF NOT EXISTS "Booking_phone_idx" ON "public"."Booking"("phone");

-- Add indexes for payment queries
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "public"."Payment"("createdAt");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "public"."Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_customerEmail_idx" ON "public"."Payment"("customerEmail");

-- Add indexes for interaction queries
CREATE INDEX IF NOT EXISTS "Interaction_createdAt_idx" ON "public"."Interaction"("createdAt");
CREATE INDEX IF NOT EXISTS "Interaction_customerId_idx" ON "public"."Interaction"("customerId");
CREATE INDEX IF NOT EXISTS "Interaction_type_idx" ON "public"."Interaction"("type");

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "Customer_firstName_lastName_idx" ON "public"."Customer"("firstName", "lastName");
CREATE INDEX IF NOT EXISTS "Appointment_customerId_startDate_idx" ON "public"."Appointment"("customerId", "startDate");
CREATE INDEX IF NOT EXISTS "Appointment_artistId_startDate_idx" ON "public"."Appointment"("artistId", "startDate");