-- ============================================
-- CREATE LABEL ADMIN ROLE IF IT DOESN'T EXIST
-- ============================================

-- Step 1: Check if label_admin role exists
SELECT * FROM roles WHERE name = 'label_admin';

-- Step 2: Create label_admin role if it doesn't exist
INSERT INTO roles (name, description, is_system_role)
VALUES ('label_admin', 'Label administrator - manages multiple artists', true)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Verify role was created
SELECT * FROM roles WHERE name IN ('artist', 'label_admin', 'labeladmin');

-- Step 4: Now run the permission assignment
-- Remove ALL existing label_admin permissions first
DELETE FROM role_permissions
WHERE role_id IN (
  SELECT id FROM roles WHERE name IN ('label_admin', 'labeladmin')
);

-- Step 5: Add the correct permissions for label_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'label_admin'
AND p.name IN (
  -- Page Access (SAME AS ARTIST)
  'analytics:access',
  'earnings:access',
  'releases:access',
  'roster:access',
  'profile:access',
  'platform:access',
  'messages:access',
  'settings:access',
  'dashboard:access',
  
  -- Message Tabs
  'messages:invitations:view',
  'messages:earnings:view',
  'messages:payouts:view',
  'messages:system:view',
  
  -- Settings Tabs
  'settings:preferences:edit',
  'settings:security:edit',
  'settings:notifications:edit',
  'settings:billing:view',
  'settings:billing:edit',
  'settings:api_keys:view',
  'settings:api_keys:manage',
  
  -- Analytics Tabs
  'analytics:basic:view',
  'analytics:advanced:view',
  
  -- Own User Permissions
  'user:read:own',
  'user:update:own',
  'notification:read:own',
  'message:read:own',
  
  -- Label-Specific Permissions
  'label:read:own',
  'label:update:own',
  'label:roster:read:own',
  'label:roster:manage:own',
  'artist:invite:label',
  'artist:manage:label'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 6: Verify the permissions were added
SELECT 
  r.name as role_name,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name IN ('artist', 'label_admin')
GROUP BY r.name
ORDER BY r.name;

-- Expected Result:
-- artist: ~22 permissions
-- label_admin: ~31 permissions

