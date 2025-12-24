-- ===========================================
-- Add Touring Permissions
-- ===========================================
-- Date: Current
-- Purpose: Add comprehensive touring permissions for touring admin role
-- ===========================================

-- Insert touring permissions into permissions table
INSERT INTO permissions (name, description, resource, action, scope) VALUES
-- Touring Admin Permissions
('touring:admin:read', 'Read access to touring administration', 'touring', 'admin', 'read'),
('touring:admin:manage', 'Full management access to touring administration', 'touring', 'admin', 'manage'),

-- Touring Finance Permissions
('touring:finance:read', 'Read access to touring financial data', 'touring', 'finance', 'read'),
('touring:finance:manage', 'Full management access to touring finances', 'touring', 'finance', 'manage'),

-- Touring Analytics Permissions
('touring:analytics:read', 'Read access to touring analytics and reports', 'touring', 'analytics', 'read'),
('touring:analytics:manage', 'Full management access to touring analytics', 'touring', 'analytics', 'manage'),

-- Touring Tour Management Permissions
('touring:tours:read', 'Read access to tours', 'touring', 'tours', 'read'),
('touring:tours:create', 'Create new tours', 'touring', 'tours', 'create'),
('touring:tours:update', 'Update existing tours', 'touring', 'tours', 'update'),
('touring:tours:delete', 'Delete tours', 'touring', 'tours', 'delete'),

-- Touring User Activity Permissions
('touring:users:read', 'Read access to touring user activity', 'touring', 'users', 'read'),

-- Touring Statistics Permissions
('touring:stats:read', 'Read access to touring statistics', 'touring', 'stats', 'read')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- Optional: Grant touring permissions to super_admin and company_admin roles
-- ===========================================
-- Note: These roles typically have *:*:* permission, but we add explicit permissions
-- for clarity and to enable fine-grained control if needed

-- Grant all touring permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
AND p.name LIKE 'touring:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant all touring permissions to company_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'company_admin'
AND p.name LIKE 'touring:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

