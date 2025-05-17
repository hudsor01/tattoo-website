-- Fix database triggers properly without reserved keywords

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_appointment_status() CASCADE;
DROP FUNCTION IF EXISTS track_analytics() CASCADE;
DROP FUNCTION IF EXISTS auto_create_customer_note() CASCADE;

-- Create notification queue table first
CREATE TABLE IF NOT EXISTS "NotificationQueue" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient_id" UUID NOT NULL,
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

-- Create analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Analytics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "date" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("date", "metric")
);

-- Update appointment status function
CREATE OR REPLACE FUNCTION update_appointment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO "NotificationQueue" (
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
      format('Your appointment status has been updated to %s', NEW.status),
      format('/client/appointments/%s', NEW.id),
      'appointment_update'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Analytics tracking function with fixed variable name
CREATE OR REPLACE FUNCTION track_analytics()
RETURNS TRIGGER AS $$
DECLARE
  analytics_date TEXT;
  metric_name TEXT;
BEGIN
  analytics_date := to_char(NOW(), 'YYYY-MM-DD');
  
  -- Handle different tables and operations
  CASE TG_TABLE_NAME
    WHEN 'Appointment' THEN
      IF TG_OP = 'INSERT' THEN
        metric_name := 'appointments_created';
      ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        metric_name := format('status_changed_to_%s', NEW.status);
      ELSE
        RETURN NULL; -- No tracking needed
      END IF;
      
    WHEN 'Customer' THEN
      IF TG_OP = 'INSERT' THEN
        metric_name := 'customers_created';
      ELSE
        RETURN NULL;
      END IF;
      
    WHEN 'Transaction' THEN
      IF TG_OP = 'INSERT' THEN
        -- Track transaction count
        INSERT INTO "Analytics" (date, metric, count)
        VALUES (analytics_date, 'transactions_created', 1)
        ON CONFLICT (date, metric) 
        DO UPDATE SET count = "Analytics".count + 1;
        
        -- Track revenue separately
        INSERT INTO "Analytics" (date, metric, count)
        VALUES (analytics_date, 'revenue_cents', (NEW.amount * 100)::INTEGER)
        ON CONFLICT (date, metric) 
        DO UPDATE SET count = "Analytics".count + (NEW.amount * 100)::INTEGER;
        
        RETURN NULL;
      ELSE
        RETURN NULL;
      END IF;
      
    ELSE
      RETURN NULL;
  END CASE;
  
  -- Insert analytics record
  IF metric_name IS NOT NULL THEN
    INSERT INTO "Analytics" (date, metric, count)
    VALUES (analytics_date, metric_name, 1)
    ON CONFLICT (date, metric) 
    DO UPDATE SET count = "Analytics".count + 1;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Auto-create customer notes function
CREATE OR REPLACE FUNCTION auto_create_customer_note()
RETURNS TRIGGER AS $$
DECLARE
  note_content TEXT;
BEGIN
  -- Determine note content based on table and operation
  CASE TG_TABLE_NAME
    WHEN 'Appointment' THEN
      IF TG_OP = 'INSERT' THEN
        note_content := format('Appointment scheduled for %s with status: %s', 
          to_char(NEW."startDate", 'Mon DD, YYYY at HH:MI AM'), 
          NEW.status);
      ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        note_content := format('Appointment status changed from %s to %s', 
          OLD.status, 
          NEW.status);
      ELSE
        RETURN NULL;
      END IF;
      
    WHEN 'Transaction' THEN
      IF TG_OP = 'INSERT' THEN
        note_content := format('Payment received: $%s via %s', 
          NEW.amount::TEXT, 
          NEW."paymentMethod");
      ELSE
        RETURN NULL;
      END IF;
      
    ELSE
      RETURN NULL;
  END CASE;
  
  -- Insert note if content was set
  IF note_content IS NOT NULL THEN
    INSERT INTO "Note" (id, content, type, "customerId", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(), 
      note_content,
      'system',
      CASE 
        WHEN TG_TABLE_NAME = 'Appointment' THEN NEW."customerId"
        WHEN TG_TABLE_NAME = 'Transaction' THEN NEW."customerId"
      END,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER appointment_status_change_trigger
  AFTER UPDATE OF status ON "Appointment"
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_status();

CREATE TRIGGER appointment_analytics_trigger
  AFTER INSERT OR UPDATE ON "Appointment"
  FOR EACH ROW
  EXECUTE FUNCTION track_analytics();

CREATE TRIGGER customer_analytics_trigger
  AFTER INSERT ON "Customer"
  FOR EACH ROW
  EXECUTE FUNCTION track_analytics();

-- Only create Transaction triggers if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Transaction') THEN
    CREATE TRIGGER transaction_analytics_trigger
      AFTER INSERT ON "Transaction"
      FOR EACH ROW
      EXECUTE FUNCTION track_analytics();
    
    CREATE TRIGGER transaction_note_trigger
      AFTER INSERT ON "Transaction"
      FOR EACH ROW
      EXECUTE FUNCTION auto_create_customer_note();
  END IF;
END $$;

CREATE TRIGGER appointment_note_trigger
  AFTER INSERT OR UPDATE OF status ON "Appointment"
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_customer_note();

-- Enable RLS on new tables
ALTER TABLE "NotificationQueue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Analytics" ENABLE ROW LEVEL SECURITY;

-- NotificationQueue policies
CREATE POLICY "users_see_own_notifications" ON "NotificationQueue"
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM "User"
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "admins_manage_notifications" ON "NotificationQueue"
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Analytics policies (admin only)
CREATE POLICY "admin_analytics_access" ON "Analytics"
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Create indexes
CREATE INDEX idx_notification_queue_recipient ON "NotificationQueue" (recipient_id, is_read);
CREATE INDEX idx_analytics_date_metric ON "Analytics" (date, metric);

-- Add comments
COMMENT ON FUNCTION update_appointment_status() IS 'Creates notifications when appointment status changes';
COMMENT ON FUNCTION track_analytics() IS 'Tracks analytics for various database operations';
COMMENT ON FUNCTION auto_create_customer_note() IS 'Automatically creates notes for significant customer events';