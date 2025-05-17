-- Fix search customers function properly

-- Drop existing function
DROP FUNCTION IF EXISTS search_customers(TEXT);
DROP FUNCTION IF EXISTS search_customers_simple(TEXT);

-- Create proper search function with fuzzy matching
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
RETURNS TABLE (
  id UUID,
  "firstName" TEXT,
  "lastName" TEXT,
  email TEXT,
  phone TEXT,
  similarity_score FLOAT
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  normalized_search TEXT;
BEGIN
  -- Normalize search term
  normalized_search := LOWER(TRIM(search_term));
  
  -- Return empty if search term is too short
  IF LENGTH(normalized_search) < 2 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  WITH scored_results AS (
    SELECT 
      c.id,
      c."firstName",
      c."lastName",
      c.email,
      c.phone,
      -- Calculate similarity score
      CASE
        -- Exact matches
        WHEN LOWER(c."firstName") = normalized_search THEN 1.0
        WHEN LOWER(c."lastName") = normalized_search THEN 0.95
        WHEN LOWER(c.email) = normalized_search THEN 0.9
        -- Starts with matches
        WHEN LOWER(c."firstName") LIKE normalized_search || '%' THEN 0.85
        WHEN LOWER(c."lastName") LIKE normalized_search || '%' THEN 0.8
        WHEN LOWER(c.email) LIKE normalized_search || '%' THEN 0.75
        -- Contains matches
        WHEN LOWER(c."firstName" || ' ' || c."lastName") LIKE '%' || normalized_search || '%' THEN 0.7
        WHEN LOWER(c.email) LIKE '%' || normalized_search || '%' THEN 0.65
        WHEN c.phone IS NOT NULL AND c.phone LIKE '%' || search_term || '%' THEN 0.6
        -- Partial matches
        WHEN LOWER(c."firstName") LIKE '%' || normalized_search || '%' THEN 0.5
        WHEN LOWER(c."lastName") LIKE '%' || normalized_search || '%' THEN 0.45
        ELSE 0.1
      END AS score
    FROM "Customer" c
    WHERE 
      LOWER(c."firstName") LIKE '%' || normalized_search || '%'
      OR LOWER(c."lastName") LIKE '%' || normalized_search || '%'
      OR LOWER(c."firstName" || ' ' || c."lastName") LIKE '%' || normalized_search || '%'
      OR LOWER(c.email) LIKE '%' || normalized_search || '%'
      OR (c.phone IS NOT NULL AND c.phone LIKE '%' || search_term || '%')
  )
  SELECT 
    id,
    "firstName",
    "lastName",
    email,
    phone,
    score AS similarity_score
  FROM scored_results
  WHERE score > 0
  ORDER BY score DESC, "firstName", "lastName"
  LIMIT 50;
END;
$$;

-- Create an optimized version for autocomplete
CREATE OR REPLACE FUNCTION search_customers_autocomplete(search_term TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  match_type TEXT
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  normalized_search TEXT;
BEGIN
  normalized_search := LOWER(TRIM(search_term));
  
  -- Return empty for very short searches
  IF LENGTH(normalized_search) < 1 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT DISTINCT
    c.id,
    c."firstName" || ' ' || c."lastName" AS full_name,
    c.email,
    CASE
      WHEN LOWER(c."firstName") LIKE normalized_search || '%' THEN 'firstName'
      WHEN LOWER(c."lastName") LIKE normalized_search || '%' THEN 'lastName'
      WHEN LOWER(c.email) LIKE normalized_search || '%' THEN 'email'
      ELSE 'other'
    END AS match_type
  FROM "Customer" c
  WHERE 
    LOWER(c."firstName") LIKE normalized_search || '%'
    OR LOWER(c."lastName") LIKE normalized_search || '%'
    OR LOWER(c.email) LIKE normalized_search || '%'
  ORDER BY 
    CASE
      WHEN LOWER(c."firstName") LIKE normalized_search || '%' THEN 1
      WHEN LOWER(c."lastName") LIKE normalized_search || '%' THEN 2
      WHEN LOWER(c.email) LIKE normalized_search || '%' THEN 3
    END,
    full_name
  LIMIT 10;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_customers(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_customers_autocomplete(TEXT) TO authenticated;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_customer_firstname_lower ON "Customer" (LOWER("firstName"));
CREATE INDEX IF NOT EXISTS idx_customer_lastname_lower ON "Customer" (LOWER("lastName"));
CREATE INDEX IF NOT EXISTS idx_customer_email_lower ON "Customer" (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_customer_phone ON "Customer" (phone) WHERE phone IS NOT NULL;

-- Add comments
COMMENT ON FUNCTION search_customers(TEXT) IS 'Full-featured customer search with similarity scoring';
COMMENT ON FUNCTION search_customers_autocomplete(TEXT) IS 'Optimized search for autocomplete functionality';