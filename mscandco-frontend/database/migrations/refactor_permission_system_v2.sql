-- ===========================================
-- RBAC Permission System V2 Migration
-- ===========================================
-- Date: January 12, 2025
-- Purpose: Simplify permission system with page-based and CRUD-based permissions
-- Admin Portal: CRUD-based (Create, Read, Update, Delete per page)
-- Artist/Label: Page-based (simple access control)
-- Super Admin: *:*:* (god mode)
-- ===========================================

-- ===========================================
-- 1. BACKUP EXISTING DATA
-- ===========================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS permissions_backup AS SELECT * FROM permissions;
CREATE TABLE IF NOT EXISTS role_permissions_backup AS SELECT * FROM role_permissions;
CREATE TABLE IF NOT EXISTS user_permissions_backup AS SELECT * FROM user_permissions;

-- ===========================================
-- 2. CLEAR EXISTING PERMISSIONS
-- ===========================================

-- Clear existing permissions (keep structure)
DELETE FROM user_permissions;
DELETE FROM role_permissions;
DELETE FROM permissions WHERE name != '*:*:*';

-- ===========================================
-- 3. INSERT NEW ADMIN PORTAL PERMISSIONS (CRUD-based)
-- ===========================================

-- Group: Users & Access
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('users_access:user_management:read', 'View User Management page', 'user_management', 'read', 'admin'),
('users_access:user_management:create', 'Create users in User Management', 'user_management', 'create', 'admin'),
('users_access:user_management:update', 'Update users in User Management', 'user_management', 'update', 'admin'),
('users_access:user_management:delete', 'Delete users in User Management', 'user_management', 'delete', 'admin'),

