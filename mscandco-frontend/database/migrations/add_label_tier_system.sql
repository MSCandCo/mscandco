-- ================================
-- LABEL TIER SYSTEM MIGRATION
-- Adds 4-tier pricing for label admins
-- ================================

-- Add label tier tracking columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_tier TEXT DEFAULT 'label_starter' CHECK (label_tier IN ('label_starter', 'label_pro', 'label_partner', 'label_enterprise'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_artist_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_releases_this_year INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_tracks_this_year INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_apollo_queries_this_month INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_total_earnings DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_total_streams BIGINT DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_total_releases INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_commissions_paid DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_qualified_for_partner BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_partner_qualified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_subscription_cancelled_at TIMESTAMP WITH TIME ZONE;

-- Update subscription_tier constraint to include label tiers
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check
CHECK (subscription_tier IN (
  -- Artist tiers
  'free', 'pro', 'mpp_partner', 'investment',
  -- Label tiers
  'label_starter', 'label_pro', 'label_partner', 'label_enterprise'
) OR subscription_tier IS NULL);

-- Create index for label tier queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_label_tier ON user_profiles(label_tier) WHERE role = 'label_admin';
CREATE INDEX IF NOT EXISTS idx_user_profiles_label_qualified ON user_profiles(label_qualified_for_partner) WHERE role = 'label_admin';

-- Set default label tier for existing label admins
UPDATE user_profiles
SET label_tier = 'label_starter',
    subscription_tier = 'label_starter'
WHERE role = 'label_admin'
AND label_tier IS NULL;

-- ================================
-- LABEL TIER LIMITS CONFIGURATION
-- ================================

COMMENT ON COLUMN user_profiles.label_tier IS 'Label pricing tier: label_starter (FREE, 5 artists, 25% commission), label_pro (£99/mo, 25 artists, 18% commission), label_partner (£499/mo or FREE if auto-qualified, 100 artists, 12% commission), label_enterprise (£50K-£250K investment, unlimited, 5% commission)';
COMMENT ON COLUMN user_profiles.label_artist_count IS 'Current number of artists under this label (enforced limits: starter=5, pro=25, partner=100, enterprise=unlimited)';
COMMENT ON COLUMN user_profiles.label_releases_this_year IS 'Total releases across all label artists this year (enforced limits: starter=10/year)';
COMMENT ON COLUMN user_profiles.label_tracks_this_year IS 'Total tracks across all label artists this year (enforced limits: starter=30/year)';
COMMENT ON COLUMN user_profiles.label_apollo_queries_this_month IS 'Apollo AI queries used this month (enforced limits: starter=10, pro=200, partner=1000, enterprise=unlimited)';
COMMENT ON COLUMN user_profiles.label_qualified_for_partner IS 'Whether label auto-qualifies for FREE Partner tier based on performance metrics';

-- ================================
-- AUTO-QUALIFICATION TRIGGER
-- ================================

CREATE OR REPLACE FUNCTION check_label_partner_qualification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for label_admin role
  IF NEW.role = 'label_admin' THEN
    -- Check if label meets ANY of these criteria for FREE Partner:
    -- 1. £50,000+ annual earnings
    -- 2. 500,000+ total streams
    -- 3. 25+ artists under label
    -- 4. £10,000+ commissions paid

    IF (NEW.label_total_earnings >= 50000 OR
        NEW.label_total_streams >= 500000 OR
        NEW.label_artist_count >= 25 OR
        NEW.label_commissions_paid >= 10000) THEN

      -- Mark as qualified
      NEW.label_qualified_for_partner := TRUE;

      -- Set qualification timestamp if not already set
      IF NEW.label_partner_qualified_at IS NULL THEN
        NEW.label_partner_qualified_at := NOW();
      END IF;

      -- Auto-upgrade to Partner tier if on lower tier
      IF NEW.label_tier IN ('label_starter', 'label_pro') THEN
        NEW.label_tier := 'label_partner';
        NEW.subscription_tier := 'label_partner';

        -- Cancel paid subscription (they get Partner for FREE)
        IF NEW.subscription_status = 'active' AND NEW.label_tier = 'label_pro' THEN
          NEW.label_subscription_cancelled_at := NOW();
          -- Note: Actual subscription cancellation should be handled by payment processor
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_check_label_partner_qualification ON user_profiles;

-- Create trigger for auto-qualification
CREATE TRIGGER trg_check_label_partner_qualification
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_label_partner_qualification();

-- ================================
-- LABEL COMMISSION RATES
-- ================================

-- Create or update commission_rates table to include label tiers
CREATE TABLE IF NOT EXISTS commission_rates (
  tier TEXT PRIMARY KEY,
  commission_rate DECIMAL(5,4) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert/update label tier commission rates
INSERT INTO commission_rates (tier, commission_rate, description) VALUES
  ('label_starter', 0.2500, 'Label Starter: FREE tier, 25% commission, 5 artists max'),
  ('label_pro', 0.1800, 'Label Pro: £99/month, 18% commission, 25 artists max'),
  ('label_partner', 0.1200, 'Label Partner: £499/month or FREE if qualified, 12% commission, 100 artists max'),
  ('label_enterprise', 0.0500, 'Label Enterprise: £50K-£250K investment, 5% commission, unlimited artists')
ON CONFLICT (tier) DO UPDATE SET
  commission_rate = EXCLUDED.commission_rate,
  description = EXCLUDED.description;

-- ================================
-- LABEL USAGE COUNTER RESET FUNCTIONS
-- ================================

-- Function to reset annual label counters (releases and tracks)
CREATE OR REPLACE FUNCTION reset_label_annual_counters()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET
    label_releases_this_year = 0,
    label_tracks_this_year = 0
  WHERE role = 'label_admin';

  RAISE NOTICE 'Reset annual label counters for % labels',
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'label_admin');
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly label counters (Apollo queries)
CREATE OR REPLACE FUNCTION reset_label_monthly_counters()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET label_apollo_queries_this_month = 0
  WHERE role = 'label_admin';

  RAISE NOTICE 'Reset monthly label Apollo query counters for % labels',
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'label_admin');
END;
$$ LANGUAGE plpgsql;

-- ================================
-- RLS POLICIES FOR LABEL TIERS
-- ================================

-- Label admins can view their own tier info
CREATE POLICY label_view_own_tier ON user_profiles
  FOR SELECT
  USING (auth.uid() = id AND role = 'label_admin');

-- Label admins can update their own usage counters (read-only fields enforced in app)
CREATE POLICY label_update_own_usage ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id AND role = 'label_admin')
  WITH CHECK (auth.uid() = id AND role = 'label_admin');

