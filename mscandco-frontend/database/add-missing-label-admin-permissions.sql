-- ============================================
-- ADD MISSING PERMISSIONS FOR LABEL ADMIN
-- ============================================
-- This script creates the 12 missing permissions
-- and assigns them to label_admin role
-- ============================================

-- Step 1: Create the missing permissions
INSERT INTO permissions (name, description, resource, action, scope) VALUES
-- Label-specific permissions
('label:read:own', 'Read own label information', 'label', 'read', 'own'),
('label:update:own', 'Update own label information', 'label', 'update', 'own'),
('label:roster:read:own', 'Read own label roster (My Artists)', 'label', 'roster_read', 'own'),
('label:roster:manage:own', 'Manage own label roster (My Artists)', 'label', 'roster_manage', 'own'),
('artist:invite:label', 'Invite artists to collaborate with label', 'artist', 'invite', 'label'),
('artist:manage:label', 'Manage artists in label', 'artist', 'manage', 'label'),

-- Message tabs
('messages:invitations:view', 'View invitation messages', 'messages', 'invitations_view', 'own'),
('messages:earnings:view', 'View earnings messages', 'messages', 'earnings_view', 'own'),
('messages:payouts:view', 'View payout messages', 'messages', 'payouts_view', 'own'),
('messages:system:view', 'View system messages', 'messages', 'system_view', 'own'),

-- Analytics tabs
('analytics:basic:view', 'View basic analytics', 'analytics', 'basic_view', 'own'),
('analytics:advanced:view', 'View advanced analytics', 'analytics', 'advanced_view', 'own')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Verify permissions were created
SELECT 
  permission_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM permissions WHERE name = permission_name) 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM (
  VALUES
    ('label:read:own'),
    ('label:update:own'),
    ('label:roster:read:own'),
    ('label:roster:manage:own'),
    ('artist:invite:label'),
    ('artist:manage:label'),
    ('messages:invitations:view'),
    ('messages:earnings:view'),
    ('messages:payouts:view'),
    ('messages:system:view'),
    ('analytics:basic:view'),
    ('analytics:advanced:view')
) AS required_permissions(permission_name)
ORDER BY permission_name;

-- Step 3: Now assign ALL permissions to label_admin (including the newly created ones)
DELETE FROM role_permissions
WHERE role_id = (SELECT id FROM roles WHERE name = 'label_admin');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'label_admin'
AND p.name IN (
  -- Page Access
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

-- Step 4: Final verification - should now show 32 permissions
SELECT 
  r.name as role_name,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name IN ('artist', 'label_admin')
GROUP BY r.name
ORDER BY r.name;

-- Expected Result:
-- artist: 22 permissions
-- label_admin: 32 permissions (all required permissions)

