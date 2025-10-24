-- ============================================
-- CHECK WHICH PERMISSIONS ARE MISSING
-- ============================================

-- Step 1: Check which permissions from our list actually exist
SELECT 
  permission_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM permissions WHERE name = permission_name) 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
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
) AS required_permissions(permission_name)
ORDER BY status, permission_name;

-- Step 2: Show which permissions label_admin currently has
SELECT 
  p.name as permission_name,
  p.description
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
ORDER BY p.name;

-- Step 3: Count by status
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM permissions WHERE name = permission_name) 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  COUNT(*) as count
FROM (
  VALUES
    ('analytics:access'), ('earnings:access'), ('releases:access'), ('roster:access'),
    ('profile:access'), ('platform:access'), ('messages:access'), ('settings:access'),
    ('dashboard:access'), ('messages:invitations:view'), ('messages:earnings:view'),
    ('messages:payouts:view'), ('messages:system:view'), ('settings:preferences:edit'),
    ('settings:security:edit'), ('settings:notifications:edit'), ('settings:billing:view'),
    ('settings:billing:edit'), ('settings:api_keys:view'), ('settings:api_keys:manage'),
    ('analytics:basic:view'), ('analytics:advanced:view'), ('user:read:own'),
    ('user:update:own'), ('notification:read:own'), ('message:read:own'),
    ('label:read:own'), ('label:update:own'), ('label:roster:read:own'),
    ('label:roster:manage:own'), ('artist:invite:label'), ('artist:manage:label')
) AS required_permissions(permission_name)
GROUP BY status;

