-- CREATE MISSING USER PROFILE
-- First create the user profile that the frontend is using

-- 1. Create the missing user profile for the current frontend user
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

-- 2. Now update the invitation to use the correct label_admin_id
UPDATE artist_invitations 
SET label_admin_id = 'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'
WHERE label_admin_id = '12345678-1234-5678-9012-123456789012';

-- 3. Clean up old profile if it exists
DELETE FROM user_profiles 
WHERE id = '12345678-1234-5678-9012-123456789012' 
AND email = 'labeladmin@mscandco.com';

-- 4. Verify the fix
SELECT 'Current profiles' as table_name, id, email, role 
FROM user_profiles 
WHERE email = 'labeladmin@mscandco.com';

SELECT 'Current invitations' as table_name, label_admin_id, artist_first_name, status 
FROM artist_invitations;
