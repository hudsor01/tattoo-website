-- CreateFunction: Check appointment availability
CREATE OR REPLACE FUNCTION check_appointment_availability(
  p_artist_id TEXT,
  p_start_time TIMESTAMP,
  p_end_time TIMESTAMP,
  p_appointment_id TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_conflicts INTEGER := 0;
  v_artist_exists BOOLEAN;
  v_is_available BOOLEAN;
  v_conflict_details JSON;
  v_result JSON;
BEGIN
  -- Check if artist exists
  SELECT EXISTS(SELECT 1 FROM "Artist" WHERE id = p_artist_id) INTO v_artist_exists;
  
  IF NOT v_artist_exists THEN
    RETURN json_build_object(
      'isAvailable', FALSE,
      'error', 'Artist not found',
      'conflicts', NULL
    );
  END IF;
  
  -- Check if artist has conflicting appointments
  SELECT COUNT(*) INTO v_conflicts
  FROM "Appointment" a
  WHERE a."artistId" = p_artist_id
    AND a.status NOT IN ('cancelled', 'no_show')
    AND (
      (a."startDate" < p_end_time AND a."endDate" > p_start_time)
    )
    AND (p_appointment_id IS NULL OR a.id != p_appointment_id);
  
  -- Prepare conflict details if needed
  IF v_conflicts > 0 THEN
    SELECT json_agg(
      json_build_object(
        'id', a.id,
        'title', a.title,
        'startTime', a."startDate",
        'endTime', a."endDate"
      )
    ) INTO v_conflict_details
    FROM "Appointment" a
    WHERE a."artistId" = p_artist_id
      AND a.status NOT IN ('cancelled', 'no_show')
      AND (
        (a."startDate" < p_end_time AND a."endDate" > p_start_time)
      )
      AND (p_appointment_id IS NULL OR a.id != p_appointment_id);
  END IF;
  
  -- Set availability flag
  v_is_available := (v_conflicts = 0);
  
  -- Construct result
  v_result := json_build_object(
    'isAvailable', v_is_available,
    'conflicts', v_conflict_details
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- CreateFunction: Calculate pricing for tattoo services
CREATE OR REPLACE FUNCTION calculate_pricing(
  p_size TEXT,
  p_placement TEXT,
  p_complexity INTEGER DEFAULT 3, -- Scale 1-5
  p_artist_id TEXT DEFAULT NULL,
  p_custom_hourly_rate NUMERIC DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_base_rate NUMERIC := 150.00; -- Default hourly rate
  v_artist_rate NUMERIC;
  v_size_factor NUMERIC;
  v_placement_factor NUMERIC := 1.0;
  v_complexity_factor NUMERIC;
  v_estimated_hours NUMERIC;
  v_total_price NUMERIC;
  v_deposit_amount NUMERIC;
  v_price_breakdown JSON;
BEGIN
  -- Get artist rate if specified
  IF p_artist_id IS NOT NULL THEN
    SELECT COALESCE(a."hourlyRate", v_base_rate)
    INTO v_artist_rate
    FROM "Artist" a
    WHERE a.id = p_artist_id;
  ELSE
    v_artist_rate := COALESCE(p_custom_hourly_rate, v_base_rate);
  END IF;
  
  -- Set size factor based on tattoo size
  CASE p_size
    WHEN 'tiny' THEN v_size_factor := 0.5;
    WHEN 'small' THEN v_size_factor := 1.0;
    WHEN 'medium' THEN v_size_factor := 2.0;
    WHEN 'large' THEN v_size_factor := 3.5;
    WHEN 'extra_large' THEN v_size_factor := 5.0;
    ELSE v_size_factor := 1.0;
  END CASE;
  
  -- Adjust for placement difficulty
  CASE p_placement
    WHEN 'arm' THEN v_placement_factor := 1.0;
    WHEN 'leg' THEN v_placement_factor := 1.0;
    WHEN 'back' THEN v_placement_factor := 1.2;
    WHEN 'chest' THEN v_placement_factor := 1.2;
    WHEN 'ribs' THEN v_placement_factor := 1.5;
    WHEN 'hand' THEN v_placement_factor := 1.3;
    WHEN 'foot' THEN v_placement_factor := 1.3;
    WHEN 'head' THEN v_placement_factor := 1.8;
    WHEN 'face' THEN v_placement_factor := 2.0;
    ELSE v_placement_factor := 1.0;
  END CASE;
  
  -- Calculate complexity factor (1-5 scale)
  v_complexity_factor := 0.8 + (p_complexity * 0.1);
  
  -- Calculate estimated hours
  v_estimated_hours := v_size_factor * v_placement_factor * v_complexity_factor;
  
  -- Calculate total price
  v_total_price := CEIL(v_artist_rate * v_estimated_hours / 10) * 10; -- Round to nearest $10
  
  -- Calculate deposit (30% of total, min $50)
  v_deposit_amount := GREATEST(CEIL(v_total_price * 0.3 / 10) * 10, 50);
  
  -- Create price breakdown
  v_price_breakdown := json_build_object(
    'base_hourly_rate', v_artist_rate,
    'estimated_hours', v_estimated_hours,
    'size_factor', v_size_factor,
    'placement_factor', v_placement_factor,
    'complexity_factor', v_complexity_factor,
    'totalPrice', v_total_price,
    'deposit_amount', v_deposit_amount
  );
  
  RETURN v_price_breakdown;
END;
$$ LANGUAGE plpgsql;

-- CreateFunction: Validate customer data
CREATE OR REPLACE FUNCTION validate_customer_data(
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_birthdate DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_errors TEXT[] := '{}';
  v_normalized_phone TEXT;
  v_potential_duplicates JSON;
  v_is_valid BOOLEAN := TRUE;
  v_normalized_data JSON;
BEGIN
  -- Validate required fields
  IF p_first_name IS NULL OR LENGTH(TRIM(p_first_name)) = 0 THEN
    v_errors := array_append(v_errors, 'First name is required');
    v_is_valid := FALSE;
  END IF;
  
  IF p_last_name IS NULL OR LENGTH(TRIM(p_last_name)) = 0 THEN
    v_errors := array_append(v_errors, 'Last name is required');
    v_is_valid := FALSE;
  END IF;
  
  -- At least one contact method required
  IF (p_email IS NULL OR LENGTH(TRIM(p_email)) = 0) AND 
     (p_phone IS NULL OR LENGTH(TRIM(p_phone)) = 0) THEN
    v_errors := array_append(v_errors, 'Either email or phone is required');
    v_is_valid := FALSE;
  END IF;
  
  -- Validate email format if provided
  IF p_email IS NOT NULL AND LENGTH(TRIM(p_email)) > 0 THEN
    IF p_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
      v_errors := array_append(v_errors, 'Invalid email format');
      v_is_valid := FALSE;
    END IF;
  END IF;
  
  -- Normalize and validate phone if provided
  IF p_phone IS NOT NULL AND LENGTH(TRIM(p_phone)) > 0 THEN
    -- Simple normalization: remove non-digit characters
    v_normalized_phone := REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');
    
    -- Check if we have at least 10 digits for a valid phone
    IF LENGTH(v_normalized_phone) < 10 THEN
      v_errors := array_append(v_errors, 'Phone number must have at least 10 digits');
      v_is_valid := FALSE;
    END IF;
  ELSE
    v_normalized_phone := NULL;
  END IF;
  
  -- Check for minimum age if birthdate provided
  IF p_birthdate IS NOT NULL THEN
    IF p_birthdate > CURRENT_DATE - INTERVAL '18 years' THEN
      v_errors := array_append(v_errors, 'Customer must be at least 18 years old');
      v_is_valid := FALSE;
    END IF;
  END IF;
  
  -- Check for potential duplicates
  IF p_email IS NOT NULL AND LENGTH(TRIM(p_email)) > 0 THEN
    SELECT json_agg(
      json_build_object(
        'id', c.id,
        'firstName', c."firstName",
        'lastName', c."lastName",
        'email', c.email,
        'phone', c.phone
      )
    ) INTO v_potential_duplicates
    FROM "Customer" c
    WHERE c.email = p_email;
  ELSIF v_normalized_phone IS NOT NULL THEN
    SELECT json_agg(
      json_build_object(
        'id', c.id,
        'firstName', c."firstName",
        'lastName', c."lastName",
        'email', c.email,
        'phone', c.phone
      )
    ) INTO v_potential_duplicates
    FROM "Customer" c
    WHERE REGEXP_REPLACE(c.phone, '[^0-9]', '', 'g') = v_normalized_phone;
  END IF;
  
  -- Create normalized data structure
  v_normalized_data := json_build_object(
    'firstName', INITCAP(TRIM(p_first_name)),
    'lastName', INITCAP(TRIM(p_last_name)),
    'email', LOWER(TRIM(p_email)),
    'phone', v_normalized_phone,
    'birthdate', p_birthdate
  );
  
  -- Construct final result
  RETURN json_build_object(
    'is_valid', v_is_valid,
    'errors', v_errors,
    'normalized_data', v_normalized_data,
    'potential_duplicates', v_potential_duplicates
  );
END;
$$ LANGUAGE plpgsql;

-- CreateFunction: Enforce cancellation policy
CREATE OR REPLACE FUNCTION enforce_cancellation_policy(
  p_appointment_id TEXT,
  p_cancellation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  p_reason_code TEXT DEFAULT 'customer_request'
)
RETURNS JSON AS $$
DECLARE
  v_appointment RECORD;
  v_days_until INTEGER;
  v_fee_percentage INTEGER := 0;
  v_fee_amount NUMERIC := 0;
  v_allow_reschedule BOOLEAN := TRUE;
  v_deposit_refundable BOOLEAN := TRUE;
  v_policy_applied TEXT;
BEGIN
  -- Get appointment details
  SELECT * INTO v_appointment
  FROM "Appointment"
  WHERE id = p_appointment_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Appointment not found'
    );
  END IF;
  
  -- Check if appointment is already cancelled
  IF v_appointment.status = 'cancelled' THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Appointment is already cancelled'
    );
  END IF;
  
  -- Calculate days until appointment
  v_days_until := EXTRACT(DAY FROM (v_appointment."startDate" - p_cancellation_date));
  
  -- Apply policy based on notice period and reason
  IF p_reason_code IN ('medical', 'emergency', 'studio_request') THEN
    -- No fee for medical or emergencies
    v_fee_percentage := 0;
    v_deposit_refundable := TRUE;
    v_allow_reschedule := TRUE;
    v_policy_applied := 'exception_' || p_reason_code;
    
  ELSIF v_days_until <= 1 THEN
    -- Less than 24 hours notice
    v_fee_percentage := 100;
    v_deposit_refundable := FALSE;
    v_allow_reschedule := FALSE;
    v_policy_applied := 'late_cancellation';
    
  ELSIF v_days_until <= 3 THEN
    -- 1-3 days notice
    v_fee_percentage := 50;
    v_deposit_refundable := FALSE;
    v_allow_reschedule := TRUE;
    v_policy_applied := 'short_notice';
    
  ELSIF v_days_until <= 7 THEN
    -- 3-7 days notice
    v_fee_percentage := 25;
    v_deposit_refundable := TRUE;
    v_allow_reschedule := TRUE;
    v_policy_applied := 'standard_notice';
    
  ELSE
    -- More than 7 days notice
    v_fee_percentage := 0;
    v_deposit_refundable := TRUE;
    v_allow_reschedule := TRUE;
    v_policy_applied := 'advance_notice';
  END IF;
  
  -- Calculate fee amount based on deposit
  IF v_appointment.deposit IS NOT NULL AND v_appointment.deposit > 0 THEN
    v_fee_amount := (v_appointment.deposit * v_fee_percentage) / 100;
  END IF;
  
  -- Update appointment status
  UPDATE "Appointment"
  SET 
    status = 'cancelled',
    "updatedAt" = p_cancellation_date
  WHERE id = p_appointment_id;
  
  -- Create note about cancellation
  INSERT INTO "Note" (
    id, 
    content, 
    type, 
    "customerId"
  )
  VALUES (
    gen_random_uuid(),
    'Appointment cancelled on ' || p_cancellation_date || 
    ' with reason: ' || p_reason_code || 
    '. Policy applied: ' || v_policy_applied || 
    '. Fee: $' || v_fee_amount || '.',
    'system',
    v_appointment."customerId"
  );
  
  -- Return result with policy details
  RETURN json_build_object(
    'success', TRUE,
    'appointmentId', p_appointment_id,
    'cancellation_date', p_cancellation_date,
    'days_notice', v_days_until,
    'reason_code', p_reason_code,
    'policy_applied', v_policy_applied,
    'fee_percentage', v_fee_percentage,
    'fee_amount', v_fee_amount,
    'deposit_refundable', v_deposit_refundable,
    'allow_reschedule', v_allow_reschedule
  );
END;
$$ LANGUAGE plpgsql;

-- Create new function to calculate appointment duration
CREATE OR REPLACE FUNCTION calculate_appointment_duration(
  p_size TEXT,
  p_complexity INTEGER DEFAULT 3
)
RETURNS INTERVAL AS $$
DECLARE
  v_base_minutes INTEGER := 60; -- Base duration = 1 hour
  v_size_factor NUMERIC;
  v_complexity_factor NUMERIC;
  v_total_minutes INTEGER;
BEGIN
  -- Determine size factor
  CASE p_size
    WHEN 'tiny' THEN v_size_factor := 0.5;
    WHEN 'small' THEN v_size_factor := 1.0;
    WHEN 'medium' THEN v_size_factor := 2.0;
    WHEN 'large' THEN v_size_factor := 3.5;
    WHEN 'extra_large' THEN v_size_factor := 5.0;
    ELSE v_size_factor := 1.0;
  END CASE;
  
  -- Calculate complexity factor (1-5 scale)
  v_complexity_factor := 0.8 + (p_complexity * 0.1);
  
  -- Calculate total minutes with 15-minute intervals
  v_total_minutes := CEIL(v_base_minutes * v_size_factor * v_complexity_factor / 15) * 15;
  
  -- Return as interval
  RETURN (v_total_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Create helper function to generate appointment end time from start time and parameters
CREATE OR REPLACE FUNCTION generate_appointment_end_time(
  p_start_time TIMESTAMP,
  p_size TEXT,
  p_complexity INTEGER DEFAULT 3
)
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN p_start_time + calculate_appointment_duration(p_size, p_complexity);
END;
$$ LANGUAGE plpgsql;

-- Create API function for scheduling appointments with business logic
CREATE OR REPLACE FUNCTION schedule_appointment(
  p_title TEXT,
  p_description TEXT,
  p_start_date TIMESTAMP,
  p_customer_id TEXT,
  p_artist_id TEXT,
  p_tattoo_size TEXT DEFAULT 'medium',
  p_complexity INTEGER DEFAULT 3,
  p_location TEXT DEFAULT 'main_studio'
)
RETURNS JSON AS $$
DECLARE
  v_end_date TIMESTAMP;
  v_pricing JSON;
  v_availability JSON;
  v_appointment_id TEXT;
  v_deposit NUMERIC;
  v_total_price NUMERIC;
BEGIN
  -- Calculate end time based on size and complexity
  v_end_date := generate_appointment_end_time(p_start_date, p_tattoo_size, p_complexity);
  
  -- Check artist availability
  v_availability := check_appointment_availability(p_artist_id, p_start_date, v_end_date);
  
  -- If artist is not available, return error
  IF NOT (v_availability->>'isAvailable')::BOOLEAN THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Artist is not available at the requested time',
      'conflicts', v_availability->'conflicts'
    );
  END IF;
  
  -- Calculate pricing
  v_pricing := calculate_pricing(p_tattoo_size, 'arm', p_complexity, p_artist_id);
  v_deposit := (v_pricing->>'deposit_amount')::NUMERIC;
  v_total_price := (v_pricing->>'totalPrice')::NUMERIC;
  
  -- Create appointment
  INSERT INTO "Appointment" (
    id,
    title,
    description,
    "startDate",
    "endDate",
    status,
    deposit,
    "totalPrice",
    location,
    "customerId",
    "artistId",
    "createdAt",
    "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    p_title,
    p_description,
    p_start_date,
    v_end_date,
    'scheduled', -- Default status
    v_deposit,
    v_total_price,
    p_location,
    p_customer_id,
    p_artist_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  RETURNING id INTO v_appointment_id;
  
  -- Create note about appointment
  INSERT INTO "Note" (
    id,
    content,
    type,
    "customerId"
  ) VALUES (
    gen_random_uuid(),
    'Appointment scheduled for ' || p_start_date || ' to ' || v_end_date || ' with deposit amount $' || v_deposit,
    'system',
    p_customer_id
  );
  
  -- Return success with appointment details
  RETURN json_build_object(
    'success', TRUE,
    'appointmentId', v_appointment_id,
    'start_date', p_start_date,
    'end_date', v_end_date,
    'deposit', v_deposit,
    'totalPrice', v_total_price,
    'pricing_details', v_pricing
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to handle rescheduling appointments
CREATE OR REPLACE FUNCTION reschedule_appointment(
  p_appointment_id TEXT,
  p_new_start_date TIMESTAMP,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_appointment RECORD;
  v_duration INTERVAL;
  v_new_end_date TIMESTAMP;
  v_availability JSON;
BEGIN
  -- Get appointment details
  SELECT * INTO v_appointment
  FROM "Appointment"
  WHERE id = p_appointment_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Appointment not found'
    );
  END IF;
  
  -- Calculate appointment duration
  v_duration := v_appointment."endDate" - v_appointment."startDate";
  
  -- Calculate new end date
  v_new_end_date := p_new_start_date + v_duration;
  
  -- Check artist availability
  v_availability := check_appointment_availability(
    v_appointment."artistId", 
    p_new_start_date, 
    v_new_end_date,
    p_appointment_id
  );
  
  -- If artist is not available, return error
  IF NOT (v_availability->>'isAvailable')::BOOLEAN THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Artist is not available at the requested time',
      'conflicts', v_availability->'conflicts'
    );
  END IF;
  
  -- Update appointment dates
  UPDATE "Appointment"
  SET 
    "startDate" = p_new_start_date,
    "endDate" = v_new_end_date,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE id = p_appointment_id;
  
  -- Create note about rescheduling
  INSERT INTO "Note" (
    id,
    content,
    type,
    "customerId"
  ) VALUES (
    gen_random_uuid(),
    'Appointment rescheduled from ' || v_appointment."startDate" || ' to ' || p_new_start_date || 
    CASE WHEN p_reason IS NOT NULL THEN '. Reason: ' || p_reason ELSE '' END,
    'system',
    v_appointment."customerId"
  );
  
  -- Return success with new appointment details
  RETURN json_build_object(
    'success', TRUE,
    'appointmentId', p_appointment_id,
    'previous_start_date', v_appointment."startDate",
    'previous_end_date', v_appointment."endDate",
    'new_start_date', p_new_start_date,
    'new_end_date', v_new_end_date
  );
END;
$$ LANGUAGE plpgsql;

-- Add indexes to support function performance
CREATE INDEX IF NOT EXISTS "idx_appointment_artist_dates" 
ON "Appointment" ("artistId", "startDate", "endDate", status);

-- Grant execute permissions to necessary roles
-- (Assuming default role 'authenticated' from auth providers like Supabase)
GRANT EXECUTE ON FUNCTION check_appointment_availability TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_pricing TO authenticated;
GRANT EXECUTE ON FUNCTION validate_customer_data TO authenticated;
GRANT EXECUTE ON FUNCTION enforce_cancellation_policy TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_appointment_duration TO authenticated;
GRANT EXECUTE ON FUNCTION generate_appointment_end_time TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_appointment TO authenticated;
GRANT EXECUTE ON FUNCTION reschedule_appointment TO authenticated;
