-- RE-ENABLE RLS ON CRITICAL TABLES
-- These were temporarily disabled for debugging and must be re-enabled for production

-- 1. Re-enable RLS on affiliation_requests
ALTER TABLE affiliation_requests ENABLE ROW LEVEL SECURITY;

-- 2. Re-enable RLS on label_artist_affiliations
ALTER TABLE label_artist_affiliations ENABLE ROW LEVEL SECURITY;

-- 3. Re-enable RLS on shared_earnings
ALTER TABLE shared_earnings ENABLE ROW LEVEL SECURITY;

-- 4. Verify all tables now have RLS enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ SECURED'
        ELSE '❌ VULNERABLE'
    END as security_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'affiliation_requests',
    'label_artist_affiliations',
    'shared_earnings',
    'user_profiles',
    'releases',
    'notifications'
)
ORDER BY tablename;

-- 5. Verify RLS policies exist for these tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'affiliation_requests',
    'label_artist_affiliations',
    'shared_earnings'
)
ORDER BY tablename, policyname;

