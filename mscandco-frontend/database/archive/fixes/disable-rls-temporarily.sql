-- TEMPORARILY DISABLE RLS FOR DEBUGGING
-- Run this to see if RLS is blocking the queries

ALTER TABLE label_artist_affiliations DISABLE ROW LEVEL SECURITY;
ALTER TABLE affiliation_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_earnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE releases DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Check if the tables have data
SELECT 'label_artist_affiliations' as table_name, COUNT(*) as count FROM label_artist_affiliations
UNION ALL
SELECT 'affiliation_requests', COUNT(*) FROM affiliation_requests
UNION ALL
SELECT 'releases', COUNT(*) FROM releases
UNION ALL
SELECT 'user_profiles (label_admin)', COUNT(*) FROM user_profiles WHERE role = 'label_admin'
UNION ALL
SELECT 'user_profiles (artist)', COUNT(*) FROM user_profiles WHERE role = 'artist';

