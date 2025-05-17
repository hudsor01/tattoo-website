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

-- Create a helper function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(schema_name text, table_name text) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = schema_name AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to list tables for debugging purposes
CREATE OR REPLACE FUNCTION list_tables() 
RETURNS TABLE(schema_name text, table_name text) AS $$
BEGIN
  RETURN QUERY 
  SELECT schemaname, tablename FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY schemaname, tablename;
END;
$$ LANGUAGE plpgsql;
