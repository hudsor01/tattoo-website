-- Migration to create an admin user for testing

-- Create an admin user only if the User table exists
DO $$
DECLARE
  admin_uuid UUID := '00000000-0000-0000-0000-000000000000';
  table_exists BOOLEAN;
BEGIN
  -- Check if the User table exists
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'User'
  ) INTO table_exists;
  
  -- Only create admin if table exists
  IF table_exists THEN
    -- Insert into auth.users if user doesn't exist
    INSERT INTO auth.users (
      id, 
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      admin_uuid,
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      -- This is a hashed version of 'password123'
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin User"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert into public.User if it doesn't exist
    INSERT INTO public."User" (id, email, role, "firstName", "lastName", "createdAt", "updatedAt")
    VALUES (
      admin_uuid,
      'admin@example.com',
      'ADMIN',
      'Admin',
      'User',
      now(),
      now()
    )
    ON CONFLICT (id) DO
    UPDATE SET 
      role = 'ADMIN',
      "updatedAt" = now();
  END IF;
END $$;
