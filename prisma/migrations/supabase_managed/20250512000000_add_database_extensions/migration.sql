-- Enable PostgreSQL extensions for advanced functionalities

-- Note: The following operations require elevated privileges and will be commented out
-- They should be manually executed through the Supabase SQL Editor with admin privileges
/*
-- pg_trgm for advanced text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_cron for scheduling periodic tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
*/

-- These extensions are already installed on Supabase by default

-- Create a schema for cron jobs if it doesn't exist
CREATE SCHEMA IF NOT EXISTS cron_jobs;

-- Create a function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM "NotificationQueue"
  WHERE "createdAt" < NOW() - INTERVAL '90 days'
    AND "is_read" = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Note: The following operations require elevated privileges and will be commented out
-- They should be manually executed through the Supabase SQL Editor with admin privileges
/*
-- Configure pg_cron to use the correct schema
ALTER SYSTEM SET cron.database_name = CURRENT_DATABASE();

-- Schedule the cleanup function to run daily at 3 AM
SELECT cron.schedule('cleanup-old-notifications', '0 3 * * *', 'SELECT cleanup_old_notifications()');
*/

-- Create simplified search function (without pg_trgm)
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
RETURNS TABLE (
  id TEXT,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  phone TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c."firstName" AS firstName,
    c."lastName" AS lastName,
    c.email,
    c.phone,
    1.0 AS similarity  -- Constant similarity since we can't calculate it without pg_trgm
  FROM "Customer" c
  WHERE 
    LOWER(c."firstName") LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(c."lastName") LIKE '%' || LOWER(search_term) || '%'
    OR LOWER(COALESCE(c.email, '')) LIKE '%' || LOWER(search_term) || '%'
    OR COALESCE(c.phone, '') LIKE '%' || search_term || '%'
  ORDER BY 
    c."firstName",
    c."lastName"
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate tags from text content
CREATE OR REPLACE FUNCTION generate_tags_from_text(content TEXT)
RETURNS TEXT[] AS $$
DECLARE
  stop_words TEXT[] := ARRAY['a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'from', 'in', 'on', 'to', 'with', 'by', 'for', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'of', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
  words TEXT[];
  result TEXT[] := '{}';
  word TEXT;
BEGIN
  -- Convert to lowercase and split into words
  words := regexp_split_to_array(lower(content), '[^a-z0-9]+');
  
  -- Filter out stop words and words less than 3 characters
  FOREACH word IN ARRAY words
  LOOP
    IF length(word) >= 3 AND NOT word = ANY(stop_words) AND NOT word = ANY(result) THEN
      result := result || word;
    END IF;
  END LOOP;
  
  -- Limit to top 10 words
  RETURN result[1:10];
END;
$$ LANGUAGE plpgsql;

-- Create a function to auto-tag customer notes
CREATE OR REPLACE FUNCTION auto_tag_notes()
RETURNS TRIGGER AS $$
DECLARE
  generated_tags TEXT[];
  tag_id TEXT;
BEGIN
  -- Generate tags from note content
  generated_tags := generate_tags_from_text(NEW.content);
  
  -- For each tag, create if not exists and associate with customer
  FOREACH tag_id IN ARRAY generated_tags
  LOOP
    -- Insert tag if it doesn't exist
    INSERT INTO "Tag" (id, name, color, "createdAt", "updatedAt")
    VALUES (uuid_generate_v4(), tag_id, 'gray', NOW(), NOW())
    ON CONFLICT (name) DO NOTHING;
    
    -- Get the ID of the tag
    SELECT id INTO tag_id FROM "Tag" WHERE name = tag_id;
    
    -- Associate tag with customer if not already associated
    INSERT INTO "_CustomerToTag" ("A", "B")
    SELECT NEW."customerId", tag_id
    WHERE NOT EXISTS (
      SELECT 1 FROM "_CustomerToTag" 
      WHERE "A" = NEW."customerId" AND "B" = tag_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-tagging
CREATE TRIGGER trigger_auto_tag_notes
AFTER INSERT ON "Note"
FOR EACH ROW
EXECUTE FUNCTION auto_tag_notes();

-- Create a view for fuzzy name matching
CREATE OR REPLACE VIEW customer_name_search AS
SELECT 
  id,
  "firstName",
  "lastName",
  LOWER("firstName") || ' ' || LOWER("lastName") AS full_name_lower,
  LOWER("lastName") || ', ' || LOWER("firstName") AS reverse_name_lower,
  email,
  phone
FROM "Customer";

-- Note: Indexing a view is not directly supported in PostgreSQL
-- Instead, we would need to create a materialized view or add indexes to the base table
-- This has been commented out and should be handled manually if needed
/*
CREATE INDEX IF NOT EXISTS idx_customer_name_search_gin
ON customer_name_search USING gin (full_name_lower gin_trgm_ops, reverse_name_lower gin_trgm_ops);
*/

-- Create regular B-tree indexes instead of GIN indexes (since pg_trgm extension is not available)
CREATE INDEX IF NOT EXISTS idx_customer_firstname
ON "Customer" ("firstName");

CREATE INDEX IF NOT EXISTS idx_customer_lastname
ON "Customer" ("lastName");

-- Grant permissions to the authenticated role
GRANT EXECUTE ON FUNCTION search_customers(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_tags_from_text(TEXT) TO authenticated;
