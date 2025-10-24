-- Add billing permissions to artist and label admin roles
-- These permissions are needed to access the billing pages

-- First, ensure the permissions exist
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('settings:billing:view', 'View billing and subscription information', 'settings', 'billing', 'view'),
('settings:billing:edit', 'Edit billing and subscription settings', 'settings', 'billing', 'edit')
ON CONFLICT (name) DO NOTHING;

-- Add billing permissions to artist role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'artist'
AND p.name IN ('settings:billing:view', 'settings:billing:edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add billing permissions to labeladmin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'labeladmin'
AND p.name IN ('settings:billing:view', 'settings:billing:edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verify the permissions were added
SELECT 
  r.name as role_name,
  p.name as permission_name,
  p.description
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name IN ('artist', 'labeladmin')
AND p.name LIKE 'settings:billing:%'
ORDER BY r.name, p.name;

