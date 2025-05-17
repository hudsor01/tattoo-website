-- Migration to set up proper auth system

-- Create a function to link auth users to User table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, email, role, "createdAt", "updatedAt")
  VALUES (new.id, new.email, 'user', now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up trigger to automatically create User record when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to sync existing users
CREATE OR REPLACE FUNCTION public.sync_existing_users()
RETURNS void AS $$
BEGIN
  INSERT INTO public."User" (id, email, role, "createdAt", "updatedAt")
  SELECT 
    id, 
    email, 
    'user', 
    created_at, 
    updated_at
  FROM auth.users
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the function to sync any existing users
SELECT public.sync_existing_users();

-- Set up RLS policies
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- Create policy for User table
CREATE POLICY user_policy ON public."User"
  USING (id = auth.uid() OR 
         (SELECT role FROM public."User" WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK (id = auth.uid());

-- Grant permissions to authenticated users
GRANT SELECT ON public."User" TO authenticated;
GRANT UPDATE (name, email, image) ON public."User" TO authenticated;
