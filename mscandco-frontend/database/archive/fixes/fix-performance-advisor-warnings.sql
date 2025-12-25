-- ============================================
-- Fix Performance Advisor Warnings
-- Addresses: Unindexed Foreign Keys, No Primary Keys, Unused Indexes
-- ============================================

-- ============================================
-- PART 1: Add Indexes for Unindexed Foreign Keys
-- ============================================

-- artist_invitations
CREATE INDEX IF NOT EXISTS idx_artist_invitations_artist_id 
  ON artist_invitations(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_invitations_label_admin_id 
  ON artist_invitations(label_admin_id);

-- artist_requests
CREATE INDEX IF NOT EXISTS idx_artist_requests_from_label 
  ON artist_requests(from_label_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_to_artist 
  ON artist_requests(to_artist_id);

-- asset_revenue
CREATE INDEX IF NOT EXISTS idx_asset_revenue_project_id 
  ON asset_revenue(project_id);

-- change_requests
CREATE INDEX IF NOT EXISTS idx_change_requests_reviewed_by 
  ON change_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_change_requests_user_id 
  ON change_requests(user_id);

-- dashboard_messages
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_created_by 
  ON dashboard_messages(created_by);
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_updated_by 
  ON dashboard_messages(updated_by);

-- dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_created_by 
  ON dashboard_widgets(created_by);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_updated_by 
  ON dashboard_widgets(updated_by);

-- email_preferences_history
CREATE INDEX IF NOT EXISTS idx_email_preferences_history_changed_by 
  ON email_preferences_history(changed_by);

-- label_artist_affiliations
CREATE INDEX IF NOT EXISTS idx_label_artist_affiliations_request_id 
  ON label_artist_affiliations(request_id);

-- media_files
CREATE INDEX IF NOT EXISTS idx_media_files_deleted_by 
  ON media_files(deleted_by);

-- payout_requests
CREATE INDEX IF NOT EXISTS idx_payout_requests_approved_by 
  ON payout_requests(approved_by);
CREATE INDEX IF NOT EXISTS idx_payout_requests_processed_by 
  ON payout_requests(processed_by);

-- profile_change_requests
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_reviewed_by 
  ON profile_change_requests(reviewed_by);

-- revenue_reports
CREATE INDEX IF NOT EXISTS idx_revenue_reports_release 
  ON revenue_reports(release_id);

-- revenue_split_config
CREATE INDEX IF NOT EXISTS idx_revenue_split_config_updated_by 
  ON revenue_split_config(updated_by_user_id);

-- track_analytics
CREATE INDEX IF NOT EXISTS idx_track_analytics_asset_id 
  ON track_analytics(asset_id);

-- user_dismissed_messages
CREATE INDEX IF NOT EXISTS idx_user_dismissed_messages_message_id 
  ON user_dismissed_messages(message_id);

-- user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_admin 
  ON user_profiles(company_admin_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_label_admin 
  ON user_profiles(label_admin_id);

-- user_role_assignments
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_assigned_by 
  ON user_role_assignments(assigned_by);

-- ============================================
-- PART 2: Add Primary Keys to Backup Tables
-- ============================================

-- permissions_backup: Add primary key if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'permissions_backup_pkey'
  ) THEN
    -- Check if id column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'permissions_backup' AND column_name = 'id'
    ) THEN
      ALTER TABLE permissions_backup ADD PRIMARY KEY (id);
    ELSE
      -- Add id column and set as primary key
      ALTER TABLE permissions_backup ADD COLUMN id UUID DEFAULT gen_random_uuid();
      ALTER TABLE permissions_backup ADD PRIMARY KEY (id);
    END IF;
  END IF;
END $$;

-- role_permissions_backup: Add primary key if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'role_permissions_backup_pkey'
  ) THEN
    -- Check if id column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'role_permissions_backup' AND column_name = 'id'
    ) THEN
      ALTER TABLE role_permissions_backup ADD PRIMARY KEY (id);
    ELSE
      -- Add id column and set as primary key
      ALTER TABLE role_permissions_backup ADD COLUMN id UUID DEFAULT gen_random_uuid();
      ALTER TABLE role_permissions_backup ADD PRIMARY KEY (id);
    END IF;
  END IF;
END $$;

-- user_permissions_backup: Add primary key if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_permissions_backup_pkey'
  ) THEN
    -- Check if id column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_permissions_backup' AND column_name = 'id'
    ) THEN
      ALTER TABLE user_permissions_backup ADD PRIMARY KEY (id);
    ELSE
      -- Add id column and set as primary key
      ALTER TABLE user_permissions_backup ADD COLUMN id UUID DEFAULT gen_random_uuid();
      ALTER TABLE user_permissions_backup ADD PRIMARY KEY (id);
    END IF;
  END IF;
END $$;

-- ============================================
-- PART 3: Unused Indexes - OPTIONAL CLEANUP
-- ============================================
-- NOTE: "Unused" doesn't mean "unnecessary"
-- These indexes may be needed for future queries or specific use cases
-- Review each index before dropping in production
-- ============================================

-- Uncomment the DROP INDEX statements below ONLY if you're certain the indexes are not needed
-- Be especially careful with foreign key indexes and frequently queried columns

-- Example: Drop unused indexes (commented out for safety)
/*
-- apollo_insights indexes (if Apollo features are not being used)
DROP INDEX IF EXISTS idx_apollo_insights_user_id;
DROP INDEX IF EXISTS idx_apollo_insights_dismissed;
DROP INDEX IF EXISTS idx_apollo_insights_created_at;
DROP INDEX IF EXISTS idx_apollo_insights_priority;

-- releases indexes (review usage first)
DROP INDEX IF EXISTS idx_releases_artwork_url;
DROP INDEX IF EXISTS idx_releases_audio_file_url;
DROP INDEX IF EXISTS idx_releases_apple_lossless_url;
DROP INDEX IF EXISTS idx_releases_cache_updated;
DROP INDEX IF EXISTS idx_releases_company_admin;
DROP INDEX IF EXISTS idx_releases_distribution_partner;
DROP INDEX IF EXISTS idx_releases_label_status;
DROP INDEX IF EXISTS idx_releases_active;

-- audit_logs indexes (may be needed for compliance)
-- DROP INDEX IF EXISTS idx_audit_logs_user_id;

-- media_files indexes (may be needed for file management)
-- DROP INDEX IF EXISTS idx_media_files_entity;
-- DROP INDEX IF EXISTS idx_media_files_deleted_at;
-- DROP INDEX IF EXISTS idx_media_files_created_at;

-- webhook_logs indexes (may be needed for debugging)
-- DROP INDEX IF EXISTS idx_webhook_logs_provider;
-- DROP INDEX IF EXISTS idx_webhook_logs_order_id;

-- Continue for other unused indexes...
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check unindexed foreign keys (should return 0 rows after fix)
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = tc.table_name 
    AND indexdef LIKE '%' || kcu.column_name || '%'
  )
ORDER BY tc.table_name, kcu.column_name;

-- Check tables without primary keys (should only show backup tables if they still exist)
SELECT 
  t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc
  ON t.table_schema = tc.table_schema
  AND t.table_name = tc.table_name
  AND tc.constraint_type = 'PRIMARY KEY'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND tc.constraint_name IS NULL
ORDER BY t.table_name;

