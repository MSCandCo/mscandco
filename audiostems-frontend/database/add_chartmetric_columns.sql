-- Add Chartmetric integration columns to user_profiles table

-- Add columns for Chartmetric artist linking
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_chartmetric_artist_id 
ON user_profiles(chartmetric_artist_id);

-- Create index for verified artists
CREATE INDEX IF NOT EXISTS idx_user_profiles_chartmetric_verified 
ON user_profiles(chartmetric_verified) WHERE chartmetric_verified = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.chartmetric_artist_id IS 'Chartmetric artist ID for analytics integration';
COMMENT ON COLUMN user_profiles.chartmetric_artist_name IS 'Artist name from Chartmetric for display purposes';
COMMENT ON COLUMN user_profiles.chartmetric_verified IS 'Whether the Chartmetric artist profile is verified';
COMMENT ON COLUMN user_profiles.chartmetric_linked_at IS 'Timestamp when the Chartmetric artist was linked';
