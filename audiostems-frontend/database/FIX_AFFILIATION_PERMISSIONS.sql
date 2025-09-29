-- FIX AFFILIATION SYSTEM PERMISSIONS
-- Grant service role access to affiliation tables

-- 1. Grant permissions to service role
GRANT ALL ON affiliation_requests TO service_role;
GRANT ALL ON label_artist_affiliations TO service_role; 
GRANT ALL ON shared_earnings TO service_role;

-- 2. Temporarily disable RLS for testing (can re-enable later)
ALTER TABLE affiliation_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE label_artist_affiliations DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_earnings DISABLE ROW LEVEL SECURITY;

-- 3. Test data - create a sample affiliation request
INSERT INTO affiliation_requests (label_admin_id, artist_id, message, label_percentage, status)
VALUES (
    (SELECT id FROM user_profiles WHERE email = 'labeladmin@mscandco.com'),
    (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk'),
    'MSC & Co would like to partner with you as your label. We offer 15% partnership on earnings.',
    15.0,
    'pending'
) ON CONFLICT DO NOTHING;

-- 4. Verify tables exist and are accessible
SELECT 'affiliation_requests' as table_name, COUNT(*) as row_count FROM affiliation_requests
UNION ALL
SELECT 'label_artist_affiliations' as table_name, COUNT(*) as row_count FROM label_artist_affiliations
UNION ALL  
SELECT 'shared_earnings' as table_name, COUNT(*) as row_count FROM shared_earnings;
