-- ========================================
-- ADD ESSENTIAL PROFILE COLUMNS
-- Safe migration to add missing columns to existing user_profiles table
-- ========================================

-- Add basic profile columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add artist-specific columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS artist_name TEXT,
ADD COLUMN IF NOT EXISTS artist_type TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+44';

-- Add music information columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS primary_genre TEXT,
ADD COLUMN IF NOT EXISTS secondary_genre TEXT,
ADD COLUMN IF NOT EXISTS vocal_type TEXT,
ADD COLUMN IF NOT EXISTS years_active TEXT;

-- Add business information columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS record_label TEXT,
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add social media columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS threads TEXT,
ADD COLUMN IF NOT EXISTS soundcloud TEXT,
ADD COLUMN IF NOT EXISTS apple_music TEXT;

-- Add profile management columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS basic_profile_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS isrc_prefix TEXT;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality ON user_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON user_profiles(country);
CREATE INDEX IF NOT EXISTS idx_user_profiles_artist_name ON user_profiles(artist_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_genre ON user_profiles(primary_genre);

-- Update the updated_at timestamp for existing records
UPDATE user_profiles SET updated_at = NOW() WHERE updated_at IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.nationality IS 'User nationality for legal/tax purposes';
COMMENT ON COLUMN user_profiles.country IS 'Current country of residence';
COMMENT ON COLUMN user_profiles.city IS 'Current city of residence';
COMMENT ON COLUMN user_profiles.basic_profile_locked IS 'Whether basic info is locked and requires admin approval to change';
COMMENT ON COLUMN user_profiles.artist_name IS 'Professional/stage name for artists';
COMMENT ON COLUMN user_profiles.primary_genre IS 'Primary music genre';
COMMENT ON COLUMN user_profiles.secondary_genre IS 'Secondary music genre';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