('users_access:permissions_roles:read', 'View Permissions & Roles page', 'permissions_roles', 'read', 'admin'),
('users_access:permissions_roles:create', 'Create permissions/roles', 'permissions_roles', 'create', 'admin'),
('users_access:permissions_roles:update', 'Update permissions/roles', 'permissions_roles', 'update', 'admin'),
('users_access:permissions_roles:delete', 'Delete permissions/roles', 'permissions_roles', 'delete', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Group: Analytics
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('analytics:requests:read', 'View Requests page', 'requests', 'read', 'admin'),
('analytics:requests:update', 'Approve/reject requests', 'requests', 'update', 'admin'),

('analytics:platform_analytics:read', 'View Platform Analytics page', 'platform_analytics', 'read', 'admin'),

('analytics:analytics_management:read', 'View Analytics Management page', 'analytics_management', 'read', 'admin'),
('analytics:analytics_management:create', 'Create analytics entries', 'analytics_management', 'create', 'admin'),
('analytics:analytics_management:update', 'Update analytics entries', 'analytics_management', 'update', 'admin'),
('analytics:analytics_management:delete', 'Delete analytics entries', 'analytics_management', 'delete', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Group: Finance
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('finance:earnings_management:read', 'View Earnings Management page', 'earnings_management', 'read', 'admin'),
('finance:earnings_management:create', 'Create earnings entries', 'earnings_management', 'create', 'admin'),
('finance:earnings_management:update', 'Update earnings entries', 'earnings_management', 'update', 'admin'),
('finance:earnings_management:delete', 'Delete earnings entries', 'earnings_management', 'delete', 'admin'),

('finance:wallet_management:read', 'View Wallet Management page', 'wallet_management', 'read', 'admin'),
('finance:wallet_management:create', 'Create wallet entries', 'wallet_management', 'create', 'admin'),
('finance:wallet_management:update', 'Update wallet entries', 'wallet_management', 'update', 'admin'),
('finance:wallet_management:delete', 'Delete wallet entries', 'wallet_management', 'delete', 'admin'),

('finance:split_configuration:read', 'View Split Configuration page', 'split_configuration', 'read', 'admin'),
('finance:split_configuration:create', 'Create split configurations', 'split_configuration', 'create', 'admin'),
('finance:split_configuration:update', 'Update split configurations', 'split_configuration', 'update', 'admin'),
('finance:split_configuration:delete', 'Delete split configurations', 'split_configuration', 'delete', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Group: Content
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('content:asset_library:read', 'View Asset Library page', 'asset_library', 'read', 'admin'),
('content:asset_library:delete', 'Delete assets from library', 'asset_library', 'delete', 'admin'),

('content:master_roster:read', 'View Master Roster page', 'master_roster', 'read', 'admin'),
('content:master_roster:create', 'Add artists to roster', 'master_roster', 'create', 'admin'),
('content:master_roster:update', 'Update roster entries', 'master_roster', 'update', 'admin'),
('content:master_roster:delete', 'Remove artists from roster', 'master_roster', 'delete', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Group: Distribution
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('distribution:distribution_hub:read', 'View Distribution Hub page', 'distribution_hub', 'read', 'admin'),
('distribution:distribution_hub:create', 'Create distribution entries', 'distribution_hub', 'create', 'admin'),
('distribution:distribution_hub:update', 'Update distribution entries', 'distribution_hub', 'update', 'admin'),
('distribution:distribution_hub:delete', 'Delete distribution entries', 'distribution_hub', 'delete', 'admin'),

('distribution:revenue_reporting:read', 'View Revenue Reporting page', 'revenue_reporting', 'read', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Group: Admin Settings & Platform Messages
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('platform_messages:read', 'View Platform Messages page', 'platform_messages', 'read', 'admin'),
('platform_messages:create', 'Send platform messages', 'platform_messages', 'create', 'admin'),
('platform_messages:update', 'Update platform messages', 'platform_messages', 'update', 'admin'),
('platform_messages:delete', 'Delete platform messages', 'platform_messages', 'delete', 'admin'),

('settings:read', 'View Settings page', 'settings', 'read', 'admin'),
('settings:update', 'Update settings', 'settings', 'update', 'admin')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 4. INSERT ARTIST PAGE PERMISSIONS (Page-based)
-- ===========================================

INSERT INTO permissions (name, description, resource, action, scope) VALUES
('artist:release:access', 'Access Release page', 'release', 'access', 'artist'),
('artist:analytics:access', 'Access Analytics page', 'analytics', 'access', 'artist'),
('artist:earnings:access', 'Access Earnings page', 'earnings', 'access', 'artist'),
('artist:roster:access', 'Access Roster page', 'roster', 'access', 'artist'),
('artist:dashboard:access', 'Access Dashboard page', 'dashboard', 'access', 'artist'),
('artist:platform:access', 'Access Platform page', 'platform', 'access', 'artist'),
('artist:messages:access', 'Access Messages page', 'messages', 'access', 'artist'),
('artist:settings:access', 'Access Settings page', 'settings', 'access', 'artist')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 5. INSERT LABEL ADMIN PAGE PERMISSIONS (Page-based)
-- ===========================================

INSERT INTO permissions (name, description, resource, action, scope) VALUES
('label_admin:my_artists:access', 'Access My Artists page', 'my_artists', 'access', 'label_admin'),
('label_admin:release:access', 'Access Release page', 'release', 'access', 'label_admin'),
('label_admin:analytics:access', 'Access Analytics page', 'analytics', 'access', 'label_admin'),
('label_admin:earnings:access', 'Access Earnings page', 'earnings', 'access', 'label_admin'),
('label_admin:roster:access', 'Access Roster page', 'roster', 'access', 'label_admin'),
('label_admin:dashboard:access', 'Access Dashboard page', 'dashboard', 'access', 'label_admin'),
('label_admin:platform:access', 'Access Platform page', 'platform', 'access', 'label_admin'),
('label_admin:messages:access', 'Access Messages page', 'messages', 'access', 'label_admin'),
('label_admin:settings:access', 'Access Settings page', 'settings', 'access', 'label_admin')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 6. INSERT SUPER ADMIN GHOST LOGIN PERMISSION
-- ===========================================

INSERT INTO permissions (name, description, resource, action, scope) VALUES
('superadmin:ghost_login:access', 'Access Ghost Login feature', 'ghost_login', 'access', 'superadmin')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 7. ASSIGN PERMISSIONS TO ROLES
-- ===========================================

-- Super Admin: Gets wildcard + ghost login
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
AND (p.name = '*:*:*' OR p.name = 'superadmin:ghost_login:access')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Company Admin: Gets all admin portal permissions (full CRUD)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'company_admin'
AND p.scope = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Label Admin: Gets all label_admin page permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'label_admin'
AND p.scope = 'label_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Artist: Gets all artist page permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'artist'
AND p.scope = 'artist'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ===========================================
-- 8. CREATE GHOST LOGIN AUDIT TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS ghost_login_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_ghost_audit_admin ON ghost_login_audit(admin_id);
CREATE INDEX IF NOT EXISTS idx_ghost_audit_target ON ghost_login_audit(target_user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_audit_started ON ghost_login_audit(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ghost_audit_active ON ghost_login_audit(ended_at) WHERE ended_at IS NULL;

GRANT SELECT ON ghost_login_audit TO authenticated;
GRANT INSERT ON ghost_login_audit TO authenticated;
GRANT UPDATE ON ghost_login_audit TO authenticated;

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- New Permission Structure:
-- - Admin Portal: 62 CRUD-based permissions (grouped by category)
-- - Artist Pages: 8 page-based permissions
-- - Label Admin Pages: 9 page-based permissions
-- - Super Admin: *:*:* + ghost_login
-- - Total: 80 permissions
-- ===========================================
