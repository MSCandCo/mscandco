-- ============================================
-- FIND EXACTLY WHICH 6 PERMISSIONS ARE MISSING
-- ============================================

-- Step 1: Show which permissions label_admin currently HAS
SELECT 
  p.name as permission_name,
  p.description
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
ORDER BY p.name;

-- Step 2: Show which of our required 32 permissions are MISSING
SELECT 
  required_permission
FROM (
  VALUES
    ('analytics:access'),
    ('earnings:access'),
    ('releases:access'),
    ('roster:access'),
    ('profile:access'),
    ('platform:access'),
    ('messages:access'),
    ('settings:access'),
    ('dashboard:access'),
    ('messages:invitations:view'),
    ('messages:earnings:view'),
    ('messages:payouts:view'),
    ('messages:system:view'),
    ('settings:preferences:edit'),
    ('settings:security:edit'),
    ('settings:notifications:edit'),
    ('settings:billing:view'),
    ('settings:billing:edit'),
    ('settings:api_keys:view'),
    ('settings:api_keys:manage'),
    ('analytics:basic:view'),
    ('analytics:advanced:view'),
    ('user:read:own'),
    ('user:update:own'),
    ('notification:read:own'),
    ('message:read:own'),
    ('label:read:own'),
    ('label:update:own'),
    ('label:roster:read:own'),
    ('label:roster:manage:own'),
    ('artist:invite:label'),
    ('artist:manage:label')
) AS required(required_permission)
WHERE NOT EXISTS (
  SELECT 1 
  FROM role_permissions rp
  JOIN roles r ON rp.role_id = r.id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE r.name = 'label_admin' 
  AND p.name = required.required_permission
)
ORDER BY required_permission;

-- Step 3: Check if these 6 missing permissions exist in the permissions table at all
SELECT 
  required_permission,
  CASE 
    WHEN EXISTS (SELECT 1 FROM permissions WHERE name = required_permission)
    THEN '✅ Permission exists in table'
    ELSE '❌ Permission does NOT exist'
  END as status
FROM (
  VALUES
    ('analytics:access'),
    ('earnings:access'),
    ('releases:access'),
    ('roster:access'),
    ('profile:access'),
    ('platform:access'),
    ('messages:access'),
    ('settings:access'),
    ('dashboard:access'),
    ('messages:invitations:view'),
    ('messages:earnings:view'),
    ('messages:payouts:view'),
    ('messages:system:view'),
    ('settings:preferences:edit'),
    ('settings:security:edit'),
    ('settings:notifications:edit'),
    ('settings:billing:view'),
    ('settings:billing:edit'),
    ('settings:api_keys:view'),
    ('settings:api_keys:manage'),
    ('analytics:basic:view'),
    ('analytics:advanced:view'),
    ('user:read:own'),
    ('user:update:own'),
    ('notification:read:own'),
    ('message:read:own'),
    ('label:read:own'),
    ('label:update:own'),
    ('label:roster:read:own'),
    ('label:roster:manage:own'),
    ('artist:invite:label'),
    ('artist:manage:label')
) AS required(required_permission)
WHERE NOT EXISTS (
  SELECT 1 
  FROM role_permissions rp
  JOIN roles r ON rp.role_id = r.id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE r.name = 'label_admin' 
  AND p.name = required.required_permission
)
ORDER BY status, required_permission;

