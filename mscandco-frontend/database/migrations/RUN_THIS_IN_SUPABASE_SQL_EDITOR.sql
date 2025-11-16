-- ============================================================================
-- COMPLETE COMMUNITY FEATURES SETUP - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================================
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN
-- This will set up all community feature preferences and permissions
-- ============================================================================

-- STEP 1: Add preference columns to user_profiles
-- ============================================================================
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_open_data_features BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_sustainability_features BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_lyrics_features BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_copyright_features BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_learning_features BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_accessibility_features BOOLEAN DEFAULT false;

-- Add comments
COMMENT ON COLUMN user_profiles.show_open_data_features IS 'Whether to show Open Data link in navigation';
COMMENT ON COLUMN user_profiles.show_sustainability_features IS 'Whether to show Sustainability link in navigation';
COMMENT ON COLUMN user_profiles.show_lyrics_features IS 'Whether to show Lyrics Analysis link in navigation';
COMMENT ON COLUMN user_profiles.show_copyright_features IS 'Whether to show Copyright link in navigation';
COMMENT ON COLUMN user_profiles.show_learning_features IS 'Whether to show Learning link in navigation';
COMMENT ON COLUMN user_profiles.show_accessibility_features IS 'Whether to show Accessibility link in navigation';

-- STEP 2: Create permissions
-- ============================================================================
INSERT INTO permissions (name, description)
VALUES ('accessibility:use', 'Access accessibility features and tools')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description)
VALUES ('features:open_data:use', 'Access open music industry data and analytics')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description)
VALUES ('sustainability:track', 'Track and manage environmental impact and sustainability metrics')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description)
VALUES ('features:lyrics:use', 'Analyze and improve lyrics with AI-powered tools')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description)
VALUES ('features:copyright:use', 'Manage rights, clearances, and copyright information')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description)
VALUES ('learning:access', 'Access courses, tutorials, and educational content')
ON CONFLICT (name) DO NOTHING;

-- STEP 3: Assign permissions to artist role
-- ============================================================================
DO $$
DECLARE
  artist_role_id UUID;
  perm_id UUID;
BEGIN
  SELECT id INTO artist_role_id FROM roles WHERE name = 'artist';

  IF artist_role_id IS NOT NULL THEN
    -- Accessibility
    SELECT id INTO perm_id FROM permissions WHERE name = 'accessibility:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Open Data
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:open_data:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Sustainability
    SELECT id INTO perm_id FROM permissions WHERE name = 'sustainability:track';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Lyrics
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:lyrics:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Copyright
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:copyright:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Learning
    SELECT id INTO perm_id FROM permissions WHERE name = 'learning:access';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (artist_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    RAISE NOTICE 'Successfully assigned all permissions to artist role';
  ELSE
    RAISE WARNING 'Artist role not found';
  END IF;
END $$;

-- STEP 4: Assign permissions to label_admin role
-- ============================================================================
DO $$
DECLARE
  label_admin_role_id UUID;
  perm_id UUID;
BEGIN
  SELECT id INTO label_admin_role_id FROM roles WHERE name = 'label_admin';

  IF label_admin_role_id IS NOT NULL THEN
    -- Accessibility
    SELECT id INTO perm_id FROM permissions WHERE name = 'accessibility:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Open Data
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:open_data:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Sustainability
    SELECT id INTO perm_id FROM permissions WHERE name = 'sustainability:track';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Lyrics
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:lyrics:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Copyright
    SELECT id INTO perm_id FROM permissions WHERE name = 'features:copyright:use';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Learning
    SELECT id INTO perm_id FROM permissions WHERE name = 'learning:access';
    IF perm_id IS NOT NULL THEN
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES (label_admin_role_id, perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    RAISE NOTICE 'Successfully assigned all permissions to label_admin role';
  ELSE
    RAISE WARNING 'Label admin role not found';
  END IF;
END $$;

-- VERIFICATION: Check that everything was created successfully
-- ============================================================================

-- Check preference columns
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN (
    'show_accessibility_features',
    'show_open_data_features',
    'show_sustainability_features',
    'show_lyrics_features',
    'show_copyright_features',
    'show_learning_features'
  )
ORDER BY column_name;

-- Check permissions exist
SELECT name, description
FROM permissions
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

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- You should see:
-- 1. 6 columns in user_profiles table
-- 2. 6 permissions in permissions table
-- 3. 6 permissions for artist role
-- 4. 6 permissions for label_admin role
-- ============================================================================
