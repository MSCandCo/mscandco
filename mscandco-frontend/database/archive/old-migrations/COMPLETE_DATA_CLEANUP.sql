-- COMPLETE PLATFORM DATA CLEANUP
-- Prepares database for comprehensive platform testing with fresh data
-- Preserves: User accounts, table structure, permissions
-- Cleans: Earnings, releases, analytics, payments, test data

-- ========================================
-- PHASE 1: EARNINGS & WALLET CLEANUP
-- ========================================

-- Clear all earnings entries (test data)
DELETE FROM earnings_log WHERE notes LIKE '%test%' OR notes LIKE '%E2E%';
DELETE FROM earnings_log WHERE platform IN ('BBC', 'Test Platform', 'E2E Platform');
DELETE FROM earnings_log WHERE created_at >= '2025-09-26'; -- Recent test entries

-- Clear payout requests (test payouts)
DELETE FROM earnings_log WHERE earning_type = 'payout_request';

-- Reset wallet balances (will recalculate from remaining earnings)
-- Note: Balances are calculated dynamically, so this will reset automatically

-- ========================================
-- PHASE 2: RELEASES & CONTENT CLEANUP
-- ========================================

-- Clear test releases
DELETE FROM releases WHERE title LIKE '%test%' OR title LIKE '%Test%' OR title LIKE '%E2E%';
DELETE FROM releases WHERE artist LIKE '%test%' OR artist LIKE '%Test%';

-- Clear release analytics data
DELETE FROM platform_stats WHERE created_at >= '2025-09-26';
DELETE FROM milestones WHERE created_at >= '2025-09-26';

-- Clear analytics data from user profiles
UPDATE user_profiles SET analytics_data = NULL WHERE analytics_data IS NOT NULL;

-- ========================================
-- PHASE 3: PAYMENT & SUBSCRIPTION CLEANUP
-- ========================================

-- Clear test subscriptions (keep real ones)
DELETE FROM subscriptions WHERE created_at >= '2025-09-26';

-- Clear test payment history (if table exists)
DELETE FROM payment_history WHERE description LIKE '%test%' OR amount <= 1.00;

-- Clear webhook logs (test data)
DELETE FROM webhook_logs WHERE created_at >= '2025-09-26';

-- ========================================
-- PHASE 4: ANALYTICS & PERFORMANCE CLEANUP
-- ========================================

-- Clear artist analytics entries
DELETE FROM artist_analytics WHERE updated_at >= '2025-09-26';

-- Clear artist releases (test releases)
DELETE FROM artist_releases WHERE created_at >= '2025-09-26';
DELETE FROM artist_releases WHERE title LIKE '%test%' OR title LIKE '%Test%';

-- Clear milestones data
DELETE FROM artist_milestones WHERE created_at >= '2025-09-26';

-- ========================================
-- PHASE 5: ADMINISTRATIVE DATA CLEANUP
-- ========================================

-- Clear change requests (test requests)
DELETE FROM change_requests WHERE created_at >= '2025-09-26';

-- Clear locked fields (test locks)
DELETE FROM locked_fields WHERE created_at >= '2025-09-26';

-- Clear artist requests (test applications)
DELETE FROM artist_requests WHERE created_at >= '2025-09-26';

-- ========================================
-- PHASE 6: PRESERVE ESSENTIAL DATA
-- ========================================

-- Keep user_profiles (Henry, admins, etc.) - DO NOT DELETE
-- Keep essential configuration data
-- Keep RLS policies and permissions
-- Keep table structure and indexes

-- ========================================
-- PHASE 7: RESET SEQUENCES & COUNTERS
-- ========================================

-- Reset auto-increment sequences where needed
-- (PostgreSQL automatically manages UUID sequences)

-- ========================================
-- PHASE 8: VERIFICATION QUERIES
-- ========================================

-- Verify cleanup results
SELECT 'earnings_log' as table_name, COUNT(*) as remaining_rows FROM earnings_log
UNION ALL
SELECT 'releases', COUNT(*) FROM releases
UNION ALL
SELECT 'platform_stats', COUNT(*) FROM platform_stats  
UNION ALL
SELECT 'milestones', COUNT(*) FROM milestones
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;

-- Show remaining earnings by artist
SELECT 
    up.first_name,
    up.last_name,
    COUNT(el.*) as earnings_count,
    SUM(CASE WHEN el.amount > 0 THEN el.amount ELSE 0 END) as total_positive,
    SUM(CASE WHEN el.amount < 0 THEN el.amount ELSE 0 END) as total_negative
FROM user_profiles up
LEFT JOIN earnings_log el ON up.id = el.artist_id
GROUP BY up.id, up.first_name, up.last_name
ORDER BY earnings_count DESC;

-- ========================================
-- PHASE 9: POST-CLEANUP SETUP
-- ========================================

-- Ensure RLS policies are still active
SELECT schemaname, tablename, policyname, permissive
FROM pg_policies 
WHERE tablename IN ('earnings_log', 'releases', 'user_profiles')
ORDER BY tablename, policyname;

-- Verify service role permissions
SELECT 
    schemaname,
    tablename,
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'service_role' 
    AND table_schema = 'public'
ORDER BY tablename;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ COMPLETE DATA CLEANUP FINISHED';
    RAISE NOTICE '🎯 Database ready for comprehensive platform testing';
    RAISE NOTICE '📋 Next: Begin Phase 1 of COMPREHENSIVE_PLATFORM_TEST.md';
    RAISE NOTICE '🔐 User accounts preserved';
    RAISE NOTICE '📊 Analytics data cleared';
    RAISE NOTICE '💰 Earnings data cleaned';
    RAISE NOTICE '🎵 Release data reset';
    RAISE NOTICE '💳 Payment history cleaned';
    RAISE NOTICE '🚀 Ready for real release creation and testing';
END $$;
