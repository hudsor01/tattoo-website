-- Migration to add required extensions for the tattoo website application
-- This supports the various features needed including vector search, GraphQL, JSON validation, and HTTP

-- Enable the PostGIS extension for location-based services
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable the pg_graphql extension for GraphQL API
CREATE EXTENSION IF NOT EXISTS pg_graphql;

-- Enable the pgvector extension for vector similarity search (useful for design matching)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_jsonschema for JSON validation (used for form validation and data integrity)
CREATE EXTENSION IF NOT EXISTS pg_jsonschema;

-- Enable HTTP extension for external API calls from the database
CREATE EXTENSION IF NOT EXISTS http;

-- Enable pg_cron for scheduling tasks (useful for reminders and maintenance)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable fuzzystrmatch for better text search capabilities
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Enable pg_trgm (trigram) extension for fuzzy text search and similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable the uuid-ossp extension for UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for enhanced security features
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create or replace vector similarity search function for design matching
-- Create empty function for now, will update when tattoo_design table exists
CREATE OR REPLACE FUNCTION match_tattoo_designs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  description TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return an empty set for now until table exists
  RETURN QUERY SELECT 
    NULL::TEXT as id, 
    NULL::TEXT as name, 
    NULL::TEXT as description, 
    NULL::float as similarity
  WHERE false;
END;
$$;

-- Skip the tattoo_design table operations as it will be created by Prisma
-- We'll comment these out for now since the table doesn't exist yet

-- -- Add embedding column to tattoo_design table if it doesn't exist
-- ALTER TABLE "tattoo_design" 
-- ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- -- Create index on embedding column for faster similarity search
-- CREATE INDEX IF NOT EXISTS tattoo_design_embedding_idx 
-- ON "tattoo_design" 
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);

-- Create function to generate JSON schema validation for forms
-- Commenting out for now since pg_jsonschema doesn't have validate_schema function
-- CREATE OR REPLACE FUNCTION validate_json_schema(
--   data jsonb,
--   schema jsonb
-- ) RETURNS boolean
-- LANGUAGE sql
-- AS $$
--   SELECT validate_schema(data, schema);
-- $$;

-- Create generic search function instead of Customer-specific one
CREATE OR REPLACE FUNCTION generic_text_search(
  schema_name TEXT,
  table_name TEXT,
  search_term TEXT
) RETURNS SETOF json
LANGUAGE plpgsql
AS $$
DECLARE
  query_text TEXT;
  result_row json;
BEGIN
  -- Check if table exists
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = schema_name
    AND tablename = table_name
  ) THEN
    -- Dynamically build a query based on table name
    query_text := 'SELECT row_to_json(' || quote_ident(table_name) || ') FROM ' || 
                  quote_ident(schema_name) || '.' || quote_ident(table_name) || 
                  ' LIMIT 10';
                  
    -- Execute the query and return results
    FOR result_row IN EXECUTE query_text
    LOOP
      RETURN NEXT result_row;
    END LOOP;
  END IF;
  
  RETURN;
END;
$$;

