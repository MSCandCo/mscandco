-- RESTORE LABEL ADMIN TEST DATA
-- This recreates the affiliation between Label Admin and Charles Dada

-- First, let's get the IDs we need
-- Run this to see the IDs:
SELECT 
    'Label Admin ID: ' || id as info
FROM user_profiles 
WHERE role = 'label_admin' 
LIMIT 1

UNION ALL

SELECT 
    'Artist (Charles Dada) ID: ' || id
FROM user_profiles 
WHERE role = 'artist' AND artist_name = 'Charles Dada'
LIMIT 1;

-- Now insert the test data
-- Replace the UUIDs below with the actual IDs from the query above

-- 1. Create an affiliation request (accepted)
INSERT INTO affiliation_requests (
    id,
    label_admin_id,
    artist_id,
    artist_first_name,
    artist_last_name,
    artist_name,
    status,
    label_percentage,
    message,
    responded_at,
    created_at
)
SELECT 
    gen_random_uuid(),
    la.id,
    a.id,
    a.first_name,
    a.last_name,
    a.artist_name,
    'accepted',
    30.00,
    'Welcome to the label!',
    '2025-09-30 10:00:00+00',
    '2025-09-30 09:00:00+00'
FROM 
    (SELECT id, first_name, last_name, artist_name FROM user_profiles WHERE role = 'artist' AND artist_name = 'Charles Dada' LIMIT 1) a,
    (SELECT id FROM user_profiles WHERE role = 'label_admin' LIMIT 1) la;

-- 2. Create a pending affiliation request (Henry Taylor)
INSERT INTO affiliation_requests (
    id,
    label_admin_id,
    artist_id,
    artist_first_name,
    artist_last_name,
    artist_name,
    status,
    label_percentage,
    message,
    created_at
)
SELECT 
    gen_random_uuid(),
    la.id,
    NULL, -- Artist doesn't exist yet
    'Henry',
    'Taylor',
    'Henry Taylor',
    'pending',
    30.00,
    'Would love to work with you!',
    '2025-10-01 10:00:00+00'
FROM 
    (SELECT id FROM user_profiles WHERE role = 'label_admin' LIMIT 1) la;

-- 3. Create the active affiliation (partnership)
INSERT INTO label_artist_affiliations (
    id,
    label_admin_id,
    artist_id,
    label_percentage,
    status,
    can_create_releases,
    can_view_analytics,
    can_manage_earnings,
    created_at
)
SELECT 
    gen_random_uuid(),
    la.id,
    a.id,
    30.00,
    'active',
    true,
    true,
    true,
    '2025-09-30 10:00:00+00'
FROM 
    (SELECT id FROM user_profiles WHERE role = 'artist' AND artist_name = 'Charles Dada' LIMIT 1) a,
    (SELECT id FROM user_profiles WHERE role = 'label_admin' LIMIT 1) la;

-- Verify the data was inserted
SELECT 'Affiliation Requests: ' || COUNT(*) as result FROM affiliation_requests
UNION ALL
SELECT 'Active Affiliations: ' || COUNT(*) FROM label_artist_affiliations;

