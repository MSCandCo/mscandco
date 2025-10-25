-- CHECK MOSES BLISS AFFILIATIONS AND REQUESTS

-- 1. Find Moses Bliss user
SELECT 
    'MOSES BLISS USER:' as category,
    id,
    email,
    first_name,
    last_name,
    artist_name,
    role,
    created_at
FROM user_profiles
WHERE artist_name = 'Moses Bliss' OR email = 'info@htay.co.uk'
ORDER BY created_at DESC;

-- 2. Check all affiliation requests for Moses Bliss
SELECT 
    'AFFILIATION REQUESTS FOR MOSES BLISS:' as category,
    ar.id,
    ar.status,
    ar.label_percentage,
    ar.message,
    ar.created_at,
    la.email as label_admin_email,
    la.first_name || ' ' || la.last_name as label_admin_name
FROM affiliation_requests ar
LEFT JOIN user_profiles la ON ar.label_admin_id = la.id
WHERE ar.artist_id = (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk')
   OR ar.artist_name = 'Moses Bliss'
ORDER BY ar.created_at DESC;

-- 3. Check active affiliations for Moses Bliss
SELECT 
    'ACTIVE AFFILIATIONS FOR MOSES BLISS:' as category,
    aff.id,
    aff.status,
    aff.label_percentage,
    aff.created_at,
    la.email as label_admin_email,
    la.first_name || ' ' || la.last_name as label_admin_name
FROM label_artist_affiliations aff
LEFT JOIN user_profiles la ON aff.label_admin_id = la.id
WHERE aff.artist_id = (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk')
ORDER BY aff.created_at DESC;

-- 4. Check Label Admin user
SELECT 
    'LABEL ADMIN USER:' as category,
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM user_profiles
WHERE email = 'labeladmin@mscandco.com';

-- 5. Check if service role can insert (this will fail if RLS is blocking service role)
-- Comment out if you want to run this separately
-- INSERT INTO affiliation_requests (
--     label_admin_id,
--     artist_id,
--     artist_first_name,
--     artist_last_name,
--     artist_name,
--     label_percentage,
--     message,
--     status
-- ) VALUES (
--     (SELECT id FROM user_profiles WHERE email = 'labeladmin@mscandco.com'),
--     (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk'),
--     'Henry',
--     'Taylor',
--     'Moses Bliss',
--     70,
--     'Test from SQL - checking if service role can insert',
--     'pending'
-- ) RETURNING id, status, label_percentage;

