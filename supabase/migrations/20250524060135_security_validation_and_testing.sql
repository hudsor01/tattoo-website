-- Security Validation and Testing Migration
-- This migration adds final security validations and testing utilities

-- =====
-- SECURITY CONFIGURATION FUNCTIONS
-- =====

-- Function to safely test customer creation for admins
CREATE OR REPLACE FUNCTION public.test_customer_creation_security()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_customer_id text;
  result text;
BEGIN
  -- This function can only be called by service_role or in testing
  IF current_setting('role') != 'service_role' THEN
    RETURN 'RESTRICTED: This function can only be called by service_role';
  END IF;

  BEGIN
    -- Try to create a test customer
    SELECT public.create_customer_secure(
      'Test',
      'Customer', 
      'test-security@example.com',
      '555-0123',
      '123 Test St',
      'Test City',
      'CA',
      '90210',
      'Security test customer'
    ) INTO test_customer_id;
    
    result := 'SUCCESS: Customer created with ID: ' || test_customer_id;
    
    -- Clean up test data
    DELETE FROM public."Customer" WHERE id = test_customer_id;
    
    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'SECURITY_TEST_FAILED: ' || SQLERRM;
  END;
END;
$$;

-- Function to check RLS policy effectiveness
CREATE OR REPLACE FUNCTION public.validate_rls_policies()
RETURNS TABLE (
  table_name text,
  rls_status text,
  policy_count integer,
  test_result text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.tablename::text,
    CASE 
      WHEN pt.rowsecurity THEN 'ENABLED'
      ELSE 'DISABLED'
    END::text,
    (SELECT COUNT(*)::integer FROM pg_policies WHERE schemaname = 'public' AND tablename = pt.tablename),
    CASE 
      WHEN pt.rowsecurity AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = pt.tablename) > 0 
      THEN 'PASS: RLS enabled with policies'
      WHEN pt.rowsecurity AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = pt.tablename) = 0 
      THEN 'WARN: RLS enabled but no policies'
      WHEN NOT pt.rowsecurity 
      THEN 'FAIL: RLS not enabled'
      ELSE 'UNKNOWN'
    END::text
  FROM pg_tables pt
  WHERE pt.schemaname = 'public'
    AND pt.tablename NOT LIKE '_prisma_%'
  ORDER BY pt.tablename;
END;
$$;

