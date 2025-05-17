-- Create functions for auto-updating appointments and analytics
CREATE OR REPLACE FUNCTION update_appointment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification (this logs the notification request)
  INSERT INTO public."NotificationQueue" (
    recipient_id, 
    recipient_type, 
    title, 
    message, 
    action_url, 
    notification_type
  )
  VALUES (
    NEW."customerId", 
    'customer', 
    'Appointment Status Updated', 
    'Your appointment status has been updated to ' || NEW.status,
    '/client/appointments/' || NEW.id,
    'appointment_update'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track analytics automatically
CREATE OR REPLACE FUNCTION track_analytics()
RETURNS TRIGGER AS $$
DECLARE
  current_date TEXT;
BEGIN
  current_date := to_char(NOW(), 'YYYY-MM-DD');
  
  -- Handle different tables and operations for analytics
  IF TG_TABLE_NAME = 'Appointment' THEN
    IF TG_OP = 'INSERT' THEN
      -- Track new appointment
      INSERT INTO "Analytics" (date, metric, count)
      VALUES (current_date, 'appointments_created', 1)
      ON CONFLICT (date, metric) 
      DO UPDATE SET count = "Analytics".count + 1;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
      -- Track appointment status changes
      INSERT INTO "Analytics" (date, metric, count)
      VALUES (current_date, 'status_changed_to_' || NEW.status, 1)
      ON CONFLICT (date, metric) 
      DO UPDATE SET count = "Analytics".count + 1;
    END IF;
  ELSIF TG_TABLE_NAME = 'Customer' AND TG_OP = 'INSERT' THEN
    -- Track new customers
    INSERT INTO "Analytics" (date, metric, count)
    VALUES (current_date, 'customers_created', 1)
    ON CONFLICT (date, metric) 
    DO UPDATE SET count = "Analytics".count + 1;
  ELSIF TG_TABLE_NAME = 'Transaction' AND TG_OP = 'INSERT' THEN
    -- Track new transactions
    INSERT INTO "Analytics" (date, metric, count)
    VALUES (current_date, 'transactions_created', 1)
    ON CONFLICT (date, metric) 
    DO UPDATE SET count = "Analytics".count + 1;
    
    -- Track transaction amount
    INSERT INTO "Analytics" (date, metric, count)
    VALUES (current_date, 'revenue_cents', NEW.amount::INTEGER * 100)
    ON CONFLICT (date, metric) 
    DO UPDATE SET count = "Analytics".count + NEW.amount::INTEGER * 100;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create notes when significant actions happen
CREATE OR REPLACE FUNCTION auto_create_customer_note()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'Appointment' THEN
    IF TG_OP = 'INSERT' THEN
      -- Create note about new appointment
      INSERT INTO "Note" (id, content, type, "customerId")
      VALUES (
        gen_random_uuid(), 
        'Appointment scheduled for ' || to_char(NEW."startDate", 'YYYY-MM-DD HH:MI AM') || ' with status: ' || NEW.status,
        'system',
        NEW."customerId"
      );
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
      -- Create note about appointment status change
      INSERT INTO "Note" (id, content, type, "customerId")
      VALUES (
        gen_random_uuid(), 
        'Appointment status changed from ' || OLD.status || ' to ' || NEW.status,
        'system',
        NEW."customerId"
      );
    END IF;
  ELSIF TG_TABLE_NAME = 'Transaction' AND TG_OP = 'INSERT' THEN
    -- Create note about new payment
    INSERT INTO "Note" (id, content, type, "customerId")
    VALUES (
      gen_random_uuid(), 
      'Payment received: $' || NEW.amount::TEXT || ' via ' || NEW."paymentMethod",
      'system',
      NEW."customerId"
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS appointment_status_change_trigger ON "Appointment";
CREATE TRIGGER appointment_status_change_trigger
AFTER UPDATE OF status ON "Appointment"
FOR EACH ROW
EXECUTE FUNCTION update_appointment_status();

-- Analytics tracking triggers
DROP TRIGGER IF EXISTS appointment_analytics_trigger ON "Appointment";
CREATE TRIGGER appointment_analytics_trigger
AFTER INSERT OR UPDATE ON "Appointment"
FOR EACH ROW
EXECUTE FUNCTION track_analytics();

DROP TRIGGER IF EXISTS customer_analytics_trigger ON "Customer";
CREATE TRIGGER customer_analytics_trigger
AFTER INSERT ON "Customer"
FOR EACH ROW
EXECUTE FUNCTION track_analytics();

DROP TRIGGER IF EXISTS transaction_analytics_trigger ON "Transaction";
CREATE TRIGGER transaction_analytics_trigger
AFTER INSERT ON "Transaction"
FOR EACH ROW
EXECUTE FUNCTION track_analytics();

-- Auto note creation triggers
DROP TRIGGER IF EXISTS appointment_note_trigger ON "Appointment";
CREATE TRIGGER appointment_note_trigger
AFTER INSERT OR UPDATE OF status ON "Appointment"
FOR EACH ROW
EXECUTE FUNCTION auto_create_customer_note();

DROP TRIGGER IF EXISTS transaction_note_trigger ON "Transaction";
CREATE TRIGGER transaction_note_trigger
AFTER INSERT ON "Transaction"
FOR EACH ROW
EXECUTE FUNCTION auto_create_customer_note();

-- Create a notification queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS "NotificationQueue" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient_id" TEXT NOT NULL,
  "recipient_type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "action_url" TEXT,
  "notification_type" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_processed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "processed_at" TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for the notification queue
ALTER TABLE "NotificationQueue" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to see their own notifications" 
ON "NotificationQueue"
FOR SELECT
USING (
  auth.uid() = "recipient_id" OR
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Only admins can update notifications" 
ON "NotificationQueue"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "idx_notification_queue_recipient" ON "NotificationQueue" ("recipient_id", "is_read");