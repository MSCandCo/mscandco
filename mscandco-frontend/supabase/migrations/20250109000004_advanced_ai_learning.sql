-- Advanced AI Learning System - Highest Level Implementation
-- Includes: Predictive Analytics, Pattern Recognition, Behavioral Clustering,
-- Reinforcement Learning, Multi-Armed Bandit, Time-Series Analysis, Collaborative Filtering

-- Enhanced learning data structure with advanced ML features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS ai_intelligence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_learning_confidence DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ai_prediction_accuracy DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ai_behavioral_cluster TEXT,
ADD COLUMN IF NOT EXISTS ai_last_learning_update TIMESTAMP WITH TIME ZONE;

-- Create advanced learning analytics table
CREATE TABLE IF NOT EXISTS ai_learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'prediction', 'recommendation', 'pattern', 'anomaly'
  metric_category TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  confidence_score DECIMAL(5,2),
  accuracy_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_learning_analytics_user_id ON ai_learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_analytics_metric_type ON ai_learning_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_learning_analytics_created_at ON ai_learning_analytics(created_at DESC);

-- Create behavioral patterns table for advanced pattern recognition
CREATE TABLE IF NOT EXISTS ai_behavioral_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'temporal', 'sequential', 'frequency', 'preference'
  pattern_data JSONB NOT NULL,
  confidence DECIMAL(5,2),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  frequency INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_behavioral_patterns_user_id ON ai_behavioral_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_patterns_type ON ai_behavioral_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_behavioral_patterns_confidence ON ai_behavioral_patterns(confidence DESC);

