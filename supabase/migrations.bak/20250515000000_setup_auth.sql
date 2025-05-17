-- Migration to set up proper auth system

-- Set up proper RLS policies
CREATE OR REPLACE FUNCTION check_user_id_match() 
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if auth.uid() matches the current User record
  RETURN (auth.uid() = current_setting('request.jwt.claims', true)::jsonb->>'sub');
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to synchronize auth.users with public.User
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if the User table exists
  SELECT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User'
  ) INTO table_exists;
  
  -- Only create this if the User table exists
  IF table_exists THEN
    -- Create a function to handle user creation/updates
    CREATE OR REPLACE FUNCTION handle_auth_user_change()
    RETURNS TRIGGER AS $$
    BEGIN
      -- For new users being created in auth.users
      IF TG_OP = 'INSERT' THEN
        -- Insert a corresponding record in public.User if it doesn't exist
        INSERT INTO public."User" (id, email, "createdAt", "updatedAt")
        VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at)
        ON CONFLICT (id) DO NOTHING;
      
      -- For existing users being updated
      ELSIF TG_OP = 'UPDATE' THEN
        -- Update the corresponding record in public.User
        UPDATE public."User"
        SET email = NEW.email, 
            "updatedAt" = NEW.updated_at
        WHERE id = NEW.id;
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Create trigger on auth.users
    DROP TRIGGER IF EXISTS sync_auth_users_to_public ON auth.users;
    CREATE TRIGGER sync_auth_users_to_public
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_auth_user_change();
    
    -- Also create a trigger for when users are created in public.User
    CREATE OR REPLACE FUNCTION handle_public_user_change()
    RETURNS TRIGGER AS $$
    BEGIN
      -- If email changed, update auth.users
      IF TG_OP = 'UPDATE' AND NEW.email <> OLD.email THEN
        UPDATE auth.users
        SET email = NEW.email,
            updated_at = NEW."updatedAt"
        WHERE id = NEW.id;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    DROP TRIGGER IF EXISTS sync_public_users_to_auth ON public."User";
    CREATE TRIGGER sync_public_users_to_auth
    AFTER UPDATE ON public."User"
    FOR EACH ROW
    EXECUTE FUNCTION handle_public_user_change();
    
    -- Set up proper RLS policies
    ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS users_policy ON public."User";
    CREATE POLICY users_policy ON public."User"
    USING (
      id = auth.uid() OR 
      -- Admin can see all users
      EXISTS (
        SELECT 1 FROM public."User"
        WHERE id = auth.uid() AND role = 'ADMIN'
      )
    )
    WITH CHECK (id = auth.uid());
  END IF;
END $$;
