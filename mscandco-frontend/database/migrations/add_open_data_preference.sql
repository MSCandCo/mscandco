-- Add show_open_data_features preference to user_profiles table
-- This allows users to toggle Open Data link visibility in the header

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS show_open_data_features BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.show_open_data_features IS 'Whether to show Open Data link in navigation';
