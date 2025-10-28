/**
 * Apollo Intelligence - Onboarding System
 * Tracks user onboarding progress and profile completion
 */

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Onboarding stages
  stage TEXT NOT NULL DEFAULT 'welcome' CHECK (stage IN (
    'welcome',           -- Initial greeting
    'personal_info',     -- First name, last name
    'artist_info',       -- Artist name, genre
    'contact_info',      -- Phone, location
    'identity_info',     -- Date of birth
    'music_goals',       -- What they want to achieve
    'payment_setup',     -- Payment details
    'completed'          -- Onboarding finished
  )),
  
  -- Completion tracking
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Required fields tracking
  has_first_name BOOLEAN DEFAULT FALSE,
  has_last_name BOOLEAN DEFAULT FALSE,
  has_artist_name BOOLEAN DEFAULT FALSE,
  has_genre BOOLEAN DEFAULT FALSE,
  has_phone BOOLEAN DEFAULT FALSE,
  has_location BOOLEAN DEFAULT FALSE,
  has_dob BOOLEAN DEFAULT FALSE,
  has_bio BOOLEAN DEFAULT FALSE,
  has_payment_info BOOLEAN DEFAULT FALSE,
  
  -- Profile completion percentage
  completion_percentage INTEGER DEFAULT 0,
  
  -- Conversation history (for context)
  conversation_data JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_stage ON onboarding_progress(stage);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON onboarding_progress(is_completed);

-- Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own onboarding progress
CREATE POLICY "Users can view own onboarding"
  ON onboarding_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own onboarding progress
CREATE POLICY "Users can update own onboarding"
  ON onboarding_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert onboarding records
CREATE POLICY "Service role can insert onboarding"
  ON onboarding_progress
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can select all onboarding records
CREATE POLICY "Service role can select all onboarding"
  ON onboarding_progress
  FOR SELECT
  TO service_role
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_interaction_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_updated_at();

-- Function to calculate completion percentage
CREATE OR REPLACE FUNCTION calculate_onboarding_completion(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 8;
  completed_fields INTEGER := 0;
BEGIN
  SELECT 
    (CASE WHEN has_first_name THEN 1 ELSE 0 END) +
    (CASE WHEN has_last_name THEN 1 ELSE 0 END) +
    (CASE WHEN has_artist_name THEN 1 ELSE 0 END) +
    (CASE WHEN has_genre THEN 1 ELSE 0 END) +
    (CASE WHEN has_phone THEN 1 ELSE 0 END) +
    (CASE WHEN has_location THEN 1 ELSE 0 END) +
    (CASE WHEN has_dob THEN 1 ELSE 0 END) +
    (CASE WHEN has_bio THEN 1 ELSE 0 END)
  INTO completed_fields
  FROM onboarding_progress
  WHERE user_id = user_uuid;
  
  RETURN (completed_fields * 100 / total_fields);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update completion percentage
CREATE OR REPLACE FUNCTION update_completion_percentage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completion_percentage := (
    (CASE WHEN NEW.has_first_name THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_last_name THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_artist_name THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_genre THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_phone THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_location THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_dob THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_bio THEN 1 ELSE 0 END)
  ) * 12.5; -- 8 fields, each worth 12.5%
  
  -- Mark as completed if all required fields are filled (87.5% = 7/8 fields)
  IF NEW.completion_percentage >= 87 THEN
    NEW.is_completed := TRUE;
    NEW.completed_at := NOW();
    NEW.stage := 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_completion_percentage_trigger
  BEFORE INSERT OR UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_completion_percentage();

-- Add comment
COMMENT ON TABLE onboarding_progress IS 'Tracks Apollo-guided onboarding progress for new users';

-- Create function to initialize onboarding for new users
CREATE OR REPLACE FUNCTION initialize_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO onboarding_progress (user_id, stage)
  VALUES (NEW.id, 'welcome')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create onboarding record when user signs up
CREATE TRIGGER initialize_user_onboarding
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_onboarding();

