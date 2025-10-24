-- ============================================
-- CHECK ROLE NAME CONSISTENCY
-- ============================================
-- Check if we have both "labeladmin" and "label_admin" roles
-- and which one has the permissions
-- ============================================

-- Step 1: Check which role names exist
SELECT 
  id,
  name,
  description
FROM roles
WHERE name IN ('labeladmin', 'label_admin')
ORDER BY name;

-- Step 2: Check permissions for BOTH role names
SELECT 
  r.name as role_name,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name IN ('labeladmin', 'label_admin')
GROUP BY r.name
ORDER BY r.name;

-- Step 3: Check which role the actual user has
SELECT 
  id,
  email,
  role,
  first_name,
  last_name
FROM user_profiles
WHERE email = 'labeladmin@mscandco.com';

-- If permissions are on "label_admin" but user has "labeladmin", we need to either:
-- Option A: Copy permissions from "label_admin" to "labeladmin"
-- Option B: Change user's role from "labeladmin" to "label_admin"

