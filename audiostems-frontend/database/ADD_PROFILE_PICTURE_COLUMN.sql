-- Add profile picture URL column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Verify column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'profile_picture_url';
