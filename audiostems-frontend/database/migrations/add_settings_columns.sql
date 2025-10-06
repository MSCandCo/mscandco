-- ================================
-- ADD SETTINGS COLUMNS TO USER_PROFILES
-- ================================
-- This migration adds settings-related columns to the user_profiles table
-- for managing user preferences, notifications, security, and API access
-- Created: 2025-01-05

-- Add Platform Preferences columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(50) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) DEFAULT 'GBP',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'Europe/London',
ADD COLUMN IF NOT EXISTS date_format VARCHAR(50) DEFAULT 'DD/MM/YYYY';

-- Add Notification Settings column (JSONB for flexibility)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"emailNotifications": true, "pushNotifications": true, "frequency": "immediate"}'::jsonb;

-- Add Privacy & Security columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);

-- Add API Access columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS api_key VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS api_key_last_used TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS api_usage_stats JSONB DEFAULT '{"requestsThisMonth": 0, "rateLimit": 1000}'::jsonb;

-- Add email signature for Label Admins and Distribution Partners
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email_signature TEXT;

-- Add company visibility setting for Distribution Partners
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS company_visibility VARCHAR(20) DEFAULT 'public' CHECK (company_visibility IN ('public', 'private'));

-- Create index on api_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_api_key ON user_profiles(api_key);

-- Create index on theme_preference for analytics
CREATE INDEX IF NOT EXISTS idx_user_profiles_theme ON user_profiles(theme_preference);

-- Add comments to document the columns
COMMENT ON COLUMN user_profiles.theme_preference IS 'User interface theme preference (light/dark)';
COMMENT ON COLUMN user_profiles.language_preference IS 'User language preference (en, es, fr, de, etc.)';
COMMENT ON COLUMN user_profiles.default_currency IS 'Default currency for displaying prices and earnings';
COMMENT ON COLUMN user_profiles.timezone IS 'User timezone for date/time display';
COMMENT ON COLUMN user_profiles.date_format IS 'User preferred date format';
COMMENT ON COLUMN user_profiles.notification_settings IS 'JSON object containing notification preferences';
COMMENT ON COLUMN user_profiles.privacy_settings IS 'JSON object containing privacy preferences';
COMMENT ON COLUMN user_profiles.two_factor_enabled IS 'Whether two-factor authentication is enabled';
COMMENT ON COLUMN user_profiles.two_factor_secret IS 'Secret key for two-factor authentication';
COMMENT ON COLUMN user_profiles.api_key IS 'API key for programmatic access';
COMMENT ON COLUMN user_profiles.api_key_last_used IS 'Timestamp of last API key usage';
COMMENT ON COLUMN user_profiles.api_usage_stats IS 'JSON object containing API usage statistics';
COMMENT ON COLUMN user_profiles.email_signature IS 'Email signature for Label Admins and Distribution Partners';
COMMENT ON COLUMN user_profiles.company_visibility IS 'Company information visibility for Distribution Partners';

-- ================================
-- CREATE LOGIN HISTORY TABLE
-- ================================

CREATE TABLE IF NOT EXISTS login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address VARCHAR(45),
  location TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);

COMMENT ON TABLE login_history IS 'Records of user login attempts for security tracking';
COMMENT ON COLUMN login_history.device_info IS 'Device information from user agent';
COMMENT ON COLUMN login_history.ip_address IS 'IP address of login attempt';
COMMENT ON COLUMN login_history.location IS 'Geographical location based on IP';
COMMENT ON COLUMN login_history.user_agent IS 'Full user agent string';
COMMENT ON COLUMN login_history.success IS 'Whether the login attempt was successful';

-- ================================
-- ADD RLS POLICIES
-- ================================

-- Allow users to read their own login history
CREATE POLICY IF NOT EXISTS "Users can view their own login history"
ON login_history
FOR SELECT
USING (auth.uid() = user_id);

-- Allow system to insert login history (service role only)
CREATE POLICY IF NOT EXISTS "System can insert login history"
ON login_history
FOR INSERT
WITH CHECK (true);

-- Enable RLS on login_history table
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- ================================
-- GRANT PERMISSIONS
-- ================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON login_history TO authenticated;
GRANT INSERT ON login_history TO service_role;

-- ================================
-- MIGRATION COMPLETE
-- ================================

-- This migration adds comprehensive settings support including:
-- ✅ Platform preferences (theme, language, currency, timezone, date format)
-- ✅ Notification settings (email, push, preferences, frequency)
-- ✅ Privacy & security (2FA, login history)
-- ✅ API access (API keys, usage tracking)
-- ✅ Role-specific settings (email signature, company visibility)
-- ✅ Login history tracking table with RLS policies
