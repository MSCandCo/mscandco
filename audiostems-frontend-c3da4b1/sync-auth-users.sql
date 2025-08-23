-- Simple fix: Create missing user profiles for existing auth users
-- This ensures EVERY user in auth.users has a matching record in user_profiles

INSERT INTO user_profiles (id, email, role)
SELECT 
    au.id,
    au.email,
    'artist'::user_role_enum
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
)
ON CONFLICT (id) DO NOTHING;