-- Create function to fetch external data via HTTP
CREATE OR REPLACE FUNCTION fetch_external_data(
  url text,
  method text DEFAULT 'GET',
  headers jsonb DEFAULT '{}'::jsonb,
  body text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT
    CASE
      WHEN method = 'GET' THEN
        (SELECT content::jsonb FROM http((
          'GET',
          url,
          ARRAY(SELECT jsonb_object_keys(headers) || ': ' || headers->>jsonb_object_keys(headers))::text[],
          NULL
        )::http_request))
      WHEN method = 'POST' THEN
        (SELECT content::jsonb FROM http((
          'POST',
          url,
          ARRAY(SELECT jsonb_object_keys(headers) || ': ' || headers->>jsonb_object_keys(headers))::text[],
          body
        )::http_request))
      ELSE
        '{}'::jsonb
    END INTO result;
    
  RETURN result;
END;
$$;

-- Create a placeholder function for customer search that can be implemented later
CREATE OR REPLACE FUNCTION search_customers_placeholder(search_term TEXT)
RETURNS JSON AS $$
BEGIN
  RETURN '[]'::JSON;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy for the search function with safety check
DO $$
BEGIN
  -- Check if the function exists before attempting to revoke/grant
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_customers_placeholder') THEN
    REVOKE EXECUTE ON FUNCTION search_customers_placeholder FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION search_customers_placeholder TO authenticated;
  END IF;
END $$;

-- Create GraphQL schema for the API
COMMENT ON SCHEMA public IS
E'@graphql({"name": "public", "plural": "public"})';

-- Set up GraphQL type definitions for core entities with safety checks
DO $$
BEGIN
  -- Check if tables exist before adding comments
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Appointment') THEN
    EXECUTE 'COMMENT ON TABLE "Appointment" IS E''@graphql({"name": "Appointment"})'';';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Customer') THEN
    EXECUTE 'COMMENT ON TABLE "Customer" IS E''@graphql({"name": "Customer"})'';';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'TattooDesign') THEN
    EXECUTE 'COMMENT ON TABLE "TattooDesign" IS E''@graphql({"name": "TattooDesign"})'';';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Booking') THEN
    EXECUTE 'COMMENT ON TABLE "Booking" IS E''@graphql({"name": "Booking"})'';';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Payment') THEN
    EXECUTE 'COMMENT ON TABLE "Payment" IS E''@graphql({"name": "Payment"})'';';
  END IF;
END $$;

-- Create trigram indices for text search with safety checks
DO $$
BEGIN
  -- Check if tables exist before creating indices
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Booking') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS booking_description_trgm_idx ON "Booking" USING gin (description gin_trgm_ops);';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Customer') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS customer_firstname_trgm_idx ON "Customer" USING gin ("firstName" gin_trgm_ops);';
    EXECUTE 'CREATE INDEX IF NOT EXISTS customer_lastname_trgm_idx ON "Customer" USING gin ("lastName" gin_trgm_ops);';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Contact') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS contact_message_trgm_idx ON "Contact" USING gin (message gin_trgm_ops);';
  END IF;
END $$;

-- Create scheduled job for cleanup and maintenance
-- Commenting out until tables exist
/*
SELECT cron.schedule(
  'cleanup-old-data',
  '0 0 * * *',  -- Run at midnight every day
  $$
    -- These tables don't exist yet in the schema, so commenting out
    /*
    DELETE FROM "NotificationQueue"
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND is_processed = TRUE;
    
    -- Delete read notifications older than 30 days
    DELETE FROM "Notification"
    WHERE "read" = TRUE AND "created_at" < NOW() - INTERVAL '30 days';
    */
    
    -- Archive completed payments older than 90 days - will uncomment when Payment has archived column
    /*
    UPDATE "Payment"
    SET "archived" = TRUE
    WHERE "status" = 'completed' AND "createdAt" < NOW() - INTERVAL '90 days'
      AND "archived" = FALSE;
    */
    
    SELECT 1; -- Placeholder to ensure valid SQL
  $$
);
*/

-- Create scheduled job for sending appointment reminders
-- Commenting out until tables exist
/*
SELECT cron.schedule(
  'send-appointment-reminders',
  '0 9 * * *',  -- Run at 9 AM every day
  $$
    -- This would need a notification queue table
    -- For now, commented out until the table schema is finalized
    /*
    INSERT INTO "NotificationQueue" (
      recipient_id, 
      recipient_type, 
      title, 
      message, 
      action_url, 
      notification_type
    )
    SELECT
      "customerId"::text,
      'customer',
      'Upcoming Appointment Reminder',
      'You have an appointment scheduled for tomorrow',
      '/customer/appointments/' || id,
      'appointment_reminder'
    FROM "Appointment"
    WHERE DATE("startDate") = CURRENT_DATE + INTERVAL '1 day'
    AND status NOT IN ('cancelled', 'completed');
    */
    
    -- Trigger the email automation edge function - commented until implemented
    /*
    SELECT http.post(
      'https://abcdefghijk.functions.supabase.co/email-automations',
      '{"action": "run_daily_automations"}',
      'application/json'
    );
    */
    SELECT 1; -- Placeholder to ensure valid SQL
  $$
);
*/