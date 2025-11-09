-- Add pricing tier fields and usage limits to user_profiles
-- Migration: Add comprehensive pricing tier system with Free tier limitations

-- Add new columns for tier management
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'mpp_paid', 'mpp_earned', 'mpp_invited', 'investment')),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 20.00 CHECK (commission_rate IN (20.00, 15.00, 10.00, 2.50)),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trial')),
ADD COLUMN IF NOT EXISTS subscription_period VARCHAR(10) DEFAULT 'annual' CHECK (subscription_period IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS revolut_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS revolut_customer_id VARCHAR(255);

-- Add usage tracking columns for Free tier limits
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS releases_this_year INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tracks_this_year INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings_this_year DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_streams_all_time BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_releases_all_time INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_commissions_paid DECIMAL(12,2) DEFAULT 0.00;

-- Add Apollo Intelligence usage tracking
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS apollo_queries_used_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS apollo_query_limit INT DEFAULT 3,
ADD COLUMN IF NOT EXISTS apollo_unlimited_addon BOOLEAN DEFAULT FALSE;

-- Add upgrade/qualification tracking
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS upgrade_prompted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mpp_qualification_status VARCHAR(50) DEFAULT 'not_qualified' CHECK (mpp_qualification_status IN ('not_qualified', 'qualified', 'invited', 'investment')),
ADD COLUMN IF NOT EXISTS mpp_qualified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_tier_change_at TIMESTAMP;

-- Add Investment Partner fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS investment_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS equity_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS investment_date DATE,
ADD COLUMN IF NOT EXISTS board_member BOOLEAN DEFAULT FALSE;

-- Create partner_applications table
CREATE TABLE IF NOT EXISTS partner_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_profiles(id) ON DELETE CASCADE,
    application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('earned', 'invited', 'investment')),
    application_status VARCHAR(20) DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
    qualification_reason TEXT,
    investment_amount DECIMAL(12,2),
    equity_percentage DECIMAL(5,2),
    notes TEXT,
    applied_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT REFERENCES user_profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_mpp_qualification ON user_profiles(mpp_qualification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_revolut_subscription ON user_profiles(revolut_subscription_id);
CREATE INDEX IF NOT EXISTS idx_partner_applications_user_id ON partner_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON partner_applications(application_status);

-- Create function to reset annual counters (run yearly on Jan 1)
CREATE OR REPLACE FUNCTION reset_annual_usage_counters()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        releases_this_year = 0,
        tracks_this_year = 0,
        total_earnings_this_year = 0.00,
        upgrade_prompted = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset monthly Apollo counters (run monthly on 1st)
CREATE OR REPLACE FUNCTION reset_monthly_apollo_counters()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET apollo_queries_used_this_month = 0;
END;
$$ LANGUAGE plpgsql;

-- Create function to check MPP auto-qualification
CREATE OR REPLACE FUNCTION check_mpp_qualification(p_user_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_total_earnings DECIMAL(12,2);
    v_total_streams BIGINT;
    v_total_releases INT;
    v_total_commissions DECIMAL(12,2);
    v_current_tier VARCHAR(50);
    v_qualified BOOLEAN := FALSE;
BEGIN
    -- Get current user data
    SELECT
        total_earnings_this_year,
        total_streams_all_time,
        total_releases_all_time,
        total_commissions_paid,
        tier
    INTO
        v_total_earnings,
        v_total_streams,
        v_total_releases,
        v_total_commissions,
        v_current_tier
    FROM user_profiles
    WHERE id = p_user_id;

    -- Check if user is already MPP or higher
    IF v_current_tier IN ('mpp_paid', 'mpp_earned', 'mpp_invited', 'investment') THEN
        RETURN FALSE; -- Already qualified
    END IF;

    -- Check qualification criteria
    IF v_total_earnings >= 10000.00
       OR v_total_streams >= 100000
       OR v_total_releases >= 50
       OR v_total_commissions >= 5000.00 THEN

        -- Qualify user for free MPP
        UPDATE user_profiles
        SET
            tier = 'mpp_earned',
            commission_rate = 10.00,
            mpp_qualification_status = 'qualified',
            mpp_qualified_at = NOW(),
            last_tier_change_at = NOW(),
            apollo_query_limit = 500
        WHERE id = p_user_id;

        v_qualified := TRUE;
    END IF;

    RETURN v_qualified;
END;
$$ LANGUAGE plpgsql;

-- Create function to update commission rate when tier changes
CREATE OR REPLACE FUNCTION update_commission_rate_on_tier_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically set commission rate based on tier
    NEW.commission_rate := CASE NEW.tier
        WHEN 'free' THEN 20.00
        WHEN 'pro' THEN 15.00
        WHEN 'mpp_paid' THEN 10.00
        WHEN 'mpp_earned' THEN 10.00
        WHEN 'mpp_invited' THEN 10.00
        WHEN 'investment' THEN 2.50
        ELSE 20.00
    END;

    -- Set Apollo query limits based on tier
    NEW.apollo_query_limit := CASE NEW.tier
        WHEN 'free' THEN 3
        WHEN 'pro' THEN 100
        WHEN 'mpp_paid' THEN 500
        WHEN 'mpp_earned' THEN 500
        WHEN 'mpp_invited' THEN 500
        WHEN 'investment' THEN NULL -- Unlimited
        ELSE 3
    END;

    -- Update last tier change timestamp
    IF OLD.tier IS DISTINCT FROM NEW.tier THEN
        NEW.last_tier_change_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic commission rate updates
DROP TRIGGER IF EXISTS trigger_update_commission_rate ON user_profiles;
CREATE TRIGGER trigger_update_commission_rate
    BEFORE UPDATE OF tier ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_commission_rate_on_tier_change();

-- Add RLS policies for partner_applications
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
    ON partner_applications FOR SELECT
    USING (auth.uid() = (SELECT auth_id FROM user_profiles WHERE id = user_id));

-- Users can create their own applications
CREATE POLICY "Users can create applications"
    ON partner_applications FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_id FROM user_profiles WHERE id = user_id));

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
    ON partner_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            INNER JOIN user_roles ur ON up.id = ur.user_id
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE up.auth_id = auth.uid()
            AND r.name IN ('SuperAdmin', 'Admin')
        )
    );

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
    ON partner_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            INNER JOIN user_roles ur ON up.id = ur.user_id
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE up.auth_id = auth.uid()
            AND r.name IN ('SuperAdmin', 'Admin')
        )
    );

-- Add comment for documentation
COMMENT ON TABLE partner_applications IS 'Stores MSC Partners Program (MPP) applications for earned, invited, and investment partnership tiers';
COMMENT ON COLUMN user_profiles.tier IS 'User subscription tier: free (20%), pro (15%), mpp_paid (10%), mpp_earned (10% free), mpp_invited (10% free), investment (2.5%)';
COMMENT ON COLUMN user_profiles.commission_rate IS 'Commission percentage: 20.00, 15.00, 10.00, or 2.50';
COMMENT ON COLUMN user_profiles.releases_this_year IS 'Free tier limit: Maximum 3 releases per year';
COMMENT ON COLUMN user_profiles.tracks_this_year IS 'Free tier limit: Maximum 15 tracks per year';
COMMENT ON COLUMN user_profiles.apollo_queries_used_this_month IS 'Apollo Intelligence usage tracking for tier limits';
