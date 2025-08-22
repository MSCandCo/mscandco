-- COMPLETE MSC & CO PLATFORM DATABASE SCHEMA
-- Enterprise-grade music distribution platform with wallet, subscriptions, and workflow management

-- =============================================
-- 1. SUBSCRIPTION SYSTEM (Revolut Integration)
-- =============================================

-- Subscription plans enum
CREATE TYPE subscription_plan_enum AS ENUM ('artist_starter', 'artist_pro', 'label_admin', 'custom');

-- Subscription status enum  
CREATE TYPE subscription_status_enum AS ENUM ('active', 'inactive', 'cancelled', 'past_due', 'paused');

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    
    -- Subscription details
    plan subscription_plan_enum NOT NULL,
    status subscription_status_enum NOT NULL DEFAULT 'active',
    
    -- Revolut integration
    revolut_subscription_id TEXT UNIQUE,
    revolut_customer_id TEXT,
    
    -- Plan limits and features
    max_releases INTEGER DEFAULT 5, -- 5 for starter, unlimited (-1) for pro
    advanced_analytics BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    
    -- Billing
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
    
    -- Payment method
    pay_from_wallet BOOLEAN DEFAULT FALSE,
    auto_pay_enabled BOOLEAN DEFAULT TRUE,
    
    -- Dates
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
    cancelled_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. WALLET SYSTEM
-- =============================================

-- Transaction types enum
CREATE TYPE transaction_type_enum AS ENUM (
    'revenue_payout', 'subscription_payment', 'withdrawal', 'deposit', 
    'refund', 'adjustment', 'commission', 'platform_fee'
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type transaction_type_enum NOT NULL,
    amount DECIMAL(12,2) NOT NULL, -- Can be negative
    currency TEXT DEFAULT 'GBP',
    description TEXT NOT NULL,
    
    -- Balance tracking
    balance_before DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_after DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Source tracking
    source_type TEXT, -- 'release', 'subscription', 'manual', 'revolut'
    source_reference_id UUID,
    release_id UUID,
    asset_id UUID,
    
    -- Revenue period (for earnings)
    revenue_period_start DATE,
    revenue_period_end DATE,
    platform TEXT, -- 'spotify', 'apple_music', etc.
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    processed_by_user_id UUID REFERENCES auth.users(id),
    
    -- Revolut integration
    revolut_transaction_id TEXT,
    revolut_status TEXT,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update user_profiles to include wallet fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS negative_balance_allowed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_credit_limit DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS releases_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS storage_used_mb INTEGER DEFAULT 0;

-- =============================================
-- 3. RELEASE & ASSET MANAGEMENT SYSTEM  
-- =============================================

-- Release status enum (enhanced)
CREATE TYPE release_status_enum AS ENUM (
    'draft', 'submitted', 'in_review', 'approval', 'approved', 
    'completed', 'live', 'distributed', 'archived'
);

-- Asset types enum
CREATE TYPE asset_type_enum AS ENUM ('single', 'ep', 'album', 'compilation');

-- Releases table (main release container)
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ownership
    artist_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label_admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Release information
    release_title TEXT NOT NULL,
    asset_type asset_type_enum NOT NULL DEFAULT 'single',
    genre TEXT NOT NULL,
    subgenre TEXT,
    language TEXT DEFAULT 'English',
    
    -- Artwork and media
    artwork_url TEXT,
    artwork_file_size INTEGER,
    
    -- Release dates
    planned_release_date DATE,
    actual_release_date DATE,
    
    -- Status and workflow
    status release_status_enum NOT NULL DEFAULT 'draft',
    last_saved_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    
    -- Distribution
    distribution_partner_assigned BOOLEAN DEFAULT FALSE,
    distribution_notes TEXT,
    
    -- Metadata
    upc_code TEXT UNIQUE,
    catalog_number TEXT,
    copyright_info TEXT,
    
    -- Sync tracking
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table (individual tracks)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    
    -- Track information
    track_title TEXT NOT NULL,
    track_number INTEGER NOT NULL,
    duration_seconds INTEGER,
    
    -- Audio file
    audio_url TEXT NOT NULL,
    audio_file_size INTEGER,
    audio_format TEXT DEFAULT 'wav',
    
    -- Metadata
    isrc_code TEXT UNIQUE,
    explicit_content BOOLEAN DEFAULT FALSE,
    
    -- Contributors
    primary_artist TEXT NOT NULL,
    featured_artists TEXT[],
    producers TEXT[],
    songwriters TEXT[],
    
    -- Rights and splits
    publishing_splits JSONB DEFAULT '{}', -- {songwriter: percentage}
    master_splits JSONB DEFAULT '{}',     -- {artist: percentage}
    
    -- Analytics integration
    spotify_track_id TEXT,
    apple_music_track_id TEXT,
    youtube_music_track_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. ANALYTICS & EARNINGS SYSTEM
-- =============================================

-- Platform earnings table
CREATE TABLE IF NOT EXISTS platform_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Asset/Release reference
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Platform data
    platform TEXT NOT NULL, -- 'spotify', 'apple_music', etc.
    
    -- Metrics
    streams INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    revenue_gross DECIMAL(12,4) DEFAULT 0,
    revenue_net DECIMAL(12,4) DEFAULT 0,
    
    -- Period
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    
    -- Geographic data
    country_data JSONB DEFAULT '{}', -- {country: {streams, revenue}}
    
    -- Processing
    reported_by_user_id UUID REFERENCES auth.users(id), -- Distribution Partner
    approved_by_user_id UUID REFERENCES auth.users(id), -- Company Admin
    approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. REVENUE DISTRIBUTION SYSTEM
-- =============================================

-- Revenue splits configuration (per user)
CREATE TABLE IF NOT EXISTS user_revenue_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Split percentages (after distribution partner takes their cut)
    artist_percentage DECIMAL(5,2) DEFAULT 75.00,
    label_admin_percentage DECIMAL(5,2) DEFAULT 20.00,
    company_admin_percentage DECIMAL(5,2) DEFAULT 5.00,
    
    -- Special settings
    has_label_admin BOOLEAN DEFAULT FALSE,
    label_admin_user_id UUID REFERENCES auth.users(id),
    
    -- Audit
    created_by_user_id UUID REFERENCES auth.users(id),
    updated_by_user_id UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =============================================
-- 6. INDEXES AND PERFORMANCE
-- =============================================

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_revolut_id ON user_subscriptions(revolut_subscription_id);

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_source ON wallet_transactions(source_type, source_reference_id);

-- Release indexes
CREATE INDEX IF NOT EXISTS idx_releases_artist_user_id ON releases(artist_user_id);
CREATE INDEX IF NOT EXISTS idx_releases_label_admin_user_id ON releases(label_admin_user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(planned_release_date);

-- Asset indexes
CREATE INDEX IF NOT EXISTS idx_assets_release_id ON assets(release_id);
CREATE INDEX IF NOT EXISTS idx_assets_isrc ON assets(isrc_code);

-- Earnings indexes
CREATE INDEX IF NOT EXISTS idx_platform_earnings_asset_id ON platform_earnings(asset_id);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_user_id ON platform_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_platform ON platform_earnings(platform);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_period ON platform_earnings(reporting_period_start, reporting_period_end);

-- =============================================
-- 7. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_revenue_splits ENABLE ROW LEVEL SECURITY;

-- Subscription policies
CREATE POLICY "users_own_subscriptions" ON user_subscriptions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admins_all_subscriptions" ON user_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- Wallet policies
CREATE POLICY "users_own_wallet" ON wallet_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "admins_all_wallets" ON wallet_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin', 'distribution_partner')
        )
    );

