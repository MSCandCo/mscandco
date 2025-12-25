-- Check if RLS is enabled on all critical tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
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

-- If any show 'false', we need to re-enable RLS

