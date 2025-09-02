-- Add analytics_data column to user_profiles for storing analytics data
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS analytics_data JSONB DEFAULT '{}'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_analytics_data 
ON user_profiles USING GIN (analytics_data);

-- Add comment
COMMENT ON COLUMN user_profiles.analytics_data IS 'JSON storage for manual analytics data managed by admins';