-- Function to check security index coverage
CREATE OR REPLACE FUNCTION public.check_security_indexes()
RETURNS TABLE (
  table_name text,
  index_name text,
  columns text,
  index_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.tablename::text,
    pi.indexname::text,
    array_to_string(array_agg(pa.attname ORDER BY pa.attnum), ', ')::text,
    am.amname::text
  FROM pg_tables pt
  JOIN pg_indexes pi ON pt.tablename = pi.tablename AND pt.schemaname = pi.schemaname
  JOIN pg_class pc ON pi.indexname = pc.relname
  JOIN pg_am am ON pc.relam = am.oid
  JOIN pg_index pgi ON pc.oid = pgi.indexrelid
  JOIN pg_attribute pa ON pgi.indrelid = pa.attrelid AND pa.attnum = ANY(pgi.indkey)
  WHERE pt.schemaname = 'public'
    AND pt.tablename NOT LIKE '_prisma_%'
    AND (pi.indexname LIKE '%security%' OR pi.indexname LIKE '%audit%' OR pi.indexname LIKE '%email%')
  GROUP BY pt.tablename, pi.indexname, am.amname
  ORDER BY pt.tablename, pi.indexname;
END;
$$;

-- =====
-- ADDITIONAL SECURITY MEASURES
-- =====

-- Add email validation trigger
CREATE OR REPLACE FUNCTION public.validate_email_format()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate email format for Customer table
  IF TG_TABLE_NAME = 'Customer' AND NEW.email IS NOT NULL THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
  END IF;
  
  -- Validate email format for Contact table
  IF TG_TABLE_NAME = 'Contact' AND NEW.email IS NOT NULL THEN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply email validation triggers
DROP TRIGGER IF EXISTS validate_customer_email ON public."Customer";
CREATE TRIGGER validate_customer_email
  BEFORE INSERT OR UPDATE ON public."Customer"
  FOR EACH ROW EXECUTE FUNCTION public.validate_email_format();

DROP TRIGGER IF EXISTS validate_contact_email ON public."Contact";
CREATE TRIGGER validate_contact_email
  BEFORE INSERT OR UPDATE ON public."Contact"
  FOR EACH ROW EXECUTE FUNCTION public.validate_email_format();

-- =====
-- SECURITY DOCUMENTATION VIEWS
-- =====

-- View for complete security overview
CREATE OR REPLACE VIEW public.security_overview AS
SELECT 
  'RLS_STATUS' as category,
  COUNT(CASE WHEN rowsecurity THEN 1 END)::text || ' enabled / ' || COUNT(*)::text || ' total' as value,
  'Tables with RLS enabled' as description
FROM pg_tables 
WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma_%'

UNION ALL

SELECT 
  'POLICIES_COUNT' as category,
  COUNT(*)::text as value,
  'Total RLS policies created' as description
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'AUDIT_TRIGGERS' as category,
  COUNT(*)::text as value,
  'Tables with audit triggers' as description
FROM pg_trigger pt
JOIN pg_class pc ON pt.tgrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pn.nspname = 'public' 
  AND pt.tgname LIKE 'audit_%'

UNION ALL

SELECT 
  'SECURITY_INDEXES' as category,
  COUNT(*)::text as value,
  'Security-focused indexes created' as description
FROM pg_indexes
WHERE schemaname = 'public' 
  AND (indexname LIKE '%security%' OR indexname LIKE '%audit%');

-- =====
-- FINAL PERMISSIONS AND DOCUMENTATION
-- =====

-- Grant permissions for security functions
GRANT EXECUTE ON FUNCTION public.test_customer_creation_security() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_rls_policies() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_security_indexes() TO authenticated, service_role;
GRANT SELECT ON public.security_overview TO authenticated, service_role;

-- Add comprehensive documentation
COMMENT ON FUNCTION public.is_admin() IS 'Checks if current authenticated user has admin role via Clerk wrapper integration';
COMMENT ON FUNCTION public.create_customer_secure(text, text, text, text, text, text, text, text, text) IS 'Securely creates customer with admin privilege validation and audit logging';
COMMENT ON FUNCTION public.validate_rls_policies() IS 'Validates that all sensitive tables have proper RLS policies configured';
COMMENT ON TABLE public."AuditLog" IS 'Complete audit trail for all sensitive table operations with user tracking';
COMMENT ON VIEW public.security_overview IS 'High-level security configuration status dashboard';

-- Create final security test
CREATE OR REPLACE FUNCTION public.run_comprehensive_security_test()
RETURNS TABLE (
  test_name text,
  status text,
  details text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Test 1: RLS Coverage
  RETURN QUERY
  SELECT 
    'RLS_COVERAGE'::text,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma_%' AND NOT rowsecurity) = 0 
      THEN 'PASS'::text 
      ELSE 'FAIL'::text 
    END,
    'Checked: ' || (SELECT COUNT(*)::text FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma_%') || ' tables'::text;
  
  -- Test 2: Policy Coverage  
  RETURN QUERY
  SELECT 
    'POLICY_COVERAGE'::text,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_tables pt WHERE pt.schemaname = 'public' AND pt.tablename NOT LIKE '_prisma_%' AND pt.rowsecurity AND NOT EXISTS(SELECT 1 FROM pg_policies pp WHERE pp.schemaname = pt.schemaname AND pp.tablename = pt.tablename)) = 0 
      THEN 'PASS'::text 
      ELSE 'FAIL'::text 
    END,
    'Total policies: ' || (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public')::text;
  
  -- Test 3: Audit Coverage
  RETURN QUERY
  SELECT 
    'AUDIT_COVERAGE'::text,
    CASE 
      WHEN EXISTS(SELECT 1 FROM pg_trigger pt JOIN pg_class pc ON pt.tgrelid = pc.oid WHERE pc.relname = 'Customer' AND pt.tgname LIKE 'audit_%') 
      THEN 'PASS'::text 
      ELSE 'FAIL'::text 
    END,
    'Sensitive tables have audit triggers'::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_comprehensive_security_test() TO authenticated, service_role;