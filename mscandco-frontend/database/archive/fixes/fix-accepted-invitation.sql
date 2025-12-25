-- Fix the accepted invitation by creating the missing affiliation
-- This should have been created automatically when the artist accepted

-- 1. Create the missing affiliation for the accepted invitation
INSERT INTO label_artist_affiliations (
    label_admin_id,
    artist_id,
    label_percentage,
    status,
    created_at
)
SELECT 
    label_admin_id,
    artist_id,
    label_percentage,
    'active',
    NOW()
FROM affiliation_requests
WHERE id = '5a3c7c08-f8d2-47e0-8d5d-fbcb6c431bdb'
AND status = 'accepted'
ON CONFLICT DO NOTHING;

-- 2. Delete the duplicate pending invitation (older one)
DELETE FROM affiliation_requests
WHERE id = '3c40a0a0-c491-4fd6-bd05-1ded084df7ef'
AND status = 'pending';

-- 3. Verify the results
SELECT 
    'ACTIVE AFFILIATIONS' as category,
    aff.id,
    aff.status,
    aff.label_percentage,
    aff.created_at,
    la.email as label_admin_email,
    a.email as artist_email,
    a.artist_name
FROM label_artist_affiliations aff
LEFT JOIN user_profiles la ON aff.label_admin_id = la.id
LEFT JOIN user_profiles a ON aff.artist_id = a.id
ORDER BY aff.created_at DESC;

-- 4. Check remaining invitations
SELECT 
    'REMAINING INVITATIONS' as category,
    ar.id,
    ar.status,
    ar.artist_name,
    ar.label_percentage,
    ar.created_at
FROM affiliation_requests ar
ORDER BY ar.created_at DESC;

