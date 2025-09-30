-- SIMPLE FIX: Update invitation to use current user ID
-- Don't change user_profiles, just update the invitation

-- 1. Update the artist invitation to use the correct label_admin_id
UPDATE artist_invitations 
SET label_admin_id = 'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'
WHERE label_admin_id = '12345678-1234-5678-9012-123456789012';

-- 2. Verify the fix
SELECT 'Fixed invitation' as status, label_admin_id, artist_first_name, status 
FROM artist_invitations;
