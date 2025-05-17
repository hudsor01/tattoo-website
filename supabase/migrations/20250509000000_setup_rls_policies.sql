-- Migration to apply Supabase schema changes (role level security, etc)

-- Enable row level security on all tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('schema_migrations', '_prisma_migrations')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
  END LOOP;
END
$$;

-- Create policy for artist access
CREATE POLICY artist_policy ON public."Artist"
  USING (id IN (
    SELECT a.id FROM public."Artist" a 
    JOIN public."User" u ON a.id = u.id 
    WHERE u.id = auth.uid()
  ));

-- Create policy for customer access
CREATE POLICY customer_policy ON public."Customer"
  USING (id IN (
    SELECT c.id FROM public."Customer" c
    WHERE auth.role() = 'authenticated'
  ));

-- Create policy for admin access
CREATE POLICY admin_table_policy ON public."User"
  USING (auth.role() = 'authenticated' AND (
    SELECT role FROM public."User" WHERE id = auth.uid()
  ) IN ('admin', 'superadmin'));

-- Update functions to handle admin actions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'superadmin')
    FROM public."User"
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant basic permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant extra permissions to anon users for public tables
GRANT SELECT ON public."User" TO anon;
GRANT SELECT ON public."Artist" TO anon;
