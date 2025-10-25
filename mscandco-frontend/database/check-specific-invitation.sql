-- Check the specific invitation that's failing
SELECT 
    id,
    label_admin_id,
    artist_id,
    artist_name,
    artist_first_name,
    artist_last_name,
    label_percentage,
    status,
    created_at
FROM affiliation_requests
WHERE id = '6bde7225-9679-4e06-9192-b163357bb674';

-- Check if there are ANY invitations for Moses Bliss
SELECT 
    id,
    label_admin_id,
    artist_id,
    artist_name,
    status,
    created_at
FROM affiliation_requests
WHERE artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d'
   OR artist_name = 'Moses Bliss'
ORDER BY created_at DESC;

-- Check ALL pending invitations
SELECT 
    id,
    label_admin_id,
    artist_id,
    artist_name,
    status,
    created_at
FROM affiliation_requests
WHERE status = 'pending'
ORDER BY created_at DESC;

