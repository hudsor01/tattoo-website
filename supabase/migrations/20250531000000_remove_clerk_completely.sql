-- Remove all Clerk references from database
-- This migration completely removes Clerk foreign data wrappers and references

-- Drop Clerk-related foreign tables
DROP FOREIGN TABLE IF EXISTS clerk.users CASCADE;
DROP FOREIGN TABLE IF EXISTS clerk.organizations CASCADE;

-- Drop Clerk foreign server
DROP SERVER IF EXISTS clerk_server CASCADE;

-- Drop Clerk schema
DROP SCHEMA IF EXISTS clerk CASCADE;

-- Remove Clerk API key from vault
DELETE FROM vault.secrets WHERE name = 'clerk_api_key';

-- Drop any Clerk-related functions
DROP FUNCTION IF EXISTS public.get_clerk_users_safe();
DROP FUNCTION IF EXISTS public.is_admin();

-- Remove any Clerk-related comments
COMMENT ON FUNCTION public.validate_rls_policies() IS 'Validates that all sensitive tables have proper RLS policies configured';

-- Create proper admin check function for Better Auth
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_emails text[] := ARRAY['fennyg83@gmail.com', 'ink37tattoos@gmail.com'];
BEGIN
  RETURN user_email = ANY(admin_emails);
END;
$$;

COMMENT ON FUNCTION public.is_admin_user(text) IS 'Checks if provided email has admin privileges for Better Auth integration';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user(text) TO authenticated, service_role;
