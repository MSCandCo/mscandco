-- Migration: Add Cookie Consent Tracking
-- Date: 2025-01-02
-- Purpose: GDPR compliance - track user cookie consent preferences

-- Create user_cookie_consent table
CREATE TABLE IF NOT EXISTS user_cookie_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  necessary BOOLEAN NOT NULL DEFAULT true, -- Always true
  analytics BOOLEAN NOT NULL DEFAULT false,
  functional BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_cookie_consent_user_id ON user_cookie_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cookie_consent_updated_at ON user_cookie_consent(updated_at);

-- Enable RLS
ALTER TABLE user_cookie_consent ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read and update their own consent
CREATE POLICY "Users can view their own cookie consent"
  ON user_cookie_consent
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cookie consent"
  ON user_cookie_consent
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cookie consent"
  ON user_cookie_consent
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all consents for compliance audits
CREATE POLICY "Admins can view all cookie consents"
  ON user_cookie_consent
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

-- Add comments for documentation
COMMENT ON TABLE user_cookie_consent IS 'Stores user cookie consent preferences for GDPR compliance';
COMMENT ON COLUMN user_cookie_consent.necessary IS 'Strictly necessary cookies - always true';
COMMENT ON COLUMN user_cookie_consent.analytics IS 'Analytics and performance cookies';
COMMENT ON COLUMN user_cookie_consent.functional IS 'Functional and personalization cookies';
COMMENT ON COLUMN user_cookie_consent.consent_date IS 'When the user gave consent';
COMMENT ON COLUMN user_cookie_consent.updated_at IS 'When consent was last modified';

-- Create a view for admin reporting
CREATE OR REPLACE VIEW cookie_consent_summary AS
SELECT
  COUNT(*) as total_users_with_consent,
  COUNT(*) FILTER (WHERE analytics = true) as analytics_accepted,
  COUNT(*) FILTER (WHERE analytics = false) as analytics_rejected,
  COUNT(*) FILTER (WHERE functional = true) as functional_accepted,
  COUNT(*) FILTER (WHERE functional = false) as functional_rejected,
  ROUND(
    COUNT(*) FILTER (WHERE analytics = true)::numeric / NULLIF(COUNT(*), 0) * 100,
    2
  ) as analytics_acceptance_rate,
  ROUND(
    COUNT(*) FILTER (WHERE functional = true)::numeric / NULLIF(COUNT(*), 0) * 100,
    2
  ) as functional_acceptance_rate
FROM user_cookie_consent;

-- Grant access to the view
GRANT SELECT ON cookie_consent_summary TO authenticated;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_cookie_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_cookie_consent_updated_at_trigger
  BEFORE UPDATE ON user_cookie_consent
  FOR EACH ROW
  EXECUTE FUNCTION update_user_cookie_consent_updated_at();

-- Insert default consent for existing users (necessary only)
INSERT INTO user_cookie_consent (user_id, necessary, analytics, functional, consent_date)
SELECT
  id,
  true,
  false,
  false,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_cookie_consent)
ON CONFLICT (user_id) DO NOTHING;
