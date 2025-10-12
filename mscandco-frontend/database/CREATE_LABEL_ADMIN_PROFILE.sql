-- CREATE MISSING LABEL ADMIN PROFILE
-- Simple fix: ensure the frontend user exists in database

INSERT INTO user_profiles (
    id,
    email,
    role,
    first_name,
    last_name,
    created_at
) VALUES (
    'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a',
    'labeladmin@mscandco.com',
    'label_admin',
    'Label',
    'Admin',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email;

-- Verify profile exists
SELECT 'Profile created' as status, id, email, role FROM user_profiles WHERE id = 'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a';
