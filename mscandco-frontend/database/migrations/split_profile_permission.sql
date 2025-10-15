-- ===========================================
-- Split profile:access into CRUD permissions
-- ===========================================
-- Date: January 15, 2025
-- Purpose: Separate "access and edit" into proper read/update permissions
-- ===========================================

-- Insert new CRUD permissions for profile
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('profile:read', 'View own profile', 'profile', 'read', 'universal'),
('profile:update', 'Edit own profile', 'profile', 'update', 'universal')
ON CONFLICT (name) DO NOTHING;

-- Assign new permissions to all roles that have profile:access
INSERT INTO role_permissions (role_id, permission_id)
SELECT rp.role_id, p.id
FROM role_permissions rp
JOIN permissions old_p ON old_p.id = rp.permission_id
CROSS JOIN permissions p
WHERE old_p.name = 'profile:access'
AND p.name IN ('profile:read', 'profile:update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Remove old combined permission from role_permissions
DELETE FROM role_permissions
WHERE permission_id = (SELECT id FROM permissions WHERE name = 'profile:access');

-- Delete the old combined permission
DELETE FROM permissions WHERE name = 'profile:access';

-- Verify the changes
SELECT r.name as role, p.name as permission, p.description
FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE p.resource = 'profile'
ORDER BY r.name, p.name;
