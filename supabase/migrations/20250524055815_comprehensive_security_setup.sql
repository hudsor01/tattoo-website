-- Comprehensive Security Setup Migration
-- This migration adds proper RLS policies, triggers, indexes, and functions for security

-- =====
-- ENABLE RLS ON ALL SENSITIVE TABLES
-- =====

-- Enable RLS on all customer and business-sensitive tables
ALTER TABLE public."Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TattooDesign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Testimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Interaction" ENABLE ROW LEVEL SECURITY;

-- Keep these tables accessible for authenticated users (admin functions)
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Artist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailAutomation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AutomationRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NotificationQueue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tag" ENABLE ROW LEVEL SECURITY;

-- =====
-- HELPER FUNCTIONS FOR RLS
-- =====

-- Function to check if user is admin via BetterAuth integration
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_role text;
BEGIN
  -- Get the email from auth.jwt()
  user_email := auth.jwt() ->> 'email';
  
  -- If no email, return false
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user exists in our BetterAuth users table with admin role
  SELECT "role" INTO user_role
  FROM public."User" 
  WHERE "email" = user_email;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN auth.jwt() IS NOT NULL;
END;
$$;

-- Function to get current user email
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN auth.jwt() ->> 'email';
END;
$$;

-- =====
-- RLS POLICIES FOR CUSTOMER DATA
-- =====

-- Customer table: Only admins can access
CREATE POLICY "Admin access to customers" ON public."Customer"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Appointments: Only admins can access
CREATE POLICY "Admin access to appointments" ON public."Appointment"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Bookings: Only admins can access
CREATE POLICY "Admin access to bookings" ON public."Booking"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Contacts: Only admins can access
CREATE POLICY "Admin access to contacts" ON public."Contact"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Payments: Only admins can access
CREATE POLICY "Admin access to payments" ON public."Payment"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Transactions: Only admins can access
CREATE POLICY "Admin access to transactions" ON public."Transaction"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- =====
-- RLS POLICIES FOR CONTENT DATA
-- =====

-- Tattoo Designs: Admins full access, public read-only
CREATE POLICY "Admin full access to tattoo designs" ON public."TattooDesign"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read tattoo designs" ON public."TattooDesign"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Testimonials: Admins full access, public read-only
CREATE POLICY "Admin full access to testimonials" ON public."Testimonial"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read testimonials" ON public."Testimonial"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====
-- RLS POLICIES FOR ADMIN TABLES
-- =====

-- Users: Only admins can access
CREATE POLICY "Admin access to users" ON public."User"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Artists: Only admins can access
CREATE POLICY "Admin access to artists" ON public."Artist"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Settings: Only admins can access
CREATE POLICY "Admin access to settings" ON public."Settings"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Email automations: Only admins can access
CREATE POLICY "Admin access to email automations" ON public."EmailAutomation"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Email logs: Only admins can access
CREATE POLICY "Admin access to email logs" ON public."EmailLog"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Automation runs: Only admins can access
CREATE POLICY "Admin access to automation runs" ON public."AutomationRun"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Notification queue: Only admins can access
CREATE POLICY "Admin access to notification queue" ON public."NotificationQueue"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Tags: Only admins can access
CREATE POLICY "Admin access to tags" ON public."Tag"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Leads: Only admins can access
CREATE POLICY "Admin access to leads" ON public."Lead"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Interactions: Only admins can access
CREATE POLICY "Admin access to interactions" ON public."Interaction"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- =====
-- ADDITIONAL SECURITY INDEXES
-- =====

