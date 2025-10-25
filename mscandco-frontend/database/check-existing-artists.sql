-- Check what artists exist in the database
SELECT 
    id,
    email,
    first_name,
    last_name,
    artist_name,
    role,
    created_at
FROM user_profiles
WHERE role = 'artist'
ORDER BY created_at DESC;

-- Also check label admins
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM user_profiles
WHERE role = 'label_admin'
ORDER BY created_at DESC;

