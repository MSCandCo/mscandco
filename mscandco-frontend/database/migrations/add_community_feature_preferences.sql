-- Add community feature preferences to user_profiles table
-- This allows users to toggle visibility of community feature links in the header

-- Sustainability features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_sustainability_features BOOLEAN DEFAULT false;

-- Lyrics Analysis features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_lyrics_features BOOLEAN DEFAULT false;

-- Copyright features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_copyright_features BOOLEAN DEFAULT false;

-- Learning features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_learning_features BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.show_sustainability_features IS 'Whether to show Sustainability link in navigation';
COMMENT ON COLUMN user_profiles.show_lyrics_features IS 'Whether to show Lyrics Analysis link in navigation';
COMMENT ON COLUMN user_profiles.show_copyright_features IS 'Whether to show Copyright link in navigation';
COMMENT ON COLUMN user_profiles.show_learning_features IS 'Whether to show Learning link in navigation';