-- Add security-focused indexes for better performance
CREATE INDEX IF NOT EXISTS "Customer_email_security_idx" ON public."Customer" (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS "User_email_security_idx" ON public."User" ("email") WHERE "email" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "Appointment_customerId_security_idx" ON public."Appointment" ("customerId");
CREATE INDEX IF NOT EXISTS "Booking_customerId_security_idx" ON public."Booking" ("customerId");
CREATE INDEX IF NOT EXISTS "Payment_customerId_security_idx" ON public."Payment" ("customerId");

-- Add audit indexes
CREATE INDEX IF NOT EXISTS "Customer_createdAt_audit_idx" ON public."Customer" ("createdAt");
CREATE INDEX IF NOT EXISTS "Appointment_createdAt_audit_idx" ON public."Appointment" ("createdAt");
CREATE INDEX IF NOT EXISTS "Booking_createdAt_audit_idx" ON public."Booking" ("createdAt");

-- =====
-- AUDIT TRIGGERS AND FUNCTIONS
-- =====

-- Create audit log table
CREATE TABLE IF NOT EXISTS public."AuditLog" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  table_name text NOT NULL,
  operation text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_email text,
  created_at timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on audit log
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;

-- Only admins can access audit logs
CREATE POLICY "Admin access to audit logs" ON public."AuditLog"
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Audit function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public."AuditLog" (
    table_name,
    operation,
    old_data,
    new_data,
    user_email
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    public.current_user_email()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_customer_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public."Customer"
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_appointment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public."Appointment"
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_booking_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public."Booking"
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_payment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public."Payment"
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- =====
-- SECURITY UTILITY FUNCTIONS
-- =====

-- Function to safely get customer data for admins
CREATE OR REPLACE FUNCTION public.get_customer_secure(customer_id text)
RETURNS TABLE (
  id text,
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c."firstName",
    c."lastName",
    c.email,
    c.phone,
    c."createdAt"
  FROM public."Customer" c
  WHERE c.id = customer_id;
END;
$$;

-- Function to safely create customer (admin only)
CREATE OR REPLACE FUNCTION public.create_customer_secure(
  first_name text,
  last_name text,
  email text,
  phone text DEFAULT NULL,
  address text DEFAULT NULL,
  city text DEFAULT NULL,
  state text DEFAULT NULL,
  postal_code text DEFAULT NULL,
  notes text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_customer_id text;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Validate required fields
  IF first_name IS NULL OR first_name = '' THEN
    RAISE EXCEPTION 'First name is required';
  END IF;
  
  IF last_name IS NULL OR last_name = '' THEN
    RAISE EXCEPTION 'Last name is required';
  END IF;
  
  IF email IS NULL OR email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Create customer
  INSERT INTO public."Customer" (
    id,
    "firstName",
    "lastName",
    email,
    phone,
    address,
    city,
    state,
    "postalCode",
    notes,
    tags,
    "createdAt",
    "updatedAt"
  ) VALUES (
    gen_random_uuid()::text,
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    state,
    postal_code,
    notes,
    ARRAY[]::text[],
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ) RETURNING id INTO new_customer_id;

  RETURN new_customer_id;
END;
$$;

-- =====
-- GRANT PERMISSIONS
-- =====

-- Grant execute permissions on security functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_authenticated() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_customer_secure(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_customer_secure(text, text, text, text, text, text, text, text, text) TO authenticated, service_role;

-- Grant table permissions for service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant read access to anon for public content
GRANT SELECT ON public."TattooDesign" TO anon;
GRANT SELECT ON public."Testimonial" TO anon;

-- =====
-- COMMENTS FOR DOCUMENTATION
-- =====

COMMENT ON FUNCTION public.is_admin() IS 'Checks if current user has admin role via BetterAuth integration';
COMMENT ON FUNCTION public.create_customer_secure(text, text, text, text, text, text, text, text, text) IS 'Securely creates a customer with admin privileges check';
COMMENT ON TABLE public."AuditLog" IS 'Audit trail for all sensitive table operations';
COMMENT ON POLICY "Admin access to customers" ON public."Customer" IS 'Only authenticated admin users can access customer data';

-- =====
-- SECURITY VALIDATIONS
-- =====

-- Create a view to monitor security status
CREATE OR REPLACE VIEW public.security_status AS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = pt.schemaname AND tablename = pt.tablename) as policy_count
FROM pg_tables pt
WHERE schemaname = 'public'
  AND tablename NOT LIKE '_prisma_%'
ORDER BY tablename;

GRANT SELECT ON public.security_status TO authenticated, service_role;