-- FIX USER ID MISMATCH
-- Update the database to use the correct user ID from the frontend

-- 1. Update the label admin profile to use the correct ID
UPDATE user_profiles 
SET id = 'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'
WHERE email = 'labeladmin@mscandco.com';

-- 2. Update the artist invitation to use the correct label_admin_id
UPDATE artist_invitations 
SET label_admin_id = 'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'
WHERE label_admin_id = '12345678-1234-5678-9012-123456789012';

-- 3. Verify the fix
SELECT 'After fix - user_profiles' as table_name, id, email, role 
FROM user_profiles 
WHERE email = 'labeladmin@mscandco.com';

SELECT 'After fix - artist_invitations' as table_name, label_admin_id, artist_first_name, status 
FROM artist_invitations;
