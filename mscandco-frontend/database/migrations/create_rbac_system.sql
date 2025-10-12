-- ===========================================
-- RBAC Permission System Migration
-- ===========================================
-- Date: October 6, 2025
-- Purpose: Implement granular permission system with 95 permissions
-- Pattern: resource:action:scope (e.g., release:read:own)
-- Scopes: own, label, partner, any
-- ===========================================

-- ===========================================
-- 1. CREATE TABLES
-- ===========================================

-- Permissions table: Stores all 95 permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table: Stores 5 roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-Permission junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- User-Permission override table (for custom permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  granted_by UUID,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(user_id, permission_id)
);

-- ===========================================
-- 2. CREATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_scope ON permissions(scope);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted ON user_permissions(granted);

-- ===========================================
-- 3. INSERT 5 ROLES
-- ===========================================

INSERT INTO roles (name, description, is_system_role) VALUES
('super_admin', 'Full system access with all permissions', true),
('company_admin', 'Company-wide administrative access', true),
('label_admin', 'Label-level management access', true),
('distribution_partner', 'Distribution partner access', true),
('artist', 'Artist access to own content', true)
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 4. INSERT 95 PERMISSIONS
-- ===========================================

-- Special Permission (1)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('*:*:*', 'Super Admin wildcard - full access to everything', '*', '*', '*')
ON CONFLICT (name) DO NOTHING;

-- User Management (14)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('user:read:own', 'View own user profile', 'user', 'read', 'own'),
('user:read:label', 'View users in own label', 'user', 'read', 'label'),
('user:read:partner', 'View users in own partner network', 'user', 'read', 'partner'),
('user:read:any', 'View any user', 'user', 'read', 'any'),
('user:create:label', 'Create users in own label', 'user', 'create', 'label'),
('user:create:partner', 'Create users in own partner network', 'user', 'create', 'partner'),
('user:create:any', 'Create any user', 'user', 'create', 'any'),
('user:update:own', 'Update own profile', 'user', 'update', 'own'),
('user:update:label', 'Update users in own label', 'user', 'update', 'label'),
('user:update:partner', 'Update users in own partner network', 'user', 'update', 'partner'),
('user:update:any', 'Update any user', 'user', 'update', 'any'),
('user:delete:label', 'Delete users in own label', 'user', 'delete', 'label'),
('user:delete:partner', 'Delete users in own partner network', 'user', 'delete', 'partner'),
('user:delete:any', 'Delete any user', 'user', 'delete', 'any')
ON CONFLICT (name) DO NOTHING;

-- Release Management (19)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('release:read:own', 'View own releases', 'release', 'read', 'own'),
('release:read:label', 'View releases in own label', 'release', 'read', 'label'),
('release:read:partner', 'View releases in partner network', 'release', 'read', 'partner'),
('release:read:any', 'View any release', 'release', 'read', 'any'),
('release:create:own', 'Create own releases', 'release', 'create', 'own'),
('release:create:label', 'Create releases for label artists', 'release', 'create', 'label'),
('release:create:partner', 'Create releases for partner artists', 'release', 'create', 'partner'),
('release:update:own', 'Update own releases', 'release', 'update', 'own'),
('release:update:label', 'Update releases in own label', 'release', 'update', 'label'),
('release:update:partner', 'Update releases in partner network', 'release', 'update', 'partner'),
('release:update:any', 'Update any release', 'release', 'update', 'any'),
('release:delete:own', 'Delete own releases', 'release', 'delete', 'own'),
('release:delete:label', 'Delete releases in own label', 'release', 'delete', 'label'),
('release:delete:partner', 'Delete releases in partner network', 'release', 'delete', 'partner'),
('release:delete:any', 'Delete any release', 'release', 'delete', 'any'),
('release:approve:label', 'Approve releases for label', 'release', 'approve', 'label'),
('release:approve:partner', 'Approve releases for partner', 'release', 'approve', 'partner'),
('release:approve:any', 'Approve any release', 'release', 'approve', 'any'),
('release:distribute:any', 'Distribute releases', 'release', 'distribute', 'any')
ON CONFLICT (name) DO NOTHING;

-- Earnings Management (9)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('earnings:read:own', 'View own earnings', 'earnings', 'read', 'own'),
('earnings:read:label', 'View label earnings', 'earnings', 'read', 'label'),
('earnings:read:partner', 'View partner earnings', 'earnings', 'read', 'partner'),
('earnings:read:any', 'View all earnings', 'earnings', 'read', 'any'),
('earnings:export:own', 'Export own earnings', 'earnings', 'export', 'own'),
('earnings:export:label', 'Export label earnings', 'earnings', 'export', 'label'),
('earnings:export:partner', 'Export partner earnings', 'earnings', 'export', 'partner'),
('earnings:export:any', 'Export any earnings', 'earnings', 'export', 'any'),
('earnings:calculate:any', 'Calculate and distribute earnings', 'earnings', 'calculate', 'any')
ON CONFLICT (name) DO NOTHING;

