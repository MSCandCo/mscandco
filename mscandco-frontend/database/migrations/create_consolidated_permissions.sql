-- ===========================================
-- COMPREHENSIVE PERMISSION CONSOLIDATION
-- ===========================================
-- Date: October 14, 2025
-- Purpose: Create universal page permissions and granular feature permissions
-- Eliminates duplicate role-specific permissions
-- Adds granular control for message tabs, settings tabs, and analytics tabs
-- ===========================================

-- ===========================================
-- PART 1: UNIVERSAL PAGE-LEVEL PERMISSIONS
-- ===========================================
-- These permissions work the same across all roles - just toggle on/off

INSERT INTO permissions (name, description, resource, action, scope) VALUES
-- Core Pages (Universal)
('analytics:access', 'Access Analytics page', 'analytics', 'access', 'universal'),
('earnings:access', 'Access Earnings page', 'earnings', 'access', 'universal'),
('releases:access', 'Access Releases page', 'releases', 'access', 'universal'),
('roster:access', 'Access Roster page', 'roster', 'access', 'universal'),
('profile:access', 'Access and edit own profile', 'profile', 'access', 'universal'),
('platform:access', 'Access platform features', 'platform', 'access', 'universal'),
('messages:access', 'Access Messages page', 'messages', 'access', 'universal'),
('settings:access', 'Access Settings page', 'settings', 'access', 'universal'),
('dashboard:access', 'Access Dashboard page', 'dashboard', 'access', 'universal')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- PART 2: GRANULAR MESSAGE TAB PERMISSIONS
-- ===========================================
-- Control which message tabs users can see

INSERT INTO permissions (name, description, resource, action, scope) VALUES
('messages:invitations:view', 'View invitation messages (for artists)', 'messages', 'view', 'messages'),
('messages:invitation_responses:view', 'View invitation response messages (for label admins)', 'messages', 'view', 'messages'),
('messages:earnings:view', 'View earning notifications', 'messages', 'view', 'messages'),
('messages:payouts:view', 'View payout notifications', 'messages', 'view', 'messages'),
('messages:system:view', 'View system/platform messages', 'messages', 'view', 'messages'),
('messages:releases:view', 'View release notifications', 'messages', 'view', 'messages'),
('messages:all:view', 'View all message types (super admin master permission)', 'messages', 'view', 'messages')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- PART 3: GRANULAR SETTINGS TAB PERMISSIONS
-- ===========================================
-- Control which settings tabs users can access

INSERT INTO permissions (name, description, resource, action, scope) VALUES
('settings:preferences:edit', 'Edit preferences tab (language, timezone, etc.)', 'settings', 'edit', 'settings'),
('settings:security:edit', 'Edit security settings (password, 2FA, sessions)', 'settings', 'edit', 'settings'),
('settings:notifications:edit', 'Edit notification preferences', 'settings', 'edit', 'settings'),
('settings:billing:view', 'View billing information', 'settings', 'view', 'settings'),
('settings:billing:edit', 'Edit billing information', 'settings', 'edit', 'settings'),
('settings:api_keys:view', 'View API keys', 'settings', 'view', 'settings'),
('settings:api_keys:manage', 'Create and revoke API keys', 'settings', 'manage', 'settings')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- PART 4: GRANULAR ANALYTICS TAB PERMISSIONS
-- ===========================================
-- Control which analytics tabs users can see

INSERT INTO permissions (name, description, resource, action, scope) VALUES
('analytics:basic:view', 'View basic analytics tab', 'analytics', 'view', 'analytics'),
('analytics:advanced:view', 'View advanced analytics tab (Pro feature)', 'analytics', 'view', 'analytics')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- PART 5: ASSIGN PERMISSIONS TO ARTIST ROLE
-- ===========================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'artist'
AND p.name IN (
  -- Page Access
  'analytics:access',
  'earnings:access',
  'releases:access',
  'roster:access',
  'profile:access',
  'platform:access',
  'messages:access',
  'settings:access',
  'dashboard:access',

  -- Message Tabs
  'messages:invitations:view',
  'messages:earnings:view',
  'messages:payouts:view',

  -- Settings Tabs
  'settings:preferences:edit',
  'settings:security:edit',
  'settings:notifications:edit',
  'settings:billing:view',
  'settings:billing:edit',
  'settings:api_keys:view',
  'settings:api_keys:manage',

  -- Analytics Tabs
  'analytics:basic:view',
  'analytics:advanced:view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ===========================================
-- PART 6: ASSIGN PERMISSIONS TO LABEL ADMIN ROLE
-- ===========================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'labeladmin'
AND p.name IN (
  -- Page Access
  'analytics:access',
  'earnings:access',
  'releases:access',
  'roster:access',
  'profile:access',
  'platform:access',
  'messages:access',
  'settings:access',
  'dashboard:access',

  -- Message Tabs
  'messages:invitation_responses:view',
  'messages:earnings:view',
  'messages:payouts:view',

  -- Settings Tabs
  'settings:preferences:edit',
  'settings:security:edit',
  'settings:notifications:edit',
  'settings:billing:view',
  'settings:billing:edit',
  'settings:api_keys:view',
  'settings:api_keys:manage',

  -- Analytics Tabs
  'analytics:basic:view',
  'analytics:advanced:view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ===========================================
-- PART 7: ASSIGN PERMISSIONS TO DISTRIBUTION PARTNER ROLE
-- ===========================================
-- Distribution Partner: FOCUSED ACCESS - Only Distribution Hub & Revenue Reporting

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'distribution_partner'
AND p.name IN (
  -- Core Distribution Access (MAIN FEATURES)
  'distribution:read:any',           -- View Distribution Hub
  'distribution:manage:any',         -- Manage distributions
  'revenue:read',                    -- View Revenue Reporting
  'revenue:create',                  -- Create revenue reports
  'revenue:update',                  -- Update revenue reports
  
  -- Basic User Access (ESSENTIAL)
  'dashboard:access',                -- Access dashboard
  'profile:access',                  -- Access profile
  'messages:access',                 -- Access messages
  'settings:access',                 -- Access settings
  
  -- Message Tabs
  'messages:system:view',            -- View system messages
  
  -- Settings Tabs
  'settings:preferences:edit',       -- Edit preferences
  'settings:security:edit',          -- Edit security settings
  'settings:notifications:edit',     -- Edit notification settings
  
  -- Own User Permissions
  'user:read:own',                   -- Read own profile
  'user:update:own',                 -- Update own profile
  'notification:read:own',           -- Read own notifications
  'message:read:own'                 -- Read own messages
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ===========================================
-- MIGRATION SUMMARY
-- ===========================================
-- Created 9 universal page permissions
-- Created 7 message tab permissions
-- Created 7 settings tab permissions
-- Created 2 analytics tab permissions
-- Total: 25 new permissions
--
-- Assigned to:
-- - Artist: 20 permissions
-- - Label Admin: 20 permissions
-- - Distribution Partner: 20 permissions (focused on distribution & revenue only)
-- ===========================================
