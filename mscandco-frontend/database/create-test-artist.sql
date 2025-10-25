-- Create a test artist for label admin to invite
INSERT INTO user_profiles (
    id,
    email,
    first_name,
    last_name,
    artist_name,
    role,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'moses.bliss@test.com',
    'Moses',
    'Bliss',
    'Moses Bliss',
    'artist',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email, artist_name;

-- Verify it was created
SELECT 
    id,
    email,
    first_name,
    last_name,
    artist_name,
    role
FROM user_profiles
WHERE artist_name = 'Moses Bliss';