-- Payout Management (10)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('payout:read:own', 'View own payout requests', 'payout', 'read', 'own'),
('payout:read:label', 'View label payout requests', 'payout', 'read', 'label'),
('payout:read:partner', 'View partner payout requests', 'payout', 'read', 'partner'),
('payout:read:any', 'View all payout requests', 'payout', 'read', 'any'),
('payout:create:own', 'Create own payout requests', 'payout', 'create', 'own'),
('payout:approve:label', 'Approve label payout requests', 'payout', 'approve', 'label'),
('payout:approve:partner', 'Approve partner payout requests', 'payout', 'approve', 'partner'),
('payout:approve:any', 'Approve any payout request', 'payout', 'approve', 'any'),
('payout:process:any', 'Process approved payouts', 'payout', 'process', 'any'),
('payout:cancel:any', 'Cancel payout requests', 'payout', 'cancel', 'any')
ON CONFLICT (name) DO NOTHING;

-- Split Agreement Management (12)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('split:read:own', 'View own split agreements', 'split', 'read', 'own'),
('split:read:label', 'View label split agreements', 'split', 'read', 'label'),
('split:read:partner', 'View partner split agreements', 'split', 'read', 'partner'),
('split:read:any', 'View all split agreements', 'split', 'read', 'any'),
('split:create:own', 'Create own split agreements', 'split', 'create', 'own'),
('split:create:label', 'Create split agreements for label', 'split', 'create', 'label'),
('split:create:partner', 'Create split agreements for partner', 'split', 'create', 'partner'),
('split:update:own', 'Update own split agreements', 'split', 'update', 'own'),
('split:update:label', 'Update label split agreements', 'split', 'update', 'label'),
('split:delete:own', 'Delete own split agreements', 'split', 'delete', 'own'),
('split:delete:label', 'Delete label split agreements', 'split', 'delete', 'label'),
('split:approve:any', 'Approve split agreements', 'split', 'approve', 'any')
ON CONFLICT (name) DO NOTHING;

-- Analytics (7)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('analytics:read:own', 'View own analytics', 'analytics', 'read', 'own'),
('analytics:read:label', 'View label analytics', 'analytics', 'read', 'label'),
('analytics:read:partner', 'View partner analytics', 'analytics', 'read', 'partner'),
('analytics:read:any', 'View all analytics', 'analytics', 'read', 'any'),
('analytics:export:label', 'Export label analytics', 'analytics', 'export', 'label'),
('analytics:export:partner', 'Export partner analytics', 'analytics', 'export', 'partner'),
('analytics:export:any', 'Export any analytics', 'analytics', 'export', 'any')
ON CONFLICT (name) DO NOTHING;

-- Distribution Management (8)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('distribution:read:own', 'View own distribution status', 'distribution', 'read', 'own'),
('distribution:read:label', 'View label distribution status', 'distribution', 'read', 'label'),
('distribution:read:partner', 'View partner distribution status', 'distribution', 'read', 'partner'),
('distribution:read:any', 'View all distribution status', 'distribution', 'read', 'any'),
('distribution:manage:partner', 'Manage partner distribution', 'distribution', 'manage', 'partner'),
('distribution:manage:any', 'Manage all distribution', 'distribution', 'manage', 'any'),
('distribution:approve:partner', 'Approve partner distribution', 'distribution', 'approve', 'partner'),
('distribution:approve:any', 'Approve any distribution', 'distribution', 'approve', 'any')
ON CONFLICT (name) DO NOTHING;

-- Label Management (11)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('label:read:own', 'View own label', 'label', 'read', 'own'),
('label:read:any', 'View any label', 'label', 'read', 'any'),
('label:create:any', 'Create new labels', 'label', 'create', 'any'),
('label:update:own', 'Update own label', 'label', 'update', 'own'),
('label:update:any', 'Update any label', 'label', 'update', 'any'),
('label:delete:any', 'Delete labels', 'label', 'delete', 'any'),
('label:roster:read:own', 'View own label roster', 'label', 'roster:read', 'own'),
('label:roster:read:any', 'View any label roster', 'label', 'roster:read', 'any'),
('label:roster:manage:own', 'Manage own label roster', 'label', 'roster:manage', 'own'),
('label:roster:manage:any', 'Manage any label roster', 'label', 'roster:manage', 'any'),
('label:affiliation:approve:any', 'Approve label affiliation requests', 'label', 'affiliation:approve', 'any')
ON CONFLICT (name) DO NOTHING;

