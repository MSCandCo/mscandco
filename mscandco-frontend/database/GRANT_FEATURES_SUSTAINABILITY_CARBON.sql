-- =====================================================
-- SUSTAINABILITY & CARBON TRACKING SYSTEM
-- Grant Feature #2: Carbon footprint tracking for streaming
-- =====================================================

-- Carbon footprint calculations for releases
CREATE TABLE IF NOT EXISTS public.carbon_footprint_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Calculation period
    calculation_period_start DATE NOT NULL,
    calculation_period_end DATE NOT NULL,

    -- Streaming data
    total_streams_count BIGINT DEFAULT 0,
    streaming_hours_total DECIMAL(15,2) DEFAULT 0,

    -- Carbon calculations (in kg CO2e)
    streaming_carbon_kg DECIMAL(15,6) DEFAULT 0, -- Carbon from streaming delivery
    storage_carbon_kg DECIMAL(15,6) DEFAULT 0, -- Carbon from data center storage
    distribution_carbon_kg DECIMAL(15,6) DEFAULT 0, -- Carbon from distribution network
    total_carbon_kg DECIMAL(15,6) DEFAULT 0, -- Total carbon footprint

    -- Per-stream metrics
    carbon_per_stream_g DECIMAL(10,6), -- Grams CO2e per stream
    carbon_per_hour_kg DECIMAL(10,6), -- Kg CO2e per streaming hour

    -- Breakdown by platform
    platform_breakdown JSONB DEFAULT '{}'::jsonb, -- {spotify: {streams, carbon_kg}, apple_music: {...}}

    -- Breakdown by region
    region_breakdown JSONB DEFAULT '{}'::jsonb, -- {north_america: {streams, carbon_kg}, europe: {...}}

    -- Offset information
    carbon_offset_kg DECIMAL(15,6) DEFAULT 0,
    offset_status TEXT CHECK (offset_status IN ('none', 'partial', 'full', 'carbon_negative')),
    offset_provider TEXT, -- 'greenspark', 'ecologi', 'goldstandard', etc.
    offset_certificate_url TEXT,
    offset_cost_amount DECIMAL(10,2),
    offset_cost_currency TEXT DEFAULT 'GBP',

    -- Methodology
    calculation_methodology TEXT DEFAULT 'DIMPACT 2024', -- Industry standard methodology
    carbon_intensity_factor DECIMAL(10,6), -- kWh per stream
    grid_carbon_factor DECIMAL(10,6), -- kg CO2e per kWh

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artist/Label sustainability profiles
CREATE TABLE IF NOT EXISTS public.sustainability_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Commitment level
    sustainability_commitment TEXT CHECK (sustainability_commitment IN ('none', 'monitoring', 'offsetting', 'carbon_neutral', 'carbon_negative')),
    commitment_start_date DATE,

    -- Total impact (lifetime)
    total_carbon_kg DECIMAL(15,6) DEFAULT 0,
    total_offset_kg DECIMAL(15,6) DEFAULT 0,
    net_carbon_kg DECIMAL(15,6) DEFAULT 0, -- total - offset

    -- Offset preferences
    auto_offset_enabled BOOLEAN DEFAULT false,
    offset_provider TEXT,
    offset_budget_monthly DECIMAL(10,2),

    -- Goals
    carbon_reduction_goal_percentage DECIMAL(5,2), -- Target reduction percentage
    carbon_neutral_target_date DATE,

    -- Certifications
    certifications JSONB DEFAULT '[]'::jsonb, -- Array of {type, issuer, date, certificate_url}

    -- Public visibility
    display_carbon_badge BOOLEAN DEFAULT false,
    share_sustainability_data BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon offset transactions
CREATE TABLE IF NOT EXISTS public.carbon_offset_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    carbon_tracking_id UUID REFERENCES public.carbon_footprint_tracking(id) ON DELETE SET NULL,

    -- Transaction details
    offset_provider TEXT NOT NULL,
    offset_amount_kg DECIMAL(15,6) NOT NULL,
    offset_cost_amount DECIMAL(10,2) NOT NULL,
    offset_cost_currency TEXT DEFAULT 'GBP',

    -- Project details
    offset_project_name TEXT,
    offset_project_type TEXT, -- 'reforestation', 'renewable_energy', 'direct_air_capture', etc.
    offset_project_location TEXT,
    offset_project_url TEXT,

    -- Verification
    certificate_number TEXT,
    certificate_url TEXT,
    verification_standard TEXT, -- 'Gold Standard', 'VCS', 'CDM', etc.

    transaction_status TEXT NOT NULL CHECK (transaction_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sustainability achievements and badges
CREATE TABLE IF NOT EXISTS public.sustainability_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    achievement_type TEXT NOT NULL, -- 'first_offset', 'carbon_neutral_month', '100k_offset', etc.
    achievement_title TEXT NOT NULL,
    achievement_description TEXT,
    achievement_icon_url TEXT,

    -- Metrics that triggered achievement
    milestone_value DECIMAL(15,2),
    milestone_unit TEXT, -- 'kg_co2', 'percentage', 'months', etc.

    earned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, achievement_type)
);

