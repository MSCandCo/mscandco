-- Comprehensive AI Learning System
-- Expands ai_learning_data to track learning at every level, stage, and part of the platform

-- First, ensure the column exists
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS ai_learning_data JSONB DEFAULT '{}'::jsonb;

-- Create comprehensive learning data structure
-- This will be updated incrementally as users interact with the platform

COMMENT ON COLUMN user_profiles.ai_learning_data IS 'Comprehensive AI learning data tracking all user interactions, patterns, and preferences across every aspect of the platform for intelligent, adaptive experiences';

-- Create a function to update learning data intelligently
CREATE OR REPLACE FUNCTION update_ai_learning_data(
  p_user_id UUID,
  p_category TEXT,
  p_data JSONB
)
RETURNS void AS $$
DECLARE
  current_data JSONB;
BEGIN
  -- Get current learning data
  SELECT ai_learning_data INTO current_data
  FROM user_profiles
  WHERE id = p_user_id;

  -- Initialize if null
  IF current_data IS NULL THEN
    current_data := '{}'::jsonb;
  END IF;

  -- Merge new data into category
  current_data := jsonb_set(
    current_data,
    ARRAY[p_category],
    COALESCE(current_data->p_category, '{}'::jsonb) || p_data,
    true
  );

  -- Update timestamp
  current_data := jsonb_set(
    current_data,
    ARRAY['lastUpdated'],
    to_jsonb(NOW()),
    true
  );

  -- Save back
  UPDATE user_profiles
  SET ai_learning_data = current_data,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_ai_learning_data(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_learning_data(UUID, TEXT, JSONB) TO service_role;

COMMENT ON FUNCTION update_ai_learning_data IS 'Updates AI learning data for a specific category, merging intelligently without overwriting existing data';

-- Create table to track all user interactions for learning
CREATE TABLE IF NOT EXISTS user_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'page_view', 'feature_use', 'release_created', 'analytics_viewed', etc.
  interaction_category TEXT NOT NULL, -- 'navigation', 'releases', 'analytics', 'earnings', 'settings', etc.
  interaction_data JSONB DEFAULT '{}'::jsonb, -- Contextual data about the interaction
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  location_data JSONB, -- Country, city, timezone
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast learning queries
CREATE INDEX IF NOT EXISTS idx_interaction_logs_user_id ON user_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_type ON user_interaction_logs(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_category ON user_interaction_logs(interaction_category);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_created_at ON user_interaction_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_user_category ON user_interaction_logs(user_id, interaction_category);

-- RLS Policies
ALTER TABLE user_interaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interaction logs"
  ON user_interaction_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all interaction logs"
  ON user_interaction_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE user_interaction_logs IS 'Comprehensive log of all user interactions for AI learning and pattern recognition';

-- Create index for faster queries on learning data
CREATE INDEX IF NOT EXISTS idx_user_profiles_ai_learning_data 
ON user_profiles USING GIN (ai_learning_data);