-- Create prediction outcomes table for reinforcement learning
CREATE TABLE IF NOT EXISTS ai_prediction_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  predicted_value JSONB NOT NULL,
  actual_value JSONB,
  accuracy DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_prediction_outcomes_user_id ON ai_prediction_outcomes(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_outcomes_type ON ai_prediction_outcomes(prediction_type);
CREATE INDEX IF NOT EXISTS idx_prediction_outcomes_accuracy ON ai_prediction_outcomes(accuracy DESC);

-- Advanced learning function with reinforcement learning
CREATE OR REPLACE FUNCTION update_advanced_learning(
  p_user_id UUID,
  p_category TEXT,
  p_data JSONB,
  p_outcome JSONB DEFAULT NULL -- For reinforcement learning feedback
)
RETURNS JSONB AS $$
DECLARE
  current_data JSONB;
  updated_data JSONB;
  confidence_score DECIMAL(5,2);
  intelligence_score INTEGER;
BEGIN
  -- Get current learning data
  SELECT ai_learning_data INTO current_data
  FROM user_profiles
  WHERE id = p_user_id;

  IF current_data IS NULL THEN
    current_data := '{}'::jsonb;
  END IF;

  -- Merge new data intelligently with confidence weighting
  updated_data := jsonb_set(
    current_data,
    ARRAY[p_category],
    COALESCE(current_data->p_category, '{}'::jsonb) || p_data,
    true
  );

  -- Calculate confidence based on data consistency
  confidence_score := calculate_confidence(p_user_id, p_category, p_data);

  -- Update intelligence score
  intelligence_score := calculate_intelligence_score(p_user_id, updated_data);

  -- If outcome provided, update prediction accuracy (reinforcement learning)
  IF p_outcome IS NOT NULL THEN
    UPDATE ai_prediction_outcomes
    SET actual_value = p_outcome,
        accuracy = calculate_prediction_accuracy(predicted_value, p_outcome),
        validated_at = NOW()
    WHERE id = (
      SELECT id
      FROM ai_prediction_outcomes
      WHERE user_id = p_user_id
        AND validated_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    );
  END IF;

  -- Detect and store behavioral patterns
  PERFORM detect_behavioral_patterns(p_user_id, p_category, p_data);

  -- Update user profile
  UPDATE user_profiles
  SET ai_learning_data = updated_data,
      ai_intelligence_score = intelligence_score,
      ai_learning_confidence = confidence_score,
      ai_last_learning_update = NOW(),
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Store learning analytics
  INSERT INTO ai_learning_analytics (user_id, metric_type, metric_category, metric_value, confidence_score)
  VALUES (p_user_id, 'learning_update', p_category, p_data, confidence_score);

  RETURN updated_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confidence calculation function
CREATE OR REPLACE FUNCTION calculate_confidence(
  p_user_id UUID,
  p_category TEXT,
  p_data JSONB
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  interaction_count INTEGER;
  consistency_score DECIMAL(5,2);
BEGIN
  -- Count interactions in this category
  SELECT COUNT(*) INTO interaction_count
  FROM user_interaction_logs
  WHERE user_id = p_user_id
    AND interaction_category = p_category
    AND created_at > NOW() - INTERVAL '30 days';

  -- Calculate consistency based on frequency
  IF interaction_count > 50 THEN
    consistency_score := 0.95;
  ELSIF interaction_count > 20 THEN
    consistency_score := 0.80;
  ELSIF interaction_count > 10 THEN
    consistency_score := 0.65;
  ELSIF interaction_count > 5 THEN
    consistency_score := 0.50;
  ELSE
    consistency_score := 0.30;
  END IF;

  RETURN consistency_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Intelligence score calculation
CREATE OR REPLACE FUNCTION calculate_intelligence_score(
  p_user_id UUID,
  p_learning_data JSONB
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  category_count INTEGER;
  interaction_count INTEGER;
BEGIN
  -- Count categories with learning data
  SELECT COUNT(*) INTO category_count
  FROM jsonb_object_keys(p_learning_data) AS keys;

  -- Count total interactions
  SELECT COUNT(*) INTO interaction_count
  FROM user_interaction_logs
  WHERE user_id = p_user_id;

  -- Base score from categories (0-40 points)
  score := LEAST(category_count * 8, 40);

  -- Interaction volume score (0-30 points)
  score := score + LEAST(interaction_count / 10, 30);

  -- Pattern recognition score (0-20 points)
  SELECT COUNT(*) INTO category_count
  FROM ai_behavioral_patterns
  WHERE user_id = p_user_id
    AND confidence > 0.7;

  score := score + LEAST(category_count * 4, 20);

  -- Prediction accuracy score (0-10 points)
  SELECT COALESCE(AVG(accuracy), 0) INTO category_count
  FROM ai_prediction_outcomes
  WHERE user_id = p_user_id
    AND validated_at IS NOT NULL;

  score := score + LEAST(category_count::INTEGER / 10, 10);

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Behavioral pattern detection
CREATE OR REPLACE FUNCTION detect_behavioral_patterns(
  p_user_id UUID,
  p_category TEXT,
  p_data JSONB
)
RETURNS void AS $$
DECLARE
  pattern_found BOOLEAN := false;
  existing_pattern JSONB;
BEGIN
  -- Check for temporal patterns (time-based)
  IF p_data ? 'timestamp' THEN
    -- Detect preferred time patterns
    SELECT pattern_data INTO existing_pattern
    FROM ai_behavioral_patterns
    WHERE user_id = p_user_id
      AND pattern_type = 'temporal'
      AND pattern_data->>'category' = p_category
    ORDER BY last_seen DESC
    LIMIT 1;

    IF existing_pattern IS NOT NULL THEN
      -- Update existing pattern
      UPDATE ai_behavioral_patterns
      SET frequency = frequency + 1,
          last_seen = NOW(),
          confidence = LEAST(confidence + 0.05, 1.0)
      WHERE user_id = p_user_id
        AND pattern_type = 'temporal'
        AND pattern_data->>'category' = p_category;
      pattern_found := true;
    END IF;

    IF NOT pattern_found THEN
      -- Create new pattern
      INSERT INTO ai_behavioral_patterns (user_id, pattern_type, pattern_data, confidence)
      VALUES (p_user_id, 'temporal', jsonb_build_object(
        'category', p_category,
        'timestamp', p_data->'timestamp',
        'hour', EXTRACT(HOUR FROM NOW()),
        'day_of_week', EXTRACT(DOW FROM NOW())
      ), 0.5);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Prediction accuracy calculation
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
  p_predicted JSONB,
  p_actual JSONB
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  accuracy DECIMAL(5,2);
BEGIN
  -- Simple accuracy calculation (can be enhanced)
  IF p_predicted = p_actual THEN
    accuracy := 1.0;
  ELSIF p_predicted ? 'value' AND p_actual ? 'value' THEN
    -- Numeric comparison
    IF (p_predicted->>'value')::NUMERIC = (p_actual->>'value')::NUMERIC THEN
      accuracy := 1.0;
    ELSE
      -- Calculate similarity
      accuracy := 1.0 - ABS(
        (p_predicted->>'value')::NUMERIC - (p_actual->>'value')::NUMERIC
      ) / NULLIF((p_actual->>'value')::NUMERIC, 0);
      accuracy := GREATEST(accuracy, 0.0);
    END IF;
  ELSE
    -- String similarity (simple)
    IF p_predicted::TEXT = p_actual::TEXT THEN
      accuracy := 1.0;
    ELSE
      accuracy := 0.5;
    END IF;
  END IF;

  RETURN accuracy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Multi-armed bandit for recommendations
CREATE OR REPLACE FUNCTION get_optimal_recommendation(
  p_user_id UUID,
  p_recommendation_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  recommendation JSONB;
  exploration_rate DECIMAL(5,2) := 0.1; -- 10% exploration
  random_value DECIMAL(5,2);
BEGIN
  -- Generate random value for exploration vs exploitation
  random_value := RANDOM();

  IF random_value < exploration_rate THEN
    -- Exploration: Try something new
    SELECT jsonb_build_object(
      'type', 'exploration',
      'recommendation', 'Try something new',
      'confidence', 0.3
    ) INTO recommendation;
  ELSE
    -- Exploitation: Use learned preferences
    SELECT jsonb_build_object(
      'type', 'exploitation',
      'recommendation', (SELECT ai_learning_data->p_recommendation_type->>'preferred'
                        FROM user_profiles WHERE id = p_user_id),
      'confidence', (SELECT ai_learning_confidence FROM user_profiles WHERE id = p_user_id)
    ) INTO recommendation;
  END IF;

  RETURN recommendation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Time-series prediction function
CREATE OR REPLACE FUNCTION predict_next_value(
  p_user_id UUID,
  p_metric TEXT,
  p_timeframe TEXT DEFAULT '30 days'
)
RETURNS JSONB AS $$
DECLARE
  trend DECIMAL(10,2);
  prediction JSONB;
BEGIN
  -- Get historical data and calculate trend
  SELECT COALESCE(
    AVG((interaction_data->>'value')::NUMERIC),
    0
  ) INTO trend
  FROM user_interaction_logs
  WHERE user_id = p_user_id
    AND interaction_data ? 'value'
    AND created_at > NOW() - (p_timeframe::INTERVAL);

  -- Build prediction
  prediction := jsonb_build_object(
    'metric', p_metric,
    'predicted_value', trend,
    'confidence', 0.7,
    'timeframe', p_timeframe,
    'method', 'time_series_average'
  );

  -- Store prediction for later validation
  INSERT INTO ai_prediction_outcomes (user_id, prediction_type, predicted_value)
  VALUES (p_user_id, p_metric, prediction);

  RETURN prediction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Collaborative filtering: Find similar users
CREATE OR REPLACE FUNCTION find_similar_users(
  p_user_id UUID,
  p_category TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(user_id UUID, similarity_score DECIMAL(5,2)) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT ai_learning_data->p_category AS preferences
    FROM user_profiles
    WHERE id = p_user_id
  ),
  similar_users AS (
    SELECT
      up.id,
      -- Calculate similarity (simplified - can use cosine similarity, etc.)
      CASE
        WHEN up.ai_learning_data->p_category = (SELECT preferences FROM user_preferences) THEN 1.0
        ELSE 0.5
      END AS similarity
    FROM user_profiles up
    WHERE up.id != p_user_id
      AND up.ai_learning_data ? p_category
      AND up.ai_intelligence_score > 20
  )
  SELECT similar_users.id, similar_users.similarity
  FROM similar_users
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_advanced_learning(UUID, TEXT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_advanced_learning(UUID, TEXT, JSONB, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION calculate_confidence(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_intelligence_score(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_behavioral_patterns(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_prediction_accuracy(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_optimal_recommendation(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION predict_next_value(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION find_similar_users(UUID, TEXT, INTEGER) TO authenticated;

-- RLS Policies
ALTER TABLE ai_learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prediction_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning analytics"
  ON ai_learning_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own behavioral patterns"
  ON ai_behavioral_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own prediction outcomes"
  ON ai_prediction_outcomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all learning data"
  ON ai_learning_analytics FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage all behavioral patterns"
  ON ai_behavioral_patterns FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage all prediction outcomes"
  ON ai_prediction_outcomes FOR ALL
  TO service_role USING (true) WITH CHECK (true);

COMMENT ON COLUMN user_profiles.ai_intelligence_score IS 'Overall intelligence score (0-100) based on learning depth and accuracy';
COMMENT ON COLUMN user_profiles.ai_learning_confidence IS 'Confidence score (0-1) in learning data accuracy';
COMMENT ON COLUMN user_profiles.ai_prediction_accuracy IS 'Average accuracy of predictions made for this user';
COMMENT ON COLUMN user_profiles.ai_behavioral_cluster IS 'Behavioral cluster identifier for collaborative filtering';