-- Industry-wide sustainability metrics (aggregated, anonymized)
CREATE TABLE IF NOT EXISTS public.sustainability_industry_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Aggregated metrics
    total_participating_artists INTEGER,
    total_releases_tracked INTEGER,
    total_carbon_tracked_kg DECIMAL(20,6),
    total_carbon_offset_kg DECIMAL(20,6),
    average_carbon_per_release DECIMAL(15,6),
    median_carbon_per_release DECIMAL(15,6),

    -- Platform averages
    platform_averages JSONB, -- {spotify: {carbon_per_stream_g}, ...}

    -- Top initiatives
    top_offset_providers JSONB, -- [{provider, offset_kg, artist_count}]

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(period_start, period_end)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_release ON public.carbon_footprint_tracking(release_id);
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_user ON public.carbon_footprint_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_period ON public.carbon_footprint_tracking(calculation_period_start, calculation_period_end);
CREATE INDEX IF NOT EXISTS idx_sustainability_profiles_user ON public.sustainability_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_transactions_user ON public.carbon_offset_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_transactions_status ON public.carbon_offset_transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_sustainability_achievements_user ON public.sustainability_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_industry_metrics_period ON public.sustainability_industry_metrics(period_start, period_end);

-- Enable RLS
ALTER TABLE public.carbon_footprint_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_offset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_industry_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carbon_footprint_tracking
CREATE POLICY "Users can view their own carbon tracking"
    ON public.carbon_footprint_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking data"
    ON public.carbon_footprint_tracking FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all carbon tracking"
    ON public.carbon_footprint_tracking FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for sustainability_profiles
CREATE POLICY "Users can view their own sustainability profile"
    ON public.sustainability_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sustainability profile"
    ON public.sustainability_profiles FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable if shared"
    ON public.sustainability_profiles FOR SELECT
    USING (share_sustainability_data = true);

-- RLS Policies for carbon_offset_transactions
CREATE POLICY "Users can view their own offset transactions"
    ON public.carbon_offset_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create offset transactions"
    ON public.carbon_offset_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sustainability_achievements
CREATE POLICY "Users can view their own achievements"
    ON public.sustainability_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view achievements if profile is public"
    ON public.sustainability_achievements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sustainability_profiles
            WHERE sustainability_profiles.user_id = sustainability_achievements.user_id
            AND share_sustainability_data = true
        )
    );

-- RLS Policies for industry metrics (public data)
CREATE POLICY "Anyone can view industry sustainability metrics"
    ON public.sustainability_industry_metrics FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify industry metrics"
    ON public.sustainability_industry_metrics FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- Function to calculate carbon footprint for a release
CREATE OR REPLACE FUNCTION calculate_carbon_footprint(
    p_release_id UUID,
    p_period_start DATE,
    p_period_end DATE
)
RETURNS JSONB AS $$
DECLARE
    v_total_streams BIGINT;
    v_streaming_hours DECIMAL(15,2);
    v_carbon_kg DECIMAL(15,6);
    v_result JSONB;
BEGIN
    -- Get total streams for the period (mock calculation - integrate with real analytics)
    -- In production, this would query your analytics tables
    v_total_streams := 0; -- Replace with actual query

    -- Industry standard: ~0.055 kWh per stream (DIMPACT 2024)
    -- Grid carbon intensity: ~0.233 kg CO2e per kWh (UK average)
    v_carbon_kg := v_total_streams * 0.055 * 0.233 / 1000;

    v_result := jsonb_build_object(
        'total_streams', v_total_streams,
        'carbon_kg', v_carbon_kg,
        'carbon_per_stream_g', CASE WHEN v_total_streams > 0 THEN (v_carbon_kg * 1000 / v_total_streams) ELSE 0 END
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-update sustainability profile
CREATE OR REPLACE FUNCTION update_sustainability_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.sustainability_profiles (user_id, total_carbon_kg)
    VALUES (NEW.user_id, NEW.total_carbon_kg)
    ON CONFLICT (user_id) DO UPDATE
    SET
        total_carbon_kg = sustainability_profiles.total_carbon_kg + NEW.total_carbon_kg,
        net_carbon_kg = sustainability_profiles.total_carbon_kg - sustainability_profiles.total_offset_kg,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_profile_on_carbon_tracking
AFTER INSERT ON public.carbon_footprint_tracking
FOR EACH ROW EXECUTE FUNCTION update_sustainability_profile();

-- Function to update offset totals
CREATE OR REPLACE FUNCTION update_offset_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_status = 'completed' THEN
        UPDATE public.sustainability_profiles
        SET
            total_offset_kg = total_offset_kg + NEW.offset_amount_kg,
            net_carbon_kg = total_carbon_kg - (total_offset_kg + NEW.offset_amount_kg),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_offset_on_transaction
AFTER INSERT OR UPDATE ON public.carbon_offset_transactions
FOR EACH ROW EXECUTE FUNCTION update_offset_totals();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.carbon_footprint_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sustainability_profiles TO authenticated;
GRANT SELECT, INSERT ON public.carbon_offset_transactions TO authenticated;
GRANT SELECT ON public.sustainability_achievements TO authenticated;
GRANT SELECT ON public.sustainability_industry_metrics TO authenticated;

GRANT ALL ON public.carbon_footprint_tracking TO service_role;
GRANT ALL ON public.sustainability_profiles TO service_role;
GRANT ALL ON public.carbon_offset_transactions TO service_role;
GRANT ALL ON public.sustainability_achievements TO service_role;
GRANT ALL ON public.sustainability_industry_metrics TO service_role;
