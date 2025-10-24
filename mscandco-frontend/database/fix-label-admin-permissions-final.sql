-- ============================================
-- FIX LABEL ADMIN PERMISSIONS - FINAL
-- ============================================
-- Label Admin is NOT a platform admin!
-- They are like artists but manage multiple artists
-- They should have the SAME permissions as artists
-- Plus access to "My Artists" page
-- ============================================

-- Step 1: Remove ALL existing label_admin permissions
DELETE FROM role_permissions
WHERE role_id = (SELECT id FROM roles WHERE name = 'label_admin');

-- Step 2: Add ONLY the required permissions for label_admin
-- These are the SAME as artist permissions, plus "My Artists" access
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
  
  -- Message Tabs (SAME AS ARTIST)
  'messages:invitations:view',
  'messages:earnings:view',
  'messages:payouts:view',
  'messages:system:view',
  
  -- Settings Tabs (SAME AS ARTIST)
  'settings:preferences:edit',
  'settings:security:edit',
  'settings:notifications:edit',
  'settings:billing:view',
  'settings:billing:edit',
  'settings:api_keys:view',
  'settings:api_keys:manage',
  
  -- Analytics Tabs (SAME AS ARTIST)
  'analytics:basic:view',
  'analytics:advanced:view',
  
  -- Own User Permissions (SAME AS ARTIST)
  'user:read:own',
  'user:update:own',
  'notification:read:own',
  'message:read:own',
  
  -- Label-Specific Permissions (UNIQUE TO LABEL ADMIN)
  'label:read:own',                  -- Read own label info
  'label:update:own',                -- Update own label info
  'label:roster:read:own',           -- Read own label roster (My Artists)
  'label:roster:manage:own',         -- Manage own label roster (My Artists)
  'artist:invite:label',             -- Invite artists to collaborate
  'artist:manage:label'              -- Manage artists in label
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 3: Verify label_admin does NOT have admin permissions
-- This query should return 0 rows
SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.description
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
AND (
  p.name LIKE 'users_access:%' OR
  p.name LIKE 'analytics:analytics_management:%' OR
  p.name LIKE 'analytics:platform_analytics:%' OR
  p.name LIKE 'finance:%' OR
  p.name LIKE 'content:%' OR
  p.name LIKE 'distribution:read:any' OR
  p.name LIKE 'revenue:read' OR
  p.scope = 'any'
);

-- Step 4: Verify the changes - show all label_admin permissions
SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.description,
  p.resource,
  p.action,
  p.scope
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
ORDER BY p.resource, p.action;

-- Step 5: Count permissions per role for comparison
SELECT 
  r.name as role_name,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name IN ('artist', 'label_admin')
GROUP BY r.name
ORDER BY r.name;

-- Expected Result:
-- artist: ~25 permissions
-- label_admin: ~31 permissions (artist permissions + 6 label-specific)

