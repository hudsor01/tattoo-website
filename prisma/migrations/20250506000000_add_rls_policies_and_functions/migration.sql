-- Enable RLS on relevant tables
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;

-- Create profiles table to store user roles
CREATE TABLE IF NOT EXISTS "Profile" (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'customer',
  name TEXT,
  email TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profiles when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Profile" (id, role, email)
  VALUES (new.id, 'customer', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registrations
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "Profile"
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Define RLS policies for Booking table
CREATE POLICY "Admins can do anything with bookings"
ON "Booking" FOR ALL
USING (is_admin());

CREATE POLICY "Customers can view their own bookings"
ON "Booking" FOR SELECT
USING (email = auth.jwt() ->> 'email');

-- Define RLS policies for Appointment table
CREATE POLICY "Admins can do anything with appointments"
ON "Appointment" FOR ALL
USING (is_admin());

CREATE POLICY "Customers can view their own appointments"
ON "Appointment" FOR SELECT
USING ("customerId" IN (
  SELECT id FROM "Customer" WHERE email = auth.jwt() ->> 'email'
));

-- Define RLS policies for Payment table
CREATE POLICY "Admins can do anything with payments"
ON "Payment" FOR ALL
USING (is_admin());

CREATE POLICY "Customers can view their own payments"
ON "Payment" FOR SELECT
USING ("customerEmail" = auth.jwt() ->> 'email');

-- Create function for booking creation with validation
CREATE OR REPLACE FUNCTION create_appointment(
  customer_id INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  serviceType TEXT,
  details TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  overlapping_count INTEGER;
  new_appointment_id INTEGER;
  customer_record RECORD;
BEGIN
  -- Get customer info
  SELECT * INTO customer_record FROM "Customer" WHERE id = customer_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Customer not found');
  END IF;

  -- Check for overlapping appointments
  SELECT COUNT(*) INTO overlapping_count
  FROM "Appointment"
  WHERE tsrange(start_date, end_date) && tsrange(start_date, end_date)
  AND status <> 'cancelled';
  
  IF overlapping_count > 0 THEN
    RETURN jsonb_build_object('error', 'Time slot not available');
  END IF;
  
  -- Create appointment
  INSERT INTO "Appointment" (
    "customerId", 
    "startDate", 
    "endDate", 
    "serviceType", 
    "details",
    "status"
  )
  VALUES (
    customer_id, 
    start_date, 
    end_date, 
    serviceType, 
    details,
    'scheduled'
  )
  RETURNING id INTO new_appointment_id;
  
  -- Return success with appointment ID
  RETURN jsonb_build_object(
    'success', true,
    'appointmentId', new_appointment_id
  );
END;
$$;

-- Create function to check available time slots
CREATE OR REPLACE FUNCTION get_available_slots(
  date_to_check DATE,
  duration_minutes INTEGER DEFAULT 60
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  start_hour INTEGER := 9; -- 9 AM
  end_hour INTEGER := 18;  -- 6 PM
  slot_interval INTERVAL := (duration_minutes || ' minutes')::INTERVAL;
  current_slot TIMESTAMP;
  available_slots JSONB := '[]'::JSONB;
  isAvailable BOOLEAN;
BEGIN
  -- Loop through each hour of the day
  FOR hour IN start_hour..end_hour-1 LOOP
    -- Create timestamp for current slot
    current_slot := (date_to_check + (hour || ' hours')::INTERVAL)::TIMESTAMP;
    
    -- Check if slot is available
    SELECT COUNT(*) = 0 INTO isAvailable
    FROM "Appointment"
    WHERE tsrange(current_slot, current_slot + slot_interval) && 
          tsrange("startDate", "endDate")
    AND status <> 'cancelled';
    
    -- Add available slot to result
    IF isAvailable THEN
      available_slots := available_slots || jsonb_build_object(
        'startTime', current_slot,
        'endTime', current_slot + slot_interval
      );
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('available_slots', available_slots);
END;
$$;