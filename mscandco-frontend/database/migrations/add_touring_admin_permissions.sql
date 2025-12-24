-- ===========================================
-- Add Touring Admin Permissions and Role
-- ===========================================
-- Date: January 2025
-- Purpose: Add comprehensive touring permissions and support for touring admin role
-- ===========================================

-- Step 1: Add Touring Permissions to permissions table
-- Using the format: resource:action:scope (e.g., touring:admin:read)

INSERT INTO permissions (name, description, resource, action, scope) VALUES
-- Touring Admin Permissions
('touring:admin:read', 'Read touring administration data', 'touring', 'admin', 'read'),
('touring:admin:manage', 'Manage touring administration (full access)', 'touring', 'admin', 'manage'),
('touring:finance:read', 'Read touring financial data', 'touring', 'finance', 'read'),
('touring:finance:manage', 'Manage touring financial data', 'touring', 'finance', 'manage'),
('touring:analytics:read', 'Read touring analytics data', 'touring', 'analytics', 'read'),

-- Touring General Permissions (for artists/label admins)
('touring:access', 'Access touring platform features', 'touring', 'access', 'own'),
('touring:create', 'Create tours', 'touring', 'create', 'own'),
('touring:read:own', 'View own tours', 'touring', 'read', 'own'),
('touring:update:own', 'Update own tours', 'touring', 'update', 'own'),
('touring:delete:own', 'Delete own tours', 'touring', 'delete', 'own'),

-- Label Admin Touring Permissions
('touring:read:label', 'View label tours', 'touring', 'read', 'label'),
('touring:update:label', 'Update label tours', 'touring', 'update', 'label'),
('touring:delete:label', 'Delete label tours', 'touring', 'delete', 'label')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Grant touring admin permissions to super_admin and company_admin roles
-- These roles should have full touring admin access

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('super_admin', 'company_admin')
AND p.name IN (
  'touring:admin:read',
  'touring:admin:manage',
  'touring:finance:read',
  'touring:finance:manage',
  'touring:analytics:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 3: Grant basic touring permissions to artist and label_admin roles
-- Artists can manage their own tours
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'artist'
AND p.name IN (
  'touring:access',
  'touring:create',
  'touring:read:own',
  'touring:update:own',
  'touring:delete:own'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Label admins can manage label tours
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('label_admin', 'labeladmin')
AND p.name IN (
  'touring:access',
  'touring:create',
  'touring:read:own',
  'touring:update:own',
  'touring:delete:own',
  'touring:read:label',
  'touring:update:label',
  'touring:delete:label'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 4: Create touring_admin role template (can be used as a custom role)
-- Note: This creates a role that can be assigned to users who should have touring admin access
-- You can create users with this role or assign touring permissions to custom_admin role users

INSERT INTO roles (name, description, is_system_role)
VALUES ('touring_admin', 'Touring Administrator - manages all touring operations, finance, and analytics', false)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Grant all touring permissions to touring_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'touring_admin'
AND p.name LIKE 'touring:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verification queries (run these to verify):
-- SELECT * FROM permissions WHERE name LIKE 'touring:%';
-- SELECT r.name, p.name FROM roles r JOIN role_permissions rp ON r.id = rp.role_id JOIN permissions p ON p.id = rp.permission_id WHERE p.name LIKE 'touring:%' ORDER BY r.name, p.name;
-- SELECT * FROM roles WHERE name = 'touring_admin';

