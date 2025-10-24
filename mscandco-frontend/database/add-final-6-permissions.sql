-- ============================================
-- ADD THE FINAL 6 MISSING PERMISSIONS
-- ============================================
-- These are basic user permissions that should exist
-- ============================================

-- Step 1: Create the 6 missing permissions
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('message:read:own', 'Read own messages', 'message', 'read', 'own'),
('notification:read:own', 'Read own notifications', 'notification', 'read', 'own'),
('platform:access', 'Access platform', 'platform', 'access', 'own'),
('profile:access', 'Access profile page', 'profile', 'access', 'own'),
('user:read:own', 'Read own user profile', 'user', 'read', 'own'),
('user:update:own', 'Update own user profile', 'user', 'update', 'own')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Verify they were created
SELECT name, description 
FROM permissions 
WHERE name IN (
  'message:read:own',
  'notification:read:own',
  'platform:access',
  'profile:access',
  'user:read:own',
  'user:update:own'
)
ORDER BY name;

-- Step 3: Assign these 6 permissions to label_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'label_admin'
AND p.name IN (
  'message:read:own',
  'notification:read:own',
  'platform:access',
  'profile:access',
  'user:read:own',
  'user:update:own'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 4: Also assign them to artist (they need these too!)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'artist'
AND p.name IN (
  'message:read:own',
  'notification:read:own',
  'platform:access',
  'profile:access',
  'user:read:own',
  'user:update:own'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 5: Final verification - should now show 32 for label_admin, 28 for artist
SELECT 
  r.name as role_name,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name IN ('artist', 'label_admin')
GROUP BY r.name
ORDER BY r.name;

-- Expected Result:
-- artist: 28 permissions (22 + 6 new)
-- label_admin: 32 permissions (26 + 6 new)

