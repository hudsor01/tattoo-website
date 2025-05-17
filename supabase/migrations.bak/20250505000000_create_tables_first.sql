-- Migration that runs before extensions to ensure tables exist
-- This is a placeholder migration that will run before add_extensions.sql
-- Since tables are created by Prisma, we just need to make sure this migration runs first

-- Create a simple comment to document the purpose of this migration
COMMENT ON DATABASE postgres IS 'Tattoo website database with tables created by Prisma';

-- Add a simple function that does nothing but confirms the migration ran
CREATE OR REPLACE FUNCTION migration_tables_created() RETURNS boolean AS $$
BEGIN
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
