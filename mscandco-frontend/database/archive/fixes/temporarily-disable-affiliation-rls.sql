-- TEMPORARILY DISABLE RLS ON AFFILIATION TABLES
-- This is a temporary fix to test if RLS is the issue

-- Disable RLS on affiliation_requests
ALTER TABLE affiliation_requests DISABLE ROW LEVEL SECURITY;

-- Disable RLS on label_artist_affiliations  
ALTER TABLE label_artist_affiliations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on shared_earnings
ALTER TABLE shared_earnings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('affiliation_requests', 'label_artist_affiliations', 'shared_earnings')
ORDER BY tablename;

