-- Migration for Google Calendar integration

-- Add a column to track Google Calendar event IDs
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Create a queue table for calendar sync operations
CREATE TABLE IF NOT EXISTS calendar_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for the queue table
ALTER TABLE calendar_sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view calendar_sync_queue"
  ON calendar_sync_queue
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create function to queue calendar sync operations
CREATE OR REPLACE FUNCTION queue_calendar_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- For new appointments, queue a 'create' operation
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO calendar_sync_queue (appointment_id, action)
    VALUES (NEW.id, 'create');
    
  -- For updated appointments, queue an 'update' operation
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Only queue if relevant fields changed
    IF (
      NEW.title != OLD.title OR 
      NEW.description != OLD.description OR 
      NEW.start_time != OLD.start_time OR 
      NEW.end_time != OLD.end_time OR 
      NEW.status != OLD.status OR 
      NEW.deposit_paid != OLD.deposit_paid
    ) THEN
      INSERT INTO calendar_sync_queue (appointment_id, action)
      VALUES (NEW.id, 'update');
    END IF;
    
  -- For deleted appointments, queue a 'delete' operation
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO calendar_sync_queue (appointment_id, action)
    VALUES (OLD.id, 'delete');
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to queue calendar sync operations
DROP TRIGGER IF EXISTS appointments_insert_calendar_sync ON appointments;
CREATE TRIGGER appointments_insert_calendar_sync
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION queue_calendar_sync();

DROP TRIGGER IF EXISTS appointments_update_calendar_sync ON appointments;
CREATE TRIGGER appointments_update_calendar_sync
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION queue_calendar_sync();

DROP TRIGGER IF EXISTS appointments_delete_calendar_sync ON appointments;
CREATE TRIGGER appointments_delete_calendar_sync
AFTER DELETE ON appointments
FOR EACH ROW
EXECUTE FUNCTION queue_calendar_sync();