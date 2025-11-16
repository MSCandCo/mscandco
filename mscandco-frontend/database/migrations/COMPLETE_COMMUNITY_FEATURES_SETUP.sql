-- ============================================================================
-- COMPLETE COMMUNITY FEATURES SETUP
-- ============================================================================
-- This is the COMPLETE migration to set up all community features with
-- permissions and user preferences. Run this entire file in Supabase SQL Editor.
--
-- This migration:
-- 1. Adds preference columns to user_profiles
-- 2. Creates all necessary permissions
-- 3. Assigns permissions to artist and label_admin roles
-- ============================================================================

-- ============================================================================
-- PART 1: ADD USER PREFERENCE COLUMNS
-- ============================================================================

-- Add show_open_data_features preference (if not exists from previous migration)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_open_data_features BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.show_open_data_features IS 'Whether to show Open Data link in navigation';

-- Add show_sustainability_features preference
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_sustainability_features BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.show_sustainability_features IS 'Whether to show Sustainability link in navigation';

-- Add show_lyrics_features preference
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_lyrics_features BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.show_lyrics_features IS 'Whether to show Lyrics Analysis link in navigation';

-- Add show_copyright_features preference
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_copyright_features BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.show_copyright_features IS 'Whether to show Copyright link in navigation';

-- Add show_learning_features preference
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_learning_features BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.show_learning_features IS 'Whether to show Learning link in navigation';

-- Note: show_accessibility_features should already exist from a previous migration
-- If it doesn't, add it here:
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_accessibility_features BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.show_accessibility_features IS 'Whether to show Accessibility link in navigation';

-- ============================================================================
-- PART 2: CREATE PERMISSIONS
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
-- PART 3: ASSIGN PERMISSIONS TO ARTIST ROLE
-- ============================================================================

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

    RAISE NOTICE 'Successfully assigned all community feature permissions to artist role';
  ELSE
    RAISE WARNING 'Artist role not found';
  END IF;
END $$;

-- ============================================================================
-- PART 4: ASSIGN PERMISSIONS TO LABEL ADMIN ROLE
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

    RAISE NOTICE 'Successfully assigned all community feature permissions to label_admin role';
  ELSE
    RAISE WARNING 'Label admin role not found';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that all preference columns exist
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'user_profiles'
    AND column_name IN (
      'show_accessibility_features',
      'show_open_data_features',
      'show_sustainability_features',
      'show_lyrics_features',
      'show_copyright_features',
      'show_learning_features'
    );

  IF column_count = 6 THEN
    RAISE NOTICE 'SUCCESS: All 6 preference columns exist in user_profiles';
  ELSE
    RAISE WARNING 'Only % of 6 preference columns found in user_profiles', column_count;
  END IF;
END $$;

-- Check that all permissions exist
DO $$
DECLARE
  permission_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO permission_count
  FROM permissions
  WHERE name IN (
    'accessibility:use',
    'features:open_data:use',
    'sustainability:track',
    'features:lyrics:use',
    'features:copyright:use',
    'learning:access'
  );

  IF permission_count = 6 THEN
    RAISE NOTICE 'SUCCESS: All 6 community feature permissions exist';
  ELSE
    RAISE WARNING 'Only % of 6 permissions found', permission_count;
  END IF;
END $$;

-- Check artist role permissions
DO $$
DECLARE
  artist_perm_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO artist_perm_count
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
    );

  IF artist_perm_count = 6 THEN
    RAISE NOTICE 'SUCCESS: Artist role has all 6 community feature permissions';
  ELSE
    RAISE WARNING 'Artist role only has % of 6 permissions', artist_perm_count;
  END IF;
END $$;

-- Check label_admin role permissions
DO $$
DECLARE
  label_admin_perm_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO label_admin_perm_count
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
    );

  IF label_admin_perm_count = 6 THEN
    RAISE NOTICE 'SUCCESS: Label admin role has all 6 community feature permissions';
  ELSE
    RAISE WARNING 'Label admin role only has % of 6 permissions', label_admin_perm_count;
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

RAISE NOTICE '============================================================================';
RAISE NOTICE 'Community Features Setup Complete!';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Verify all SUCCESS messages above';
RAISE NOTICE '2. Test the feature toggles in Settings -> Preferences';
RAISE NOTICE '3. Verify links appear/disappear in navigation as expected';
RAISE NOTICE '============================================================================';
