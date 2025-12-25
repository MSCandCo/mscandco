-- TEST DIRECT INSERT AS POSTGRES USER
-- This will tell us if the table structure is correct

INSERT INTO affiliation_requests (
    label_admin_id,
    artist_id,
    artist_first_name,
    artist_last_name,
    artist_name,
    label_percentage,
    message,
    status,
    created_at
) VALUES (
    (SELECT id FROM user_profiles WHERE email = 'labeladmin@mscandco.com'),
    (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk'),
    'Henry',
    'Taylor',
    'Moses Bliss',
    70,
    'Direct SQL test insert',
    'pending',
    NOW()
) RETURNING *;

