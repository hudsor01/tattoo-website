-- Migration to fix table creation order and function dependencies
-- This migration should run after the main Prisma schema is created

-- Drop existing functions that might have dependency issues
DROP FUNCTION IF EXISTS search_customers(TEXT);
DROP FUNCTION IF EXISTS cleanup_old_notifications();
DROP FUNCTION IF EXISTS generate_tags_from_text(TEXT);
DROP FUNCTION IF EXISTS auto_tag_notes();

-- Recreate the search_customers function with proper table structure
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
RETURNS TABLE (
  id UUID,
  "firstName" TEXT,
  "lastName" TEXT,
  email TEXT,
  phone TEXT,
  similarity FLOAT
) AS $$
BEGIN
  -- Check if Customer table exists before running query
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Customer') THEN
    RETURN QUERY
    SELECT 
      c.id,
      c."firstName",
      c."lastName",
      c.email,
      c.phone,
      -- Use simple similarity calculation without pg_trgm
      CASE
        WHEN LOWER(c."firstName") = LOWER(search_term) THEN 1.0
        WHEN LOWER(c."lastName") = LOWER(search_term) THEN 0.9
        WHEN LOWER(c."firstName") LIKE LOWER(search_term) || '%' THEN 0.8
        WHEN LOWER(c."lastName") LIKE LOWER(search_term) || '%' THEN 0.7
        WHEN LOWER(c."firstName") LIKE '%' || LOWER(search_term) || '%' THEN 0.6
        WHEN LOWER(c."lastName") LIKE '%' || LOWER(search_term) || '%' THEN 0.5
        WHEN LOWER(COALESCE(c.email, '')) LIKE '%' || LOWER(search_term) || '%' THEN 0.4
        WHEN COALESCE(c.phone, '') LIKE '%' || search_term || '%' THEN 0.3
        ELSE 0.1
      END AS similarity
    FROM "Customer" c
    WHERE 
      LOWER(c."firstName") LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(c."lastName") LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(COALESCE(c.email, '')) LIKE '%' || LOWER(search_term) || '%'
      OR COALESCE(c.phone, '') LIKE '%' || search_term || '%'
    ORDER BY 
      similarity DESC,
      c."firstName",
      c."lastName"
    LIMIT 20;
  ELSE
    -- Return empty result if table doesn't exist
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the cleanup function with proper error handling
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Check if NotificationQueue table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'NotificationQueue') THEN
    DELETE FROM "NotificationQueue"
    WHERE "createdAt" < NOW() - INTERVAL '90 days'
      AND "is_read" = TRUE;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist yet, do nothing
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate tag generation function
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

-- Recreate auto tag function with proper error handling
CREATE OR REPLACE FUNCTION auto_tag_notes()
RETURNS TRIGGER AS $$
DECLARE
  generated_tags TEXT[];
  tag_id UUID;
  tag_name TEXT;
BEGIN
  -- Check if tables exist before proceeding
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Tag') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_CustomerToTag') THEN
    
    -- Generate tags from note content
    generated_tags := generate_tags_from_text(NEW.content);
    
    -- For each tag, create if not exists and associate with customer
    FOREACH tag_name IN ARRAY generated_tags
    LOOP
      -- Insert tag if it doesn't exist
      INSERT INTO "Tag" (id, name, color, "createdAt", "updatedAt")
      VALUES (uuid_generate_v4(), tag_name, 'gray', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
      
      -- Get the ID of the tag
      SELECT id INTO tag_id FROM "Tag" WHERE name = tag_name;
      
      -- Associate tag with customer if not already associated
      INSERT INTO "_CustomerToTag" ("A", "B")
      SELECT NEW."customerId", tag_id
      WHERE NOT EXISTS (
        SELECT 1 FROM "_CustomerToTag" 
        WHERE "A" = NEW."customerId" AND "B" = tag_id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN undefined_table THEN
    -- Tables don't exist yet, just return the new row
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate or create the trigger with proper error handling
DO $$
BEGIN
  -- Drop trigger if it exists
  DROP TRIGGER IF EXISTS trigger_auto_tag_notes ON "Note";
  
  -- Create trigger only if Note table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Note') THEN
    CREATE TRIGGER trigger_auto_tag_notes
    AFTER INSERT ON "Note"
    FOR EACH ROW
    EXECUTE FUNCTION auto_tag_notes();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist yet, do nothing
    NULL;
END $$;

-- Create indexes with existence checks
DO $$
BEGIN
  -- Create indexes only if Customer table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Customer') THEN
    -- Check and create index on firstName
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'Customer' AND indexname = 'idx_customer_firstname') THEN
      CREATE INDEX idx_customer_firstname ON "Customer" ("firstName");
    END IF;
    
    -- Check and create index on lastName  
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'Customer' AND indexname = 'idx_customer_lastname') THEN
      CREATE INDEX idx_customer_lastname ON "Customer" ("lastName");
    END IF;
  END IF;
END $$;

-- Grant permissions with error handling
DO $$
BEGIN
  -- Grant execute on functions to authenticated role
  GRANT EXECUTE ON FUNCTION search_customers(TEXT) TO authenticated;
  GRANT EXECUTE ON FUNCTION cleanup_old_notifications() TO authenticated;
  GRANT EXECUTE ON FUNCTION generate_tags_from_text(TEXT) TO authenticated;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- Ignore permission errors in development
    NULL;
END $$;

-- Add comment to track the migration purpose
COMMENT ON FUNCTION search_customers(TEXT) IS 'Performs fuzzy customer search with proper error handling';