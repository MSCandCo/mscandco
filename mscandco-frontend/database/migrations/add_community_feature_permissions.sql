-- ============================================================================
-- Add Community Feature Permissions and Assign to Roles
-- ============================================================================
-- This migration ensures all community features have proper permissions
-- and that artist and label_admin roles have access to these features

-- ============================================================================
-- 1. CREATE PERMISSIONS (if they don't exist)
-- ============================================================================

-- Accessibility permission
INSERT INTO permissions (name, description)
VALUES ('accessibility:use', 'Access accessibility features and tools')
ON CONFLICT (name) DO NOTHING;

-- Open Data permission
INSERT INTO permissions (name, description)
VALUES ('features:open_data:use', 'Access open music industry data and analytics')
ON CONFLICT (name) DO NOTHING;

-- Sustainability permission
INSERT INTO permissions (name, description)
VALUES ('sustainability:track', 'Track and manage environmental impact and sustainability metrics')
ON CONFLICT (name) DO NOTHING;

-- Lyrics Analysis permission
INSERT INTO permissions (name, description)
VALUES ('features:lyrics:use', 'Analyze and improve lyrics with AI-powered tools')
ON CONFLICT (name) DO NOTHING;

-- Copyright permission
INSERT INTO permissions (name, description)
VALUES ('features:copyright:use', 'Manage rights, clearances, and copyright information')
ON CONFLICT (name) DO NOTHING;

-- Learning permission
INSERT INTO permissions (name, description)
VALUES ('learning:access', 'Access courses, tutorials, and educational content')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. ASSIGN PERMISSIONS TO ARTIST ROLE
-- ============================================================================

-- Get artist role ID
DO $$
DECLARE
  artist_role_id UUID;
  perm_id UUID;
BEGIN
  -- Get artist role
  SELECT id INTO artist_role_id FROM roles WHERE name = 'artist';

  IF artist_role_id IS NOT NULL THEN
    -- Assign accessibility permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'accessibility:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign open data permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:open_data:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign sustainability permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'sustainability:track';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign lyrics analysis permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:lyrics:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign copyright permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:copyright:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign learning permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'learning:access';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3. ASSIGN PERMISSIONS TO LABEL ADMIN ROLE
-- ============================================================================

DO $$
DECLARE
  label_admin_role_id UUID;
  perm_id UUID;
BEGIN
  -- Get label_admin role
  SELECT id INTO label_admin_role_id FROM roles WHERE name = 'label_admin';

  IF label_admin_role_id IS NOT NULL THEN
    -- Assign accessibility permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'accessibility:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign open data permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:open_data:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign sustainability permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'sustainability:track';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign lyrics analysis permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:lyrics:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign copyright permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:copyright:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Assign learning permission
    SELECT id INTO perm_id FROM permissions WHERE name = 'learning:access';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 4. VERIFICATION QUERIES (Commented out - uncomment to verify)
-- ============================================================================

/*
-- Check that all permissions exist
SELECT name, description FROM permissions
WHERE name IN (
  'accessibility:use',
  'features:open_data:use',
  'sustainability:track',
  'features:lyrics:use',
  'features:copyright:use',
  'learning:access'
)
ORDER BY name;

-- Check artist role permissions
SELECT
  r.name as role_name,
  p.name as permission_name,
  p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'artist'
  AND p.name IN (
    'accessibility:use',
    'features:open_data:use',
    'sustainability:track',
    'features:lyrics:use',
    'features:copyright:use',
    'learning:access'
  )
ORDER BY p.name;

-- Check label_admin role permissions
SELECT
  r.name as role_name,
  p.name as permission_name,
  p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'label_admin'
  AND p.name IN (
    'accessibility:use',
    'features:open_data:use',
    'sustainability:track',
    'features:lyrics:use',
    'features:copyright:use',
    'learning:access'
  )
ORDER BY p.name;
*/
