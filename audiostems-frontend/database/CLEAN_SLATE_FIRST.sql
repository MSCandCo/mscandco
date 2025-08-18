-- ==========================================
-- CLEAN SLATE - Remove All Existing Objects
-- ==========================================

-- Drop all existing tables (if any)
DROP TABLE IF EXISTS asset_revenue CASCADE;
DROP TABLE IF EXISTS monthly_statements CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS revenue_splits CASCADE;
DROP TABLE IF EXISTS artist_label_requests CASCADE;
DROP TABLE IF EXISTS profile_change_requests CASCADE;
DROP TABLE IF EXISTS user_backup_codes CASCADE;
DROP TABLE IF EXISTS email_verification_codes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop all existing functions (if any)
DROP FUNCTION IF EXISTS check_release_limit(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_artist_limit(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_backup_codes(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_auto_save() CASCADE;

-- Drop all existing types (if any)
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS relationship_status CASCADE;
DROP TYPE IF EXISTS change_request_status CASCADE;
DROP TYPE IF EXISTS registration_stage CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS release_type CASCADE;
DROP TYPE IF EXISTS release_status CASCADE;
DROP TYPE IF EXISTS contract_status CASCADE;
DROP TYPE IF EXISTS artist_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS platform_user_role CASCADE;

-- Confirm clean state
SELECT 'Database cleaned - ready for fresh schema' AS status;
