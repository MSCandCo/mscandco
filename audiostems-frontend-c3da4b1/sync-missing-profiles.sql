-- Sync missing user profiles from auth.users to user_profiles table
-- This will create profiles for users who exist in auth but not in user_profiles

-- First, let's see which users are missing profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE 
    WHEN up.id IS NULL THEN 'MISSING PROFILE'
    ELSE 'HAS PROFILE'
  END as profile_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at;

-- Create missing user profiles
INSERT INTO user_profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  role,
  subscription_status,
  created_at, 
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  CASE 
    WHEN au.email = 'superadmin@mscandco.com' THEN 'super_admin'
    WHEN au.email = 'companyadmin@mscandco.com' THEN 'company_admin'
    WHEN au.email LIKE '%label%' OR au.email LIKE '%admin%' THEN 'label_admin'
    WHEN au.email LIKE '%distribution%' OR au.email LIKE '%partner%' THEN 'distribution_partner'
    ELSE 'artist'
  END as role,
  'inactive',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Verify all users now have profiles
SELECT 
  au.id,
  au.email,
  up.first_name,
  up.last_name,
  up.role,
  up.subscription_status,
  au.created_at as auth_created,
  up.created_at as profile_created
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at;