-- Company and Super Admins can view all label tier info
CREATE POLICY admin_view_label_tiers ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('company_admin', 'super_admin')
    )
  );

-- ================================
-- LABEL TIER AUDIT LOG
-- ================================

CREATE TABLE IF NOT EXISTS label_tier_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  old_tier TEXT,
  new_tier TEXT NOT NULL,
  reason TEXT NOT NULL, -- 'manual_upgrade', 'auto_qualification', 'subscription_cancelled', etc.
  triggered_by UUID REFERENCES user_profiles(id), -- NULL for automatic triggers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_label_tier_audit_log_label_id ON label_tier_audit_log(label_id);
CREATE INDEX IF NOT EXISTS idx_label_tier_audit_log_created_at ON label_tier_audit_log(created_at DESC);

-- Function to log tier changes
CREATE OR REPLACE FUNCTION log_label_tier_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.label_tier IS DISTINCT FROM NEW.label_tier THEN
    INSERT INTO label_tier_audit_log (label_id, old_tier, new_tier, reason)
    VALUES (
      NEW.id,
      OLD.label_tier,
      NEW.label_tier,
      CASE
        WHEN NEW.label_qualified_for_partner = TRUE AND OLD.label_qualified_for_partner = FALSE
          THEN 'auto_qualification'
        ELSE 'manual_change'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tier change logging
DROP TRIGGER IF EXISTS trg_log_label_tier_change ON user_profiles;
CREATE TRIGGER trg_log_label_tier_change
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (OLD.label_tier IS DISTINCT FROM NEW.label_tier)
  EXECUTE FUNCTION log_label_tier_change();

-- ================================
-- GRANT PERMISSIONS
-- ================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON label_tier_audit_log TO authenticated;
GRANT SELECT ON commission_rates TO authenticated;

COMMENT ON TABLE label_tier_audit_log IS 'Tracks all label tier changes for audit and analytics purposes';
COMMENT ON TABLE commission_rates IS 'Commission rates for each tier (both artist and label tiers)';
