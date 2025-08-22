-- CORRECTED MSC & CO PLATFORM DATABASE SCHEMA
-- Fixed all column references and table dependencies

-- =============================================
-- 1. ENUMS (Create these first)
-- =============================================

-- Subscription plans enum
DO $$ BEGIN
    CREATE TYPE subscription_plan_enum AS ENUM ('artist_starter', 'artist_pro', 'label_admin', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscription status enum  
DO $$ BEGIN
    CREATE TYPE subscription_status_enum AS ENUM ('active', 'inactive', 'cancelled', 'past_due', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transaction types enum
DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM (
        'revenue_payout', 'subscription_payment', 'withdrawal', 'deposit', 
        'refund', 'adjustment', 'commission', 'platform_fee'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Release status enum (enhanced)
DO $$ BEGIN
    CREATE TYPE release_status_enum AS ENUM (
        'draft', 'submitted', 'in_review', 'approval', 'approved', 
        'completed', 'live', 'distributed', 'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Asset types enum
DO $$ BEGIN
    CREATE TYPE asset_type_enum AS ENUM ('single', 'ep', 'album', 'compilation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- 2. USER SUBSCRIPTIONS TABLE
-- =============================================

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
    max_releases INTEGER DEFAULT 5,
    advanced_analytics BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    
    -- Billing
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    billing_cycle TEXT DEFAULT 'monthly',
    
    -- Payment method
    pay_from_wallet BOOLEAN DEFAULT FALSE,
    auto_pay_enabled BOOLEAN DEFAULT TRUE,
    
    -- Dates
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. WALLET TRANSACTIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type transaction_type_enum NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    description TEXT NOT NULL,
    
    -- Balance tracking
    balance_before DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_after DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Source tracking
    source_type TEXT,
    source_reference_id UUID,
    release_id UUID,
    asset_id UUID,
    
    -- Revenue period
    revenue_period_start DATE,
    revenue_period_end DATE,
    platform TEXT,
    
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

-- =============================================
-- 4. UPDATE USER_PROFILES (Add wallet fields)
-- =============================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS negative_balance_allowed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_credit_limit DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS releases_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS storage_used_mb INTEGER DEFAULT 0;

-- =============================================
-- 5. RELEASES TABLE
-- =============================================

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
    metadata JSONB DEFAULT '{}',
    
    -- Sync tracking
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. ASSETS TABLE
-- =============================================

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
    publishing_splits JSONB DEFAULT '{}',
    master_splits JSONB DEFAULT '{}',
    
    -- Analytics integration
    spotify_track_id TEXT,
    apple_music_track_id TEXT,
    youtube_music_track_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. PLATFORM EARNINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS platform_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Platform data
    platform TEXT NOT NULL,
    
    -- Metrics
    streams INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    revenue_gross DECIMAL(12,4) DEFAULT 0,
    revenue_net DECIMAL(12,4) DEFAULT 0,
    
    -- Period
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    
    -- Geographic data
    country_data JSONB DEFAULT '{}',
    
    -- Processing
    reported_by_user_id UUID REFERENCES auth.users(id),
    approved_by_user_id UUID REFERENCES auth.users(id),
    approval_status TEXT DEFAULT 'pending',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. USER REVENUE SPLITS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS user_revenue_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Split percentages
    artist_percentage DECIMAL(5,2) DEFAULT 75.00,
    label_admin_percentage DECIMAL(5,2) DEFAULT 20.00,
    company_admin_percentage DECIMAL(5,2) DEFAULT 5.00,
    
    -- Settings
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
-- 9. INDEXES (Corrected)
-- =============================================

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_revolut_id ON user_subscriptions(revolut_subscription_id);

-- Wallet indexes (corrected)
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_source_type ON wallet_transactions(source_type);

-- Release indexes
CREATE INDEX IF NOT EXISTS idx_releases_artist_user_id ON releases(artist_user_id);
CREATE INDEX IF NOT EXISTS idx_releases_label_admin_user_id ON releases(label_admin_user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);

-- Asset indexes
CREATE INDEX IF NOT EXISTS idx_assets_release_id ON assets(release_id);
CREATE INDEX IF NOT EXISTS idx_assets_isrc ON assets(isrc_code);

-- Earnings indexes
CREATE INDEX IF NOT EXISTS idx_platform_earnings_asset_id ON platform_earnings(asset_id);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_user_id ON platform_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_platform ON platform_earnings(platform);

-- =============================================
-- 10. ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_revenue_splits ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 11. RLS POLICIES (Using correct column names)
-- =============================================

-- Subscription policies
DROP POLICY IF EXISTS "users_own_subscriptions" ON user_subscriptions;
CREATE POLICY "users_own_subscriptions" ON user_subscriptions
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_all_subscriptions" ON user_subscriptions;
CREATE POLICY "admins_all_subscriptions" ON user_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- Wallet policies
DROP POLICY IF EXISTS "users_own_wallet" ON wallet_transactions;
CREATE POLICY "users_own_wallet" ON wallet_transactions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_all_wallets" ON wallet_transactions;
CREATE POLICY "admins_all_wallets" ON wallet_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin', 'distribution_partner')
        )
    );

-- Grant permissions
GRANT ALL ON user_subscriptions TO postgres, service_role;
GRANT ALL ON wallet_transactions TO postgres, service_role;
GRANT ALL ON releases TO postgres, service_role;
GRANT ALL ON assets TO postgres, service_role;
GRANT ALL ON platform_earnings TO postgres, service_role;
GRANT ALL ON user_revenue_splits TO postgres, service_role;