-- Subscription Management (9)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('subscription:read:own', 'View own subscription', 'subscription', 'read', 'own'),
('subscription:read:label', 'View label subscriptions', 'subscription', 'read', 'label'),
('subscription:read:any', 'View all subscriptions', 'subscription', 'read', 'any'),
('subscription:update:own', 'Update own subscription', 'subscription', 'update', 'own'),
('subscription:update:any', 'Update any subscription', 'subscription', 'update', 'any'),
('subscription:cancel:own', 'Cancel own subscription', 'subscription', 'cancel', 'own'),
('subscription:cancel:any', 'Cancel any subscription', 'subscription', 'cancel', 'any'),
('subscription:manage:any', 'Manage subscription plans', 'subscription', 'manage', 'any'),
('subscription:billing:any', 'Access billing information', 'subscription', 'billing', 'any')
ON CONFLICT (name) DO NOTHING;

-- Support Tickets (13)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('support:read:own', 'View own support tickets', 'support', 'read', 'own'),
('support:read:label', 'View label support tickets', 'support', 'read', 'label'),
('support:read:any', 'View all support tickets', 'support', 'read', 'any'),
('support:create:own', 'Create own support tickets', 'support', 'create', 'own'),
('support:update:own', 'Update own support tickets', 'support', 'update', 'own'),
('support:update:any', 'Update any support ticket', 'support', 'update', 'any'),
('support:close:own', 'Close own support tickets', 'support', 'close', 'own'),
('support:close:any', 'Close any support ticket', 'support', 'close', 'any'),
('support:assign:any', 'Assign support tickets', 'support', 'assign', 'any'),
('support:escalate:any', 'Escalate support tickets', 'support', 'escalate', 'any'),
('support:respond:own', 'Respond to own tickets', 'support', 'respond', 'own'),
('support:respond:any', 'Respond to any ticket', 'support', 'respond', 'any'),
('support:delete:any', 'Delete support tickets', 'support', 'delete', 'any')
ON CONFLICT (name) DO NOTHING;

-- Notifications & Messaging (8)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('notification:read:own', 'View own notifications', 'notification', 'read', 'own'),
('notification:send:label', 'Send notifications to label', 'notification', 'send', 'label'),
('notification:send:any', 'Send notifications to anyone', 'notification', 'send', 'any'),
('message:read:own', 'View own messages', 'message', 'read', 'own'),
('message:send:label', 'Send messages to label users', 'message', 'send', 'label'),
('message:send:any', 'Send messages to anyone', 'message', 'send', 'any'),
('announcement:create:any', 'Create platform announcements', 'announcement', 'create', 'any'),
('announcement:delete:any', 'Delete announcements', 'announcement', 'delete', 'any')
ON CONFLICT (name) DO NOTHING;

-- Role & Permission Management (7)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('permission:read:any', 'View all permissions', 'permission', 'read', 'any'),
('permission:assign:label', 'Assign permissions to label users', 'permission', 'assign', 'label'),
('permission:assign:any', 'Assign permissions to anyone', 'permission', 'assign', 'any'),
('permission:revoke:label', 'Revoke permissions from label users', 'permission', 'revoke', 'label'),
('permission:revoke:any', 'Revoke permissions from anyone', 'permission', 'revoke', 'any'),
('role:manage:any', 'Manage roles', 'role', 'manage', 'any'),
('role:assign:any', 'Assign roles to users', 'role', 'assign', 'any')
ON CONFLICT (name) DO NOTHING;

-- Platform Administration (2)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
('settings:read:any', 'View platform settings', 'settings', 'read', 'any'),
('settings:update:any', 'Update platform settings', 'settings', 'update', 'any')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 5. ASSIGN PERMISSIONS TO ROLES
-- ===========================================

