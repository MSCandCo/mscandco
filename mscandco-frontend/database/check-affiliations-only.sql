-- Check affiliation requests
SELECT 
    'AFFILIATION REQUESTS:' as category,
    ar.id,
    ar.status,
    ar.artist_name,
    ar.artist_first_name,
    ar.artist_last_name,
    ar.label_percentage,
    ar.created_at,
    la.email as label_admin_email,
    a.email as artist_email,
    a.artist_name as actual_artist_name
FROM affiliation_requests ar
LEFT JOIN user_profiles la ON ar.label_admin_id = la.id
LEFT JOIN user_profiles a ON ar.artist_id = a.id
ORDER BY ar.created_at DESC;

-- Check active affiliations
SELECT 
    'ACTIVE AFFILIATIONS:' as category,
    aff.id,
    aff.status,
    aff.label_percentage,
    aff.created_at,
    la.email as label_admin_email,
    la.first_name || ' ' || la.last_name as label_admin_name,
    a.email as artist_email,
    a.artist_name
FROM label_artist_affiliations aff
LEFT JOIN user_profiles la ON aff.label_admin_id = la.id
LEFT JOIN user_profiles a ON aff.artist_id = a.id
ORDER BY aff.created_at DESC;

