-- Fix for existing users - handles enum type constraint
-- First, let's check what role enum values are allowed

SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role_enum'
ORDER BY e.enumsortorder;

-- Create missing user profiles with proper enum casting
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
    WHEN au.email = 'superadmin@mscandco.com' THEN 'super_admin'::user_role_enum
    WHEN au.email = 'companyadmin@mscandco.com' THEN 'company_admin'::user_role_enum
    WHEN au.email LIKE '%label%' OR au.email LIKE '%labeladmin%' THEN 'label_admin'::user_role_enum
    WHEN au.email LIKE '%distribution%' OR au.email LIKE '%partner%' THEN 'distribution_partner'::user_role_enum
    ELSE 'artist'::user_role_enum
  END as role,
  'inactive',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Verify all users now have profiles
SELECT 
  au.email,
  up.first_name,
  up.last_name,
  up.role,
  up.subscription_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at;
