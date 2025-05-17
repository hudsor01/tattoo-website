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
  RETURN QUERY
  SELECT
    td.id::TEXT,
    td.name,
    td.description,
    1 - (td.embedding <=> query_embedding) AS similarity
  FROM
    "TattooDesign" td
  WHERE
    1 - (td.embedding <=> query_embedding) > match_threshold
  ORDER BY
    td.embedding <=> query_embedding
  LIMIT
    match_count;
END;
$$;

-- Add embedding column to TattooDesign table if it doesn't exist
ALTER TABLE "TattooDesign" 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index on embedding column for faster similarity search
CREATE INDEX IF NOT EXISTS tattoo_design_embedding_idx 
ON "TattooDesign" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function to generate JSON schema validation for forms
CREATE OR REPLACE FUNCTION validate_json_schema(
  data jsonb,
  schema jsonb
) RETURNS boolean
LANGUAGE sql
AS $$
  SELECT validate_schema(data, schema);
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

-- Create function for fuzzy search
CREATE OR REPLACE FUNCTION search_clients(search_term TEXT)
RETURNS SETOF "Client" AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM "Client"
  WHERE
    name ILIKE '%' || search_term || '%'
    OR email ILIKE '%' || search_term || '%'
    OR phone ILIKE '%' || search_term || '%'
    OR (search_term <% name)
  ORDER BY
    CASE
      WHEN name ILIKE '%' || search_term || '%' THEN 0
      WHEN email ILIKE '%' || search_term || '%' THEN 1
      WHEN phone ILIKE '%' || search_term || '%' THEN 2
      ELSE 3
    END,
    similarity(name, search_term) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy for the search function
REVOKE EXECUTE ON FUNCTION search_clients FROM PUBLIC;
GRANT EXECUTE ON FUNCTION search_clients TO authenticated;

-- Create GraphQL schema for the API
COMMENT ON SCHEMA public IS
E'@graphql({"name": "public", "plural": "public"})';

-- Set up GraphQL type definitions for core entities
COMMENT ON TABLE "Appointment" IS
E'@graphql({"name": "Appointment"})';

COMMENT ON TABLE "Client" IS
E'@graphql({"name": "Client"})';

COMMENT ON TABLE "TattooDesign" IS
E'@graphql({"name": "TattooDesign"})';

COMMENT ON TABLE "Booking" IS
E'@graphql({"name": "Booking"})';

COMMENT ON TABLE "Payment" IS
E'@graphql({"name": "Payment"})';

-- Create trigram indices for text search
CREATE INDEX IF NOT EXISTS booking_tattoo_idea_trgm_idx ON "Booking" USING gin (tattoo_idea gin_trgm_ops);
CREATE INDEX IF NOT EXISTS client_name_trgm_idx ON "Client" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contact_message_trgm_idx ON "ContactSubmission" USING gin (message gin_trgm_ops);

-- Create scheduled job for cleanup and maintenance
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 0 * * *',  -- Run at midnight every day
  $$
    DELETE FROM "NotificationQueue"
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND is_processed = TRUE;
    
    -- Delete read notifications older than 30 days
    DELETE FROM "Notification"
    WHERE "read" = TRUE AND "created_at" < NOW() - INTERVAL '30 days';
    
    -- Archive completed payments older than 90 days
    UPDATE "Payment"
    SET "archived" = TRUE
    WHERE "status" = 'completed' AND "created_at" < NOW() - INTERVAL '90 days'
      AND "archived" = FALSE;
  $$
);

-- Create scheduled job for sending appointment reminders
SELECT cron.schedule(
  'send-appointment-reminders',
  '0 9 * * *',  -- Run at 9 AM every day
  $$
    INSERT INTO "NotificationQueue" (
      recipient_id, 
      recipient_type, 
      title, 
      message, 
      action_url, 
      notification_type
    )
    SELECT
      "clientId"::text,
      'client',
      'Upcoming Appointment Reminder',
      'You have an appointment scheduled for tomorrow',
      '/client/appointments/' || id,
      'appointment_reminder'
    FROM "Appointment"
    WHERE DATE("startDate") = CURRENT_DATE + INTERVAL '1 day'
    AND status NOT IN ('cancelled', 'completed');
    
    -- Trigger the email automation edge function
    SELECT net.http_post(
      'https://abcdefghijk.functions.supabase.co/email-automations',
      '{"action": "run_daily_automations"}',
      'application/json'
    );
  $$
);