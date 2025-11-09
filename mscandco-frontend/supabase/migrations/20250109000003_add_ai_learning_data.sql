-- Add AI learning data column to user_profiles
-- This stores release patterns, preferences, and learning insights
-- to make future releases easier and more intelligent

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS ai_learning_data JSONB DEFAULT '{}'::jsonb;

-- Create index for faster queries on learning data
CREATE INDEX IF NOT EXISTS idx_user_profiles_ai_learning_data 
ON user_profiles USING GIN (ai_learning_data);

-- Add comment
COMMENT ON COLUMN user_profiles.ai_learning_data IS 'AI learning data: release patterns, preferences, common genres, release types, and intelligence insights to improve future releases';

