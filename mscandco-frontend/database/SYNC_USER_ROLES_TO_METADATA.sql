-- =====================================================
-- Sync User Roles from users table to auth.users metadata
-- This ensures the role badge in header matches the database
-- =====================================================

-- Check current state of users and their metadata
SELECT 
  au.email,
  up.role as database_role,
  au.raw_user_meta_data->>'role' as user_metadata_role,
  au.raw_app_meta_data->>'role' as app_metadata_role
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.role IS NOT NULL
ORDER BY au.email;

-- Update auth.users to have role in user_metadata
-- This makes the role immediately available on login without database queries

UPDATE auth.users au
SET raw_user_meta_data = 
  COALESCE(au.raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', up.role)
FROM user_profiles up
WHERE au.id = up.id
  AND up.role IS NOT NULL
  AND (au.raw_user_meta_data->>'role' IS NULL OR au.raw_user_meta_data->>'role' != up.role);

-- Verify the update
SELECT 
  au.email,
  up.role as database_role,
  au.raw_user_meta_data->>'role' as user_metadata_role,
  CASE 
    WHEN up.role = au.raw_user_meta_data->>'role' THEN '✅ Synced'
    ELSE '❌ Not Synced'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.role IS NOT NULL
ORDER BY au.email;

-- Expected results after running this script:
-- labeladmin@mscandco.com should show:
--   database_role: company_admin (or whatever you set in user management)
--   user_metadata_role: company_admin (matching)
--   status: ✅ Synced

-- IMPORTANT NOTE:
-- After running this script, users will need to log out and log back in
-- for the metadata changes to take effect in their session