-- Release policies
CREATE POLICY "artists_own_releases" ON releases
    FOR ALL USING (
        artist_user_id = auth.uid() OR 
        label_admin_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin', 'distribution_partner')
        )
    );

-- Asset policies
CREATE POLICY "release_assets_access" ON assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM releases r
            WHERE r.id = assets.release_id
            AND (
                r.artist_user_id = auth.uid() OR 
                r.label_admin_user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM user_role_assignments ura
                    WHERE ura.user_id = auth.uid()
                    AND ura.role_name IN ('company_admin', 'super_admin', 'distribution_partner')
                )
            )
        )
    );

-- Earnings policies
CREATE POLICY "earnings_access" ON platform_earnings
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM releases r
            WHERE r.id = platform_earnings.release_id
            AND r.label_admin_user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin', 'distribution_partner')
        )
    );

-- Revenue splits policies
CREATE POLICY "revenue_splits_access" ON user_revenue_splits
    FOR ALL USING (
        user_id = auth.uid() OR
        label_admin_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- =============================================
-- 8. TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update release count when releases are added/removed
CREATE OR REPLACE FUNCTION update_user_release_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_profiles 
        SET releases_count = releases_count + 1,
            updated_at = NOW()
        WHERE id = NEW.artist_user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_profiles 
        SET releases_count = GREATEST(0, releases_count - 1),
            updated_at = NOW()
        WHERE id = OLD.artist_user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for release count updates
DROP TRIGGER IF EXISTS update_release_count_trigger ON releases;
CREATE TRIGGER update_release_count_trigger
    AFTER INSERT OR DELETE ON releases
    FOR EACH ROW
    EXECUTE FUNCTION update_user_release_count();

-- Function to update wallet balance from transactions
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's wallet balance
    UPDATE user_profiles 
    SET wallet_balance = NEW.balance_after,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for wallet balance updates
DROP TRIGGER IF EXISTS update_wallet_balance_trigger ON wallet_transactions;
CREATE TRIGGER update_wallet_balance_trigger
    AFTER INSERT ON wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_balance();

-- Function to auto-save releases (called every few seconds)
CREATE OR REPLACE FUNCTION auto_save_release(
    p_release_id UUID,
    p_release_data JSONB
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Update the release with auto-save data
    UPDATE releases
    SET 
        release_title = COALESCE(p_release_data->>'release_title', release_title),
        genre = COALESCE(p_release_data->>'genre', genre),
        subgenre = COALESCE(p_release_data->>'subgenre', subgenre),
        planned_release_date = COALESCE((p_release_data->>'planned_release_date')::DATE, planned_release_date),
        last_saved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_release_id
    AND status IN ('draft', 'submitted'); -- Only auto-save in editable states
    
    IF FOUND THEN
        v_result = json_build_object('success', true, 'message', 'Release auto-saved');
    ELSE
        v_result = json_build_object('success', false, 'message', 'Release not found or not editable');
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to progress release status (Distribution Partner)
CREATE OR REPLACE FUNCTION progress_release_status(
    p_release_id UUID,
    p_new_status release_status_enum,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_current_status release_status_enum;
    v_user_role TEXT;
    v_result JSON;
BEGIN
    -- Get current status
    SELECT status INTO v_current_status
    FROM releases
    WHERE id = p_release_id;
    
    IF v_current_status IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Release not found');
    END IF;
    
    -- Get user role
    SELECT role_name INTO v_user_role
    FROM user_role_assignments
    WHERE user_id = auth.uid();
    
    -- Validate status progression permissions
    IF v_user_role = 'distribution_partner' THEN
        -- Distribution partner can progress: submitted → in_review → completed → live
        IF (v_current_status = 'submitted' AND p_new_status = 'in_review') OR
           (v_current_status = 'approved' AND p_new_status = 'completed') OR
           (v_current_status = 'completed' AND p_new_status = 'live') THEN
            -- Valid progression
        ELSE
            RETURN json_build_object('success', false, 'error', 'Invalid status progression for distribution partner');
        END IF;
    ELSIF v_user_role IN ('company_admin', 'super_admin') THEN
        -- Admins can change to any status
    ELSE
        RETURN json_build_object('success', false, 'error', 'Permission denied');
    END IF;
    
    -- Update the status
    UPDATE releases
    SET 
        status = p_new_status,
        distribution_notes = COALESCE(p_notes, distribution_notes),
        updated_at = NOW()
    WHERE id = p_release_id;
    
    RETURN json_build_object('success', true, 'message', 'Status updated successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. DEFAULT DATA AND SETUP
-- =============================================

-- Create default label admin for artists without labels
INSERT INTO user_revenue_splits (
    user_id,
    artist_percentage,
    label_admin_percentage,
    company_admin_percentage,
    has_label_admin,
    label_admin_user_id
) 
SELECT 
    u.id,
    75.00, -- Default artist gets 75%
    20.00, -- Default label admin gets 20%
    5.00,  -- Company admin gets 5%
    TRUE,
    (SELECT id FROM auth.users WHERE email = 'labeladmin@mscandco.com')
FROM auth.users u
WHERE u.email NOT IN (
    SELECT user_id FROM user_revenue_splits
) 
ON CONFLICT (user_id) DO NOTHING;

-- Insert subscription plans for existing users
INSERT INTO user_subscriptions (
    user_id,
    user_email,
    plan,
    amount,
    max_releases,
    advanced_analytics
)
SELECT 
    u.id,
    u.email,
    'artist_starter',
    29.99,
    5,
    FALSE
FROM auth.users u
JOIN user_role_assignments ura ON u.id = ura.user_id
WHERE ura.role_name = 'artist'
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON user_subscriptions TO postgres, service_role;
GRANT ALL ON wallet_transactions TO postgres, service_role;
GRANT ALL ON releases TO postgres, service_role;
GRANT ALL ON assets TO postgres, service_role;
GRANT ALL ON platform_earnings TO postgres, service_role;
GRANT ALL ON user_revenue_splits TO postgres, service_role;
