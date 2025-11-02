-- Migration: Add Email Notification Preferences
-- Date: 2025-01-02
-- Purpose: CAN-SPAM compliance - allow users to manage email notification preferences

-- Create email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transactional emails (cannot be disabled - legally required)
  transactional_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Operational emails (service updates, security alerts)
  operational_enabled BOOLEAN NOT NULL DEFAULT true,
  operational_security_alerts BOOLEAN NOT NULL DEFAULT true,
  operational_service_updates BOOLEAN NOT NULL DEFAULT true,
  operational_billing_updates BOOLEAN NOT NULL DEFAULT true,

  -- Release notifications
  release_status_updates BOOLEAN NOT NULL DEFAULT true,
  release_distribution_complete BOOLEAN NOT NULL DEFAULT true,
  release_platform_issues BOOLEAN NOT NULL DEFAULT true,

  -- Revenue notifications
  revenue_monthly_reports BOOLEAN NOT NULL DEFAULT true,
  revenue_payment_processed BOOLEAN NOT NULL DEFAULT true,
  revenue_threshold_alerts BOOLEAN NOT NULL DEFAULT false,
  revenue_threshold_amount DECIMAL(10, 2),

  -- Marketing emails (promotional content, tips, new features)
  marketing_enabled BOOLEAN NOT NULL DEFAULT false,
  marketing_product_updates BOOLEAN NOT NULL DEFAULT false,
  marketing_tips_and_tricks BOOLEAN NOT NULL DEFAULT false,
  marketing_promotional_offers BOOLEAN NOT NULL DEFAULT false,

  -- Platform notifications
  platform_new_features BOOLEAN NOT NULL DEFAULT true,
  platform_maintenance_notices BOOLEAN NOT NULL DEFAULT true,
  platform_policy_changes BOOLEAN NOT NULL DEFAULT true,

  -- Digest preferences
  digest_enabled BOOLEAN NOT NULL DEFAULT false,
  digest_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly')),

  -- Communication channels
  email_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_marketing_enabled ON email_preferences(marketing_enabled);
CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribed_at ON email_preferences(unsubscribed_at);

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view and manage their own preferences
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences"
  ON email_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences"
  ON email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all preferences for support purposes
CREATE POLICY "Admins can view all email preferences"
  ON email_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

-- Add comments for documentation
COMMENT ON TABLE email_preferences IS 'Stores user email notification preferences for CAN-SPAM compliance';
COMMENT ON COLUMN email_preferences.transactional_enabled IS 'Order confirmations, receipts, password resets - cannot be disabled';
COMMENT ON COLUMN email_preferences.operational_enabled IS 'Service updates, security alerts, billing - important system notifications';
COMMENT ON COLUMN email_preferences.marketing_enabled IS 'Promotional content, tips, new features - fully opt-in';
COMMENT ON COLUMN email_preferences.unsubscribed_at IS 'Timestamp when user unsubscribed from all non-essential emails';

-- Create email_preferences_history table for audit trail
CREATE TABLE IF NOT EXISTS email_preferences_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_field VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  change_reason VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_email_preferences_history_user_id ON email_preferences_history(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_history_changed_at ON email_preferences_history(changed_at);

-- Enable RLS on history table
ALTER TABLE email_preferences_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preference history"
  ON email_preferences_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preference history"
  ON email_preferences_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

-- Create trigger to log preference changes
CREATE OR REPLACE FUNCTION log_email_preference_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log changes for important fields
  IF OLD.marketing_enabled IS DISTINCT FROM NEW.marketing_enabled THEN
    INSERT INTO email_preferences_history (user_id, preference_field, old_value, new_value, changed_by)
    VALUES (NEW.user_id, 'marketing_enabled', OLD.marketing_enabled::text, NEW.marketing_enabled::text, auth.uid());
  END IF;

  IF OLD.operational_enabled IS DISTINCT FROM NEW.operational_enabled THEN
    INSERT INTO email_preferences_history (user_id, preference_field, old_value, new_value, changed_by)
    VALUES (NEW.user_id, 'operational_enabled', OLD.operational_enabled::text, NEW.operational_enabled::text, auth.uid());
  END IF;

  IF OLD.email_enabled IS DISTINCT FROM NEW.email_enabled THEN
    INSERT INTO email_preferences_history (user_id, preference_field, old_value, new_value, changed_by)
    VALUES (NEW.user_id, 'email_enabled', OLD.email_enabled::text, NEW.email_enabled::text, auth.uid());
  END IF;

  -- Update last_modified_at
  NEW.last_modified_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_preferences_change_trigger
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION log_email_preference_changes();

-- Create a view for marketing opt-in statistics
CREATE OR REPLACE VIEW email_marketing_stats AS
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE marketing_enabled = true) as marketing_opted_in,
  COUNT(*) FILTER (WHERE marketing_enabled = false) as marketing_opted_out,
  COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) as fully_unsubscribed,
  ROUND(
    COUNT(*) FILTER (WHERE marketing_enabled = true)::numeric / NULLIF(COUNT(*), 0) * 100,
    2
  ) as marketing_opt_in_rate
FROM email_preferences;

GRANT SELECT ON email_marketing_stats TO authenticated;

-- Insert default preferences for existing users
INSERT INTO email_preferences (
  user_id,
  transactional_enabled,
  operational_enabled,
  marketing_enabled,
  created_at
)
SELECT
  id,
  true,
  true,
  false, -- Marketing is opt-in by default
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM email_preferences)
ON CONFLICT (user_id) DO NOTHING;
