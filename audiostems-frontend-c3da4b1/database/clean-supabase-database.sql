-- =====================================================
-- COMPLETE SUPABASE DATABASE CLEANUP SCRIPT
-- This will remove ALL data and tables to start fresh
-- =====================================================

-- WARNING: This will delete ALL your data!
-- Only run this if you want to completely start over

-- 1. Drop all custom tables (in reverse dependency order)
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS subscription_payments CASCADE;
DROP TABLE IF EXISTS change_requests CASCADE;
DROP TABLE IF EXISTS percentage_splits CASCADE;
DROP TABLE IF EXISTS negative_balance_artists CASCADE;
DROP TABLE IF EXISTS revenue_distributions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS releases CASCADE;
DROP TABLE IF EXISTS download_history CASCADE;
DROP TABLE IF EXISTS monthly_statements CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS stems CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS collaborations CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS distribution_profiles CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;
DROP TABLE IF EXISTS label_profiles CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. Drop all custom types
DROP TYPE IF EXISTS wallet_transaction_type CASCADE;
DROP TYPE IF EXISTS change_request_status CASCADE;
DROP TYPE IF EXISTS release_workflow_status CASCADE;
DROP TYPE IF EXISTS publishing_type CASCADE;
DROP TYPE IF EXISTS product_type CASCADE;
DROP TYPE IF EXISTS format_type CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 3. Drop all custom functions
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to confirm everything is clean:
-- =====================================================

-- Check remaining tables (should only show Supabase system tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check remaining custom types (should be empty)
SELECT typname 
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typtype = 'e'
ORDER BY typname;

-- =====================================================
-- CLEAN AUTH USERS (Optional - removes all users)
-- Uncomment the lines below if you also want to remove all auth users
-- =====================================================

-- DELETE FROM auth.users;
-- DELETE FROM auth.identities;
-- DELETE FROM auth.sessions;

-- =====================================================
-- NOTES:
-- 1. This script is IRREVERSIBLE
-- 2. After running this, you'll need to run the master schema again
-- 3. You'll need to recreate all users
-- 4. All data will be permanently lost
-- =====================================================
