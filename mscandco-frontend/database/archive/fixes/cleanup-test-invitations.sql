-- CLEANUP TEST INVITATIONS
-- Remove all test invitations so we can test fresh from the UI

-- Delete all pending invitations between labeladmin and Moses Bliss
DELETE FROM affiliation_requests
WHERE label_admin_id = (SELECT id FROM user_profiles WHERE email = 'labeladmin@mscandco.com')
  AND artist_id = (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk')
  AND status = 'pending';

-- Verify cleanup
SELECT 
    'REMAINING INVITATIONS:' as category,
    ar.id,
    ar.status,
    ar.label_percentage,
    ar.artist_name,
    la.email as label_admin_email,
    a.email as artist_email
FROM affiliation_requests ar
LEFT JOIN user_profiles la ON ar.label_admin_id = la.id
LEFT JOIN user_profiles a ON ar.artist_id = a.id
ORDER BY ar.created_at DESC;

