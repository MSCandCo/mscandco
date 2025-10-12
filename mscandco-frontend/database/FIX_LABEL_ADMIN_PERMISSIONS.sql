-- =====================================================
-- Fix Label Admin Permissions
-- Ensures label_admin role has all necessary permissions
-- =====================================================

-- First, check current permissions for label_admin
SELECT 
  r.name as role,
  p.name as permission,
  p.scope
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
ORDER BY p.name;

-- Add missing permissions for label_admin if they don't exist
-- This ensures label_admin has all "own" and "label" scope permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'label_admin'
AND (
  p.scope IN ('label', 'own') OR
  p.name IN (
    'label:read:own', 
    'label:update:own', 
    'label:roster:read:own', 
    'label:roster:manage:own',
    'earnings:read:own',
    'earnings:read:label',
    'wallet:view:own',
    'wallet:topup:own',
    'wallet:withdraw:own',
    'wallet:payout:own'
  )
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verify the fix - show all label_admin permissions
SELECT 
  r.name as role,
  COUNT(p.id) as total_permissions,
  COUNT(CASE WHEN p.scope = 'own' THEN 1 END) as own_permissions,
  COUNT(CASE WHEN p.scope = 'label' THEN 1 END) as label_permissions
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
GROUP BY r.name;

-- Show specific critical permissions for label_admin
SELECT 
  p.name as permission,
  p.description,
  p.scope
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
AND p.name LIKE 'earnings:%' OR p.name LIKE 'wallet:%'
ORDER BY p.name;

