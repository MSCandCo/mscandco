-- =====================================================
-- OPEN DATA COMPONENT
-- Grant Feature #4: Anonymized industry insights and public API
-- =====================================================

-- Open data metrics (aggregated, anonymized)
CREATE TABLE IF NOT EXISTS public.open_data_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time period
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Geographic data
    region TEXT, -- 'global', 'north_america', 'europe', 'asia', etc.
    country_code TEXT, -- ISO 3166-1 alpha-2

    -- Release metrics
    total_releases INTEGER DEFAULT 0,
    new_releases INTEGER DEFAULT 0,
    total_tracks INTEGER DEFAULT 0,

    -- Artist metrics
    active_artists INTEGER DEFAULT 0,
    new_artists INTEGER DEFAULT 0,

    -- Streaming metrics (aggregated)
    total_streams BIGINT DEFAULT 0,
    total_streaming_hours DECIMAL(15,2) DEFAULT 0,
    average_streams_per_release DECIMAL(15,2),
    median_streams_per_release BIGINT,

    -- Revenue metrics (anonymized ranges)
    total_revenue_generated DECIMAL(15,2) DEFAULT 0,
    average_revenue_per_artist DECIMAL(10,2),
    median_revenue_per_artist DECIMAL(10,2),

    -- Genre breakdown
    genre_distribution JSONB DEFAULT '{}'::jsonb, -- {pop: 35%, rock: 20%, ...}
    top_genres TEXT[],

    -- Platform breakdown
    platform_distribution JSONB DEFAULT '{}'::jsonb, -- {spotify: 45%, apple_music: 30%, ...}

    -- Engagement metrics
    average_track_length_seconds INTEGER,
    completion_rate_percentage DECIMAL(5,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(period_type, period_start, period_end, region, country_code)
);

-- Streaming trends (time-series data)
CREATE TABLE IF NOT EXISTS public.streaming_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Date
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour < 24), -- NULL for daily aggregation

    -- Genre
    genre TEXT NOT NULL,

    -- Metrics
    stream_count BIGINT DEFAULT 0,
    unique_listeners INTEGER DEFAULT 0,

    -- Trends
    growth_percentage DECIMAL(10,2), -- % change from previous period
    trending_score DECIMAL(10,2), -- Algorithmic trending score

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(date, hour, genre)
);

-- Research datasets
CREATE TABLE IF NOT EXISTS public.research_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Dataset information
    dataset_name TEXT NOT NULL UNIQUE,
    dataset_description TEXT NOT NULL,
    dataset_version TEXT NOT NULL,

    -- Content
    dataset_type TEXT CHECK (dataset_type IN ('csv', 'json', 'parquet', 'sql')),
    dataset_url TEXT NOT NULL,
    dataset_size_bytes BIGINT,
    row_count INTEGER,

    -- Metadata
    columns JSONB, -- Schema information
    data_dictionary JSONB, -- Column descriptions
    temporal_coverage JSONB, -- {start: '2020-01-01', end: '2024-12-31'}
    geographic_coverage TEXT[],

    -- Citation
    citation_text TEXT,
    doi TEXT, -- Digital Object Identifier

    -- Licensing
    license TEXT NOT NULL DEFAULT 'CC BY 4.0',
    license_url TEXT,

    -- Usage
    download_count INTEGER DEFAULT 0,
    citation_count INTEGER DEFAULT 0,

    -- Access control
    access_level TEXT NOT NULL CHECK (access_level IN ('public', 'registered_users', 'researchers_only', 'private')),
    requires_approval BOOLEAN DEFAULT false,

    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dataset access requests
CREATE TABLE IF NOT EXISTS public.dataset_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES public.research_datasets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Requester information
    institution TEXT,
    research_purpose TEXT NOT NULL,
    intended_use TEXT NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- Access details
    access_granted_until DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public API usage tracking
CREATE TABLE IF NOT EXISTS public.api_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- API key/user
    api_key_hash TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Request details
    endpoint TEXT NOT NULL,
    http_method TEXT NOT NULL,
    request_params JSONB,

    -- Response
    response_status INTEGER,
    response_time_ms INTEGER,
    data_rows_returned INTEGER,

    -- Metadata
    ip_address INET,
    user_agent TEXT,

    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- API keys for open data access
CREATE TABLE IF NOT EXISTS public.open_data_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Key details
    api_key_hash TEXT NOT NULL UNIQUE,
    api_key_name TEXT NOT NULL,
    api_key_prefix TEXT NOT NULL, -- First 8 chars for identification

    -- Permissions
    access_level TEXT NOT NULL CHECK (access_level IN ('free', 'standard', 'premium', 'researcher')),
    rate_limit_per_hour INTEGER DEFAULT 100,
    allowed_endpoints TEXT[],

    -- Usage quotas
    monthly_request_quota INTEGER,
    requests_used_this_month INTEGER DEFAULT 0,
    quota_reset_date DATE,

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data quality metrics
CREATE TABLE IF NOT EXISTS public.data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Data source
    table_name TEXT NOT NULL,

    -- Quality scores (0-100)
    completeness_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    timeliness_score DECIMAL(5,2),
    overall_quality_score DECIMAL(5,2),

    -- Issue counts
    missing_values_count INTEGER,
    duplicate_records_count INTEGER,
    anomalies_detected INTEGER,

    -- Metadata
    total_records INTEGER,
    last_updated_at TIMESTAMPTZ,

    measured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industry reports