-- Super Admin: Gets wildcard permission (all access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin' AND p.name = '*:*:*'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Company Admin: Gets "any" scope permissions (company-wide access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'company_admin'
AND (
  p.scope = 'any' OR
  p.name IN (
    'user:read:own', 'user:update:own',
    'notification:read:own', 'message:read:own',
    'support:create:own', 'support:update:own', 'support:close:own', 'support:respond:own'
  )
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Label Admin: Gets "label" and "own" scope permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'label_admin'
AND (
  p.scope IN ('label', 'own') OR
  p.name IN (
    'label:read:own', 'label:update:own', 'label:roster:read:own', 'label:roster:manage:own'
  )
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Distribution Partner: Gets "partner" and "own" scope permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'distribution_partner'
AND (
  p.scope IN ('partner', 'own') OR
  p.name IN (
    'distribution:read:partner', 'distribution:manage:partner', 'distribution:approve:partner'
  )
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Artist: Gets "own" scope permissions only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'artist'
AND p.scope = 'own'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ===========================================
-- 6. CREATE HELPER FUNCTIONS
-- ===========================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_permission_name VARCHAR(100)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role VARCHAR(50);
  v_has_permission BOOLEAN := false;
  v_parts TEXT[];
  v_resource VARCHAR(50);
  v_action VARCHAR(50);
  v_scope VARCHAR(50);
BEGIN
  -- Get user's role from user_profiles
  SELECT role INTO v_user_role
  FROM user_profiles
  WHERE id = p_user_id;

  IF v_user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user has wildcard permission (super admin)
  SELECT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE r.name = v_user_role
    AND p.name = '*:*:*'
  ) INTO v_has_permission;

  IF v_has_permission THEN
    RETURN true;
  END IF;

  -- Check exact role permission match
  SELECT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE r.name = v_user_role
    AND p.name = p_permission_name
  ) INTO v_has_permission;

  IF v_has_permission THEN
    RETURN true;
  END IF;

  -- Check wildcard patterns
  -- Split requested permission into parts
  v_parts := string_to_array(p_permission_name, ':');
  IF array_length(v_parts, 1) = 3 THEN
    v_resource := v_parts[1];
    v_action := v_parts[2];
    v_scope := v_parts[3];

    -- Check wildcard patterns in order of specificity
    SELECT EXISTS (
      SELECT 1
      FROM role_permissions rp
      JOIN roles r ON r.id = rp.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE r.name = v_user_role
      AND (
        p.name = format('%s:*:*', v_resource) OR        -- resource:*:*
        p.name = format('%s:%s:*', v_resource, v_action) OR -- resource:action:*
        p.name = format('*:%s:%s', v_action, v_scope) OR    -- *:action:scope
        p.name = format('*:*:%s', v_scope) OR               -- *:*:scope
        p.name = format('%s:*:%s', v_resource, v_scope)     -- resource:*:scope
      )
    ) INTO v_has_permission;

    IF v_has_permission THEN
      RETURN true;
    END IF;
  END IF;

  -- Check user-specific permission overrides
  SELECT COALESCE(
    (
      SELECT granted
      FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = p_user_id
      AND p.name = p_permission_name
      AND revoked_at IS NULL
      ORDER BY granted_at DESC
      LIMIT 1
    ),
    false
  ) INTO v_has_permission;

  RETURN v_has_permission;
END;
$$;

-- Function to get all user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_name VARCHAR(100),
  resource VARCHAR(50),
  action VARCHAR(50),
  scope VARCHAR(20),
  source VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role VARCHAR(50);
BEGIN
  -- Get user's role
  SELECT role INTO v_user_role
  FROM user_profiles
  WHERE id = p_user_id;

  IF v_user_role IS NULL THEN
    RETURN;
  END IF;

  -- Return permissions from role
  RETURN QUERY
  SELECT
    p.name,
    p.resource,
    p.action,
    p.scope,
    'role'::VARCHAR(20) as source
  FROM role_permissions rp
  JOIN roles r ON r.id = rp.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE r.name = v_user_role;

  -- Return user-specific permission overrides (granted only)
  RETURN QUERY
  SELECT
    p.name,
    p.resource,
    p.action,
    p.scope,
    'user_override'::VARCHAR(20) as source
  FROM user_permissions up
  JOIN permissions p ON p.id = up.permission_id
  WHERE up.user_id = p_user_id
  AND up.granted = true
  AND up.revoked_at IS NULL;
END;
$$;

-- ===========================================
-- 7. GRANT PERMISSIONS
-- ===========================================

GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT ON user_permissions TO authenticated;

GRANT EXECUTE ON FUNCTION user_has_permission(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;

-- ===========================================
-- 8. CREATE AUDIT LOG
-- ===========================================

CREATE TABLE IF NOT EXISTS permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  action VARCHAR(50) NOT NULL, -- 'granted', 'revoked'
  granted_by UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permission_audit_user ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_permission ON permission_audit_log(permission_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_created ON permission_audit_log(created_at DESC);

GRANT SELECT ON permission_audit_log TO authenticated;

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- Total Tables: 5 (permissions, roles, role_permissions, user_permissions, permission_audit_log)
-- Total Permissions: 95
-- Total Roles: 5
-- Helper Functions: 2 (user_has_permission, get_user_permissions)
-- ===========================================
