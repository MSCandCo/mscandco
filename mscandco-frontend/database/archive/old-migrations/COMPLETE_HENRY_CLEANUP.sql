-- COMPLETE HENRY CLEANUP FOR FRESH TESTING
-- Removes ALL earnings entries for Henry Taylor to start completely fresh

-- Clear ALL earnings for Henry (including all test data from previous testing)
DELETE FROM earnings_log WHERE artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d';

-- Verify cleanup
SELECT 
    'earnings_log' as table_name, 
    COUNT(*) as remaining_entries,
    'for Henry Taylor' as note
FROM earnings_log 
WHERE artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d';

-- Show total earnings entries remaining (all users)
SELECT 
    'earnings_log' as table_name,
    COUNT(*) as total_entries,
    'all users' as note
FROM earnings_log;

-- Success message
SELECT '✅ Complete Henry cleanup finished - wallet should now show £0.00' as status;
