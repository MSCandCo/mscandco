-- CAUTIOUS CLEAN SLATE - Complete Database Reset
-- This will safely remove everything and prepare for fresh rebuild

-- Step 1: Drop all policies first (to avoid dependency issues)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Step 2: Drop all tables (in correct order to handle dependencies)
DROP TABLE IF EXISTS asset_revenue CASCADE;
DROP TABLE IF EXISTS monthly_statements CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS revenue_splits CASCADE;
DROP TABLE IF EXISTS artist_label_requests CASCADE;
DROP TABLE IF EXISTS profile_change_requests CASCADE;
DROP TABLE IF EXISTS user_backup_codes CASCADE;
DROP TABLE IF EXISTS email_verification_codes CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 3: Drop all functions
DROP FUNCTION IF EXISTS check_release_limit(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_artist_limit(uuid) CASCADE;
DROP FUNCTION IF EXISTS generate_backup_codes(uuid) CASCADE;
DROP FUNCTION IF EXISTS advance_registration_stage(uuid) CASCADE;
DROP FUNCTION IF EXISTS lock_basic_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 4: Drop all ENUM types
DROP TYPE IF EXISTS platform_user_role CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS registration_stage CASCADE;
DROP TYPE IF EXISTS change_request_status CASCADE;
DROP TYPE IF EXISTS relationship_status CASCADE;
DROP TYPE IF EXISTS artist_type CASCADE;
DROP TYPE IF EXISTS contract_status CASCADE;
DROP TYPE IF EXISTS release_status CASCADE;
DROP TYPE IF EXISTS release_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Step 5: Drop and recreate the entire public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Verification
SELECT 'CLEAN SLATE COMPLETE - Database is now empty and ready for rebuild' as status;

-- Show that everything is gone
SELECT 
    'Tables remaining:' as info,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public';

SELECT 
    'ENUM types remaining:' as info,
    COUNT(*) as count
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public' 
AND t.typtype = 'e';

SELECT 'Ready for complete rebuild!' as final_status;
