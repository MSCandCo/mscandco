-- Create default label admin user: labeladmin@mscandco.com
-- Password: la@2025msC

-- First, create the auth user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'labeladmin@mscandco.com',
  crypt('la@2025msC', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "label_admin"}'::jsonb,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create the user profile
INSERT INTO public.user_profiles (
  id,
  email,
  first_name,
  last_name,
  artist_name,
  artist_type,
  is_basic_info_set,
  profile_completed,
  profile_lock_status,
  created_at,
  updated_at,
  registration_date
) VALUES (
  'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'::uuid,
  'labeladmin@mscandco.com',
  'Label',
  'Admin',
  'MSC & Co',
  'Solo Artist',
  true,
  true,
  'unlocked',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  artist_name = EXCLUDED.artist_name,
  updated_at = NOW();

-- Assign label_admin role
INSERT INTO public.user_role_assignments (user_id, role_name)
VALUES (
  'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'::uuid,
  'label_admin'::user_role_enum
) ON CONFLICT (user_id, role_name) DO NOTHING;

-- Verify the creation
SELECT 
  au.email,
  up.first_name,
  up.last_name,
  up.artist_name,
  ura.role_name,
  au.email_confirmed_at IS NOT NULL as email_verified
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
JOIN public.user_role_assignments ura ON au.id = ura.user_id
WHERE au.email = 'labeladmin@mscandco.com';

SELECT 'Label admin user created successfully!' as status;
