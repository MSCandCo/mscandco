-- Check the invitation details to debug the artist response issue
SELECT 
    ar.id as invitation_id,
    ar.label_admin_id,
    ar.artist_id,
    ar.artist_name,
    ar.status,
    ar.label_percentage,
    la.email as label_admin_email,
    a.email as artist_email,
    a.id as actual_artist_id
FROM affiliation_requests ar
LEFT JOIN user_profiles la ON ar.label_admin_id = la.id
LEFT JOIN user_profiles a ON ar.artist_id = a.id
WHERE ar.id = '6bde7225-9679-4e06-9192-b163357bb674';

-- Also check all invitations for Moses Bliss
SELECT 
    ar.id as invitation_id,
    ar.label_admin_id,
    ar.artist_id,
    ar.artist_name,
    ar.status,
    la.email as label_admin_email
FROM affiliation_requests ar
LEFT JOIN user_profiles la ON ar.label_admin_id = la.id
WHERE ar.artist_name = 'Moses Bliss'
ORDER BY ar.created_at DESC;

-- Check Moses Bliss user ID
SELECT id, email, artist_name FROM user_profiles WHERE email = 'info@htay.co.uk';

