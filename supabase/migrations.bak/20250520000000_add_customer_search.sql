-- Migration to add Customer search function after tables are created

-- Create a function to check if all required tables exist
CREATE OR REPLACE FUNCTION check_tables_exist() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'Customer'
  );
END;
$$ LANGUAGE plpgsql;

-- Only create the search_customers function if the Customer table exists
DO $$
BEGIN
  IF check_tables_exist() THEN
    -- Create function for fuzzy search
    EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
    RETURNS SETOF "Customer" AS $INNER$
    BEGIN
      RETURN QUERY
      SELECT *
      FROM "Customer"
      WHERE
        "firstName" ILIKE '%' || search_term || '%'
        OR "lastName" ILIKE '%' || search_term || '%'
        OR email ILIKE '%' || search_term || '%'
        OR phone ILIKE '%' || search_term || '%'
        OR (search_term <% "firstName")
        OR (search_term <% "lastName")
      ORDER BY
        CASE
          WHEN "firstName" ILIKE '%' || search_term || '%' THEN 0
          WHEN "lastName" ILIKE '%' || search_term || '%' THEN 1
          WHEN email ILIKE '%' || search_term || '%' THEN 2
          WHEN phone ILIKE '%' || search_term || '%' THEN 3
          ELSE 4
        END,
        similarity("firstName" || ' ' || "lastName", search_term) DESC;
    END;
    $INNER$ LANGUAGE plpgsql SECURITY DEFINER;
    $FUNC$;
    
    -- Create RLS policy for the search function
    EXECUTE $FUNC$
    REVOKE EXECUTE ON FUNCTION search_customers FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION search_customers TO authenticated;
    $FUNC$;
  END IF;
END $$;
