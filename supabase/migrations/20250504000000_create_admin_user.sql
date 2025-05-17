-- Migration to create an admin user for testing

-- Create an admin user
DO $$
DECLARE
  admin_uuid UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
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
    '$2a$10$EjJXiFVHXVx2VWHe3VF9Y.I5sD1QFZ81cqZ16RYCpQXhGQSnKUPZi',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"],"role":"ADMIN"}',
    '{"name":"Admin User"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Update the User record to be an ADMIN
  UPDATE public."User"
  SET role = 'ADMIN', 
      name = 'Admin User', 
      "updatedAt" = now()
  WHERE id = admin_uuid;
END $$;
