-- Proper RLS implementation with security best practices and existence checks

-- First, ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Drop any existing policies to start fresh
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('Customer', 'Booking', 'Appointment', 'Payment', 'TattooDesign', 'Note', 'Gallery')
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Create secure auth helper functions
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', true), '')::TEXT;
$$;

CREATE OR REPLACE FUNCTION auth.email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.email', true), '')::TEXT;
$$;

-- Create admin check with proper casting
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE(auth.role() = 'admin', false);
END;
$$;

-- Create client check with proper email verification
CREATE OR REPLACE FUNCTION public.is_own_data()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN auth.email() IS NOT NULL;
END;
$$;

-- Enable RLS on existing tables
DO $$
BEGIN
  -- Customer table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Customer') THEN
    ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "admin_all_customers" ON "Customer"
      FOR ALL
      TO authenticated
      USING (is_admin());
    
    CREATE POLICY "customers_own_data" ON "Customer"
      FOR SELECT
      TO authenticated
      USING (email = auth.email());
  END IF;
  
  -- Booking table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Booking') THEN
    ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "admin_all_bookings" ON "Booking"
      FOR ALL
      TO authenticated
      USING (is_admin());
    
    CREATE POLICY "users_own_bookings" ON "Booking"
      FOR SELECT
      TO authenticated
      USING (email = auth.email());
    
    CREATE POLICY "users_create_bookings" ON "Booking"
      FOR INSERT
      TO authenticated
      WITH CHECK (email = auth.email());
  END IF;
  
  -- Appointment table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Appointment') THEN
    ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "admin_all_appointments" ON "Appointment"
      FOR ALL
      TO authenticated
      USING (is_admin());
    
    CREATE POLICY "users_own_appointments" ON "Appointment"
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM "Customer" c
          WHERE c.id = "Appointment"."customerId"
          AND c.email = auth.email()
        )
      );
  END IF;
  
  -- Payment table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Payment') THEN
    ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "admin_all_payments" ON "Payment"
      FOR ALL
      TO authenticated
      USING (is_admin());
    
    CREATE POLICY "users_own_payments" ON "Payment"
      FOR SELECT
      TO authenticated
      USING ("customerEmail" = auth.email());
  END IF;
  
  -- TattooDesign table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'TattooDesign') THEN
    ALTER TABLE "TattooDesign" ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "admin_all_designs" ON "TattooDesign"
      FOR ALL
      TO authenticated
      USING (is_admin());
    
    CREATE POLICY "users_own_designs" ON "TattooDesign"
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM "Customer" c
          WHERE c.id = "TattooDesign"."customerId"
          AND c.email = auth.email()
        )
      );
  END IF;
  
  -- Gallery table (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Gallery') THEN
    ALTER TABLE "Gallery" ENABLE ROW LEVEL SECURITY;
    
    -- Public read access for gallery items
    CREATE POLICY "public_gallery_read" ON "Gallery"
      FOR SELECT
      TO anon, authenticated
      USING (true);
    
    -- Admin write access
    CREATE POLICY "admin_gallery_write" ON "Gallery"
      FOR ALL
      TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_own_data() TO authenticated;

-- Create secure indexes
CREATE INDEX IF NOT EXISTS idx_customer_email_secure ON "Customer"(email);
CREATE INDEX IF NOT EXISTS idx_booking_email_secure ON "Booking"(email);
CREATE INDEX IF NOT EXISTS idx_payment_email_secure ON "Payment"("customerEmail");

-- Add comment for documentation
COMMENT ON SCHEMA public IS 'Secure RLS implementation for tattoo website with proper existence checks';