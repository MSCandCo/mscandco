-- Simple fix for existing users - handles any role column type
-- This version will work regardless of whether role is enum or text

-- Option 1: If your role column allows these specific text values
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
    WHEN au.email LIKE '%label%' OR au.email LIKE '%labeladmin%' THEN 'label_admin'
    WHEN au.email LIKE '%distribution%' OR au.email LIKE '%partner%' THEN 'distribution_partner'
    ELSE 'artist'
  END,
  'inactive',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Alternative: If the above fails, insert with default 'artist' role for all
-- Then update specific admin roles separately

-- INSERT INTO user_profiles (id, email, first_name, last_name, role, subscription_status, created_at, updated_at)
-- SELECT au.id, au.email, 
--        COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
--        COALESCE(au.raw_user_meta_data->>'last_name', ''),
--        'artist', 'inactive', au.created_at, NOW()
-- FROM auth.users au
-- LEFT JOIN user_profiles up ON au.id = up.id
-- WHERE up.id IS NULL;

-- Then update admin roles:
-- UPDATE user_profiles SET role = 'super_admin' WHERE email = 'superadmin@mscandco.com';
-- UPDATE user_profiles SET role = 'company_admin' WHERE email = 'companyadmin@mscandco.com';

-- Verify the results
SELECT COUNT(*) as auth_users FROM auth.users;
SELECT COUNT(*) as user_profiles FROM user_profiles;
SELECT email, role FROM user_profiles ORDER BY email;
