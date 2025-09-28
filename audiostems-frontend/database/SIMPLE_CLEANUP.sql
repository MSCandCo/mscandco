-- SIMPLE DATABASE CLEANUP FOR FRESH TESTING
-- Quick cleanup of test data while preserving user accounts

-- Clear all earnings (we'll add real ones during testing)
DELETE FROM earnings_log;

-- Clear releases (we'll create real ones)
DELETE FROM releases;
DELETE FROM artist_releases;

-- Clear analytics data
DELETE FROM platform_stats;
DELETE FROM milestones;
DELETE FROM artist_milestones;
UPDATE user_profiles SET analytics_data = NULL;

-- Clear test subscriptions
DELETE FROM subscriptions WHERE created_at >= '2025-09-26';

-- Clear change requests
DELETE FROM change_requests;

-- Verification
SELECT 
    'earnings_log' as table_name, COUNT(*) as rows FROM earnings_log
UNION ALL
SELECT 'releases', COUNT(*) FROM releases
UNION ALL  
SELECT 'user_profiles', COUNT(*) FROM user_profiles;

-- Success message
SELECT '✅ Simple cleanup complete - ready for comprehensive testing!' as status;
