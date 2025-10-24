-- ============================================
-- FIX: Change user role from "labeladmin" to "label_admin"
-- ============================================
-- This updates the user's role to match where the permissions are
-- ============================================

-- Step 1: Update the user's role in user_profiles
UPDATE user_profiles
SET role = 'label_admin'
WHERE role = 'labeladmin';

-- Step 2: Update user metadata in auth.users (if it exists there too)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"label_admin"'
)
WHERE raw_user_meta_data->>'role' = 'labeladmin';

-- Step 3: Also update app_metadata
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"label_admin"'
)
WHERE raw_app_meta_data->>'role' = 'labeladmin';

-- Step 4: Verify the change
SELECT 
  id,
  email,
  role,
  first_name,
  last_name
FROM user_profiles
WHERE email = 'labeladmin@mscandco.com';

-- Step 5: Verify permissions are available for this role
SELECT 
  r.name as role_name,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name = 'label_admin'
GROUP BY r.name;

-- Expected Result:
-- User role should now be "label_admin" (with underscore)
-- Permission count should be 32