CREATE TABLE IF NOT EXISTS public.industry_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Report details
    report_title TEXT NOT NULL,
    report_description TEXT,
    report_type TEXT CHECK (report_type IN ('market_analysis', 'trend_report', 'annual_review', 'genre_study', 'regional_analysis')),

    -- Content
    report_file_url TEXT,
    report_format TEXT, -- 'pdf', 'html', 'interactive'

    -- Data period covered
    period_start DATE,
    period_end DATE,

    -- Metadata
    author TEXT,
    publication_date DATE,
    version TEXT,

    -- Access
    access_level TEXT NOT NULL CHECK (access_level IN ('public', 'registered', 'premium')),
    download_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_period ON public.open_data_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_region ON public.open_data_metrics(region, country_code);
CREATE INDEX IF NOT EXISTS idx_streaming_trends_date ON public.streaming_trends(date);
CREATE INDEX IF NOT EXISTS idx_streaming_trends_genre ON public.streaming_trends(genre);
CREATE INDEX IF NOT EXISTS idx_research_datasets_access ON public.research_datasets(access_level);
CREATE INDEX IF NOT EXISTS idx_dataset_requests_status ON public.dataset_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON public.api_usage_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON public.api_usage_tracking(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.open_data_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.open_data_api_keys(is_active);

-- Enable RLS
ALTER TABLE public.open_data_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_data_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for open_data_metrics (public read)
CREATE POLICY "Anyone can view open data metrics"
    ON public.open_data_metrics FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify open data metrics"
    ON public.open_data_metrics FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for streaming_trends (public read)
CREATE POLICY "Anyone can view streaming trends"
    ON public.streaming_trends FOR SELECT
    USING (true);

-- RLS Policies for research_datasets
CREATE POLICY "Anyone can view public datasets"
    ON public.research_datasets FOR SELECT
    USING (access_level = 'public');

CREATE POLICY "Registered users can view registered datasets"
    ON public.research_datasets FOR SELECT
    USING (
        access_level IN ('public', 'registered_users') AND
        auth.uid() IS NOT NULL
    );

-- RLS Policies for dataset_access_requests
CREATE POLICY "Users can view their own requests"
    ON public.dataset_access_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create access requests"
    ON public.dataset_access_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests"
    ON public.dataset_access_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for api_usage_tracking
CREATE POLICY "Users can view their own API usage"
    ON public.api_usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all API usage"
    ON public.api_usage_tracking FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for open_data_api_keys
CREATE POLICY "Users can manage their own API keys"
    ON public.open_data_api_keys FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for data_quality_metrics (admin only)
CREATE POLICY "Admins can view quality metrics"
    ON public.data_quality_metrics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SuperAdmin', 'Admin')
        )
    );

-- RLS Policies for industry_reports
CREATE POLICY "Anyone can view public reports"
    ON public.industry_reports FOR SELECT
    USING (access_level = 'public');

CREATE POLICY "Registered users can view registered reports"
    ON public.industry_reports FOR SELECT
    USING (
        access_level IN ('public', 'registered') AND
        auth.uid() IS NOT NULL
    );

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
    v_key TEXT;
BEGIN
    -- Generate a secure random API key
    v_key := 'msc_' || encode(gen_random_bytes(32), 'hex');
    RETURN v_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track API usage
CREATE OR REPLACE FUNCTION track_api_request(
    p_api_key TEXT,
    p_endpoint TEXT,
    p_http_method TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_key_hash TEXT;
    v_user_id UUID;
    v_rate_limit INTEGER;
    v_recent_requests INTEGER;
    v_result JSONB;
BEGIN
    -- Hash the API key
    v_key_hash := encode(digest(p_api_key, 'sha256'), 'hex');

    -- Get key details
    SELECT user_id, rate_limit_per_hour INTO v_user_id, v_rate_limit
    FROM public.open_data_api_keys
    WHERE api_key_hash = v_key_hash AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Invalid or inactive API key');
    END IF;

    -- Check rate limit
    SELECT COUNT(*) INTO v_recent_requests
    FROM public.api_usage_tracking
    WHERE api_key_hash = v_key_hash
    AND timestamp > NOW() - INTERVAL '1 hour';

    IF v_recent_requests >= v_rate_limit THEN
        RETURN jsonb_build_object('error', 'Rate limit exceeded');
    END IF;

    -- Log the request
    INSERT INTO public.api_usage_tracking (api_key_hash, user_id, endpoint, http_method)
    VALUES (v_key_hash, v_user_id, p_endpoint, p_http_method);

    -- Update key last used
    UPDATE public.open_data_api_keys
    SET last_used_at = NOW(),
        requests_used_this_month = requests_used_this_month + 1
    WHERE api_key_hash = v_key_hash;

    v_result := jsonb_build_object(
        'success', true,
        'requests_remaining', v_rate_limit - v_recent_requests - 1
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.open_data_metrics TO anon, authenticated;
GRANT SELECT ON public.streaming_trends TO anon, authenticated;
GRANT SELECT ON public.research_datasets TO anon, authenticated;
GRANT SELECT, INSERT ON public.dataset_access_requests TO authenticated;
GRANT SELECT ON public.api_usage_tracking TO authenticated;
GRANT ALL ON public.open_data_api_keys TO authenticated;
GRANT SELECT ON public.industry_reports TO anon, authenticated;

GRANT ALL ON public.open_data_metrics TO service_role;
GRANT ALL ON public.streaming_trends TO service_role;
GRANT ALL ON public.research_datasets TO service_role;
GRANT ALL ON public.dataset_access_requests TO service_role;
GRANT ALL ON public.api_usage_tracking TO service_role;
GRANT ALL ON public.open_data_api_keys TO service_role;
GRANT ALL ON public.data_quality_metrics TO service_role;
GRANT ALL ON public.industry_reports TO service_role;
