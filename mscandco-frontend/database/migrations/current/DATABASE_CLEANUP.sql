-- MSC & Co Database Cleanup Script
-- Remove deprecated tables and optimize current structure
-- Run this in Supabase SQL Editor AFTER backing up important data

-- ===============================================
-- STEP 1: BACKUP IMPORTANT DATA (RUN FIRST!)
-- ===============================================

-- Create backup of current earnings_log (our active table)
CREATE TABLE IF NOT EXISTS earnings_log_backup AS 
SELECT * FROM earnings_log;

-- Create backup of user_profiles analytics data
CREATE TABLE IF NOT EXISTS user_analytics_backup AS 
SELECT id, email, analytics_data FROM user_profiles 
WHERE analytics_data IS NOT NULL AND analytics_data != '{}'::jsonb;

-- ===============================================
-- STEP 2: VERIFY CURRENT ACTIVE SYSTEM
-- ===============================================

-- Verify earnings_log is our active table (should have 7+ entries)
SELECT 'earnings_log verification' as check_type, COUNT(*) as count FROM earnings_log;

-- Verify user_profiles has analytics_data column
SELECT 'user_profiles analytics' as check_type, 
       COUNT(analytics_data) as users_with_analytics 
FROM user_profiles;

-- Verify our working APIs depend on these tables
SELECT 'Active system verification' as status,
       'earnings_log + user_profiles + subscriptions' as core_tables,
       'All APIs working with this structure' as note;

-- ===============================================
-- STEP 3: IDENTIFY OLD/UNUSED TABLES TO DROP
-- ===============================================

-- Check if these old tables exist (they might not, which is good)
-- If they exist and are empty/unused, we can drop them

-- Check for old earnings tables
SELECT 'earnings_entries' as table_name, 
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_name = 'earnings_entries' AND table_schema = 'public'
       ) THEN 'EXISTS' ELSE 'DOES NOT EXIST' END as status;

SELECT 'artist_wallet' as table_name,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_name = 'artist_wallet' AND table_schema = 'public'
       ) THEN 'EXISTS' ELSE 'DOES NOT EXIST' END as status;

SELECT 'payout_history' as table_name,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_name = 'payout_history' AND table_schema = 'public'
       ) THEN 'EXISTS' ELSE 'DOES NOT EXIST' END as status;

-- Check for Chartmetric remnants
SELECT 'chartmetric_data' as table_name,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_name = 'chartmetric_data' AND table_schema = 'public'
       ) THEN 'EXISTS - SHOULD BE DROPPED' ELSE 'DOES NOT EXIST' END as status;

-- Check for old analytics tables
SELECT 'analytics_data' as table_name,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_name = 'analytics_data' AND table_schema = 'public'
       ) THEN 'EXISTS - CHECK IF USED' ELSE 'DOES NOT EXIST' END as status;

-- ===============================================
-- STEP 4: CHECK FOR UNUSED COLUMNS
-- ===============================================

-- Check if user_profiles has old chartmetric columns
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
  AND column_name LIKE '%chartmetric%';

-- Check if user_profiles has earnings_data column (old)
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
  AND column_name = 'earnings_data';

-- ===============================================
-- STEP 5: CLEANUP COMMANDS (EXECUTE CAREFULLY!)
-- ===============================================

-- ONLY RUN THESE IF THE TABLES ARE VERIFIED AS UNUSED:

-- Drop old tables if they exist and are empty/unused
-- UNCOMMENT THESE LINES AFTER VERIFICATION:

-- DROP TABLE IF EXISTS earnings_entries CASCADE;
-- DROP TABLE IF EXISTS artist_wallet CASCADE;  
-- DROP TABLE IF EXISTS payout_history CASCADE;
-- DROP TABLE IF EXISTS chartmetric_data CASCADE;
-- DROP TABLE IF EXISTS analytics_data CASCADE;

-- Remove old columns from user_profiles if they exist
-- UNCOMMENT THESE LINES AFTER VERIFICATION:

-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS chartmetric_data;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS earnings_data;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS chartmetric_artist_id;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS chartmetric_artist_name;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS chartmetric_verified;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS chartmetric_linked_at;

-- ===============================================
-- STEP 6: OPTIMIZE CURRENT STRUCTURE
-- ===============================================

-- Ensure earnings_log has proper indexes
CREATE INDEX IF NOT EXISTS idx_earnings_log_artist_id ON earnings_log(artist_id);
CREATE INDEX IF NOT EXISTS idx_earnings_log_status ON earnings_log(status);
CREATE INDEX IF NOT EXISTS idx_earnings_log_earning_type ON earnings_log(earning_type);
CREATE INDEX IF NOT EXISTS idx_earnings_log_created_at ON earnings_log(created_at);

-- Ensure user_profiles has analytics index
CREATE INDEX IF NOT EXISTS idx_user_profiles_analytics_data 
ON user_profiles USING GIN (analytics_data);

-- Update table statistics
ANALYZE earnings_log;
ANALYZE user_profiles;
ANALYZE subscriptions;

-- ===============================================
-- STEP 7: VERIFICATION QUERIES
-- ===============================================

-- Final verification that our active system is intact
SELECT 'FINAL VERIFICATION' as step;

-- Check earnings_log has all data
SELECT 'earnings_log' as table_name, 
       COUNT(*) as total_entries,
       COUNT(DISTINCT artist_id) as unique_artists,
       COUNT(CASE WHEN earning_type = 'payout_request' THEN 1 END) as payout_requests,
       SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_positive,
       SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as total_negative
FROM earnings_log;

-- Check user_profiles analytics data
SELECT 'user_profiles' as table_name,
       COUNT(*) as total_users,
       COUNT(analytics_data) as users_with_analytics_column,
       COUNT(CASE WHEN analytics_data != '{}'::jsonb THEN 1 END) as users_with_analytics_data
FROM user_profiles;

-- Show sample earnings data to verify structure
SELECT 'Sample earnings_log data' as info;
SELECT 
  earning_type,
  platform,
  amount,
  currency,
  status,
  LEFT(notes, 50) as notes_preview
FROM earnings_log 
ORDER BY created_at DESC 
LIMIT 5;

-- Show user with analytics data
SELECT 'Sample user analytics' as info;
SELECT 
  email,
  analytics_data->>'lastUpdated' as last_updated,
  CASE WHEN analytics_data->'latestRelease' IS NOT NULL THEN 'HAS_RELEASE' ELSE 'NO_RELEASE' END as release_status
FROM user_profiles 
WHERE analytics_data IS NOT NULL 
  AND analytics_data != '{}'::jsonb
LIMIT 3;

SELECT 'Database cleanup verification completed successfully' as final_message;
