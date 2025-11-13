-- Remove dashboard permission since dashboard is now accessible to all authenticated users
-- This migration removes the dropdown:dashboard:read permission from the system

BEGIN;

-- Step 1: Remove all role_permissions entries for dropdown:dashboard:read
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions WHERE name = 'dropdown:dashboard:read'
);

-- Step 2: Remove all user_permissions entries for dropdown:dashboard:read
DELETE FROM user_permissions
WHERE permission_id IN (
  SELECT id FROM permissions WHERE name = 'dropdown:dashboard:read'
);

-- Step 3: Remove the permission itself
DELETE FROM permissions
WHERE name = 'dropdown:dashboard:read';

COMMIT;

-- Verify the permission is removed
SELECT 'Dashboard permission removed successfully' AS status;
SELECT COUNT(*) as remaining_dashboard_permissions
FROM permissions
WHERE name LIKE 'dropdown:dashboard%';
