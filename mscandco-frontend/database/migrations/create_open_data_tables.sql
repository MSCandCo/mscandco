-- ============================================
-- OPEN DATA ADMINISTRATION DATABASE SCHEMA
-- ============================================
-- Single source of truth for public metrics and research data
-- Full database connectivity for open data admin page
-- ============================================

-- Open Data Metrics Table
-- Stores publicly available platform metrics
CREATE TABLE IF NOT EXISTS open_data_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_category TEXT CHECK (metric_category IN ('streaming_trends', 'genre_analytics', 'geographic_data', 'revenue_insights', 'platform_metrics', 'artist_demographics', 'engagement_stats', 'market_analysis')),
  metric_value NUMERIC,
  metric_unit TEXT,
  metric_type TEXT CHECK (metric_type IN ('aggregate', 'average', 'percentage', 'count', 'ratio')),
  time_period_start DATE,
  time_period_end DATE,
  is_public BOOLEAN DEFAULT false,
  visibility_level TEXT DEFAULT 'public' CHECK (visibility_level IN ('public', 'research', 'commercial', 'internal')),
  aggregation_method TEXT,
  sample_size INTEGER,
  confidence_level NUMERIC,
  data_source TEXT[],
  tags TEXT[],
  description TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Datasets Table
-- Stores research-grade aggregated datasets
CREATE TABLE IF NOT EXISTS research_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_name TEXT NOT NULL,
  dataset_category TEXT,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  is_published BOOLEAN DEFAULT false,
  access_tier TEXT DEFAULT 'free' CHECK (access_tier IN ('free', 'research', 'commercial')),
  file_format TEXT CHECK (file_format IN ('csv', 'json', 'parquet', 'sql')),
  file_size_bytes BIGINT,
  file_url TEXT,
  download_count INTEGER DEFAULT 0,
  record_count INTEGER,
  schema_definition JSONB,
  data_dictionary JSONB,
  collection_period_start DATE,
  collection_period_end DATE,
  anonymization_method TEXT,
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 100),
  citations_count INTEGER DEFAULT 0,
  license_type TEXT DEFAULT 'CC-BY-4.0',
  doi TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Open Data API Keys Table
-- Manages API keys for data access
CREATE TABLE IF NOT EXISTS open_data_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_hash TEXT UNIQUE NOT NULL,
  api_key_prefix TEXT NOT NULL,
  key_name TEXT,
  access_tier TEXT DEFAULT 'free' CHECK (access_tier IN ('free', 'research', 'commercial')),
  rate_limit_per_hour INTEGER DEFAULT 100,
  rate_limit_per_day INTEGER DEFAULT 10000,
  allowed_endpoints TEXT[],
  allowed_datasets UUID[],
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  ip_whitelist TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dataset Access Requests Table
-- Tracks requests for dataset access
CREATE TABLE IF NOT EXISTS dataset_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES research_datasets(id) ON DELETE CASCADE,
  requested_tier TEXT CHECK (requested_tier IN ('research', 'commercial')),
  organization_name TEXT,
  research_purpose TEXT,
  intended_use TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  approval_expires_at TIMESTAMPTZ,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage Logs Table
-- Tracks API usage for monitoring and analytics
CREATE TABLE IF NOT EXISTS open_data_api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES open_data_api_keys(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),
  dataset_id UUID REFERENCES research_datasets(id) ON DELETE SET NULL,
  response_status_code INTEGER,
  response_time_ms INTEGER,
  records_returned INTEGER,
  bytes_transferred BIGINT,
  ip_address INET,
  user_agent TEXT,
  request_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Dataset Citations Table
-- Tracks academic citations of datasets
CREATE TABLE IF NOT EXISTS dataset_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES research_datasets(id) ON DELETE CASCADE,
  citation_title TEXT NOT NULL,
  citation_authors TEXT[],
  publication_name TEXT,
  publication_year INTEGER,
  doi TEXT,
  url TEXT,
  citation_format_apa TEXT,
  citation_format_mla TEXT,
  citation_format_bibtex TEXT,
  verified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Open Data Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_category ON open_data_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_public ON open_data_metrics(is_public);
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_visibility ON open_data_metrics(visibility_level);
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_period ON open_data_metrics(time_period_start, time_period_end);
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_published ON open_data_metrics(published_at DESC) WHERE is_public = true;

-- Research Datasets Indexes
CREATE INDEX IF NOT EXISTS idx_research_datasets_published ON research_datasets(is_published);
CREATE INDEX IF NOT EXISTS idx_research_datasets_category ON research_datasets(dataset_category);
CREATE INDEX IF NOT EXISTS idx_research_datasets_tier ON research_datasets(access_tier);
CREATE INDEX IF NOT EXISTS idx_research_datasets_creator ON research_datasets(created_by);
CREATE INDEX IF NOT EXISTS idx_research_datasets_downloads ON research_datasets(download_count DESC);

-- Open Data API Keys Indexes
CREATE INDEX IF NOT EXISTS idx_open_data_api_keys_user ON open_data_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_open_data_api_keys_hash ON open_data_api_keys(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_open_data_api_keys_active ON open_data_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_open_data_api_keys_tier ON open_data_api_keys(access_tier);

-- Dataset Access Requests Indexes
CREATE INDEX IF NOT EXISTS idx_dataset_access_requests_user ON dataset_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_dataset_access_requests_dataset ON dataset_access_requests(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_access_requests_status ON dataset_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_dataset_access_requests_reviewer ON dataset_access_requests(reviewed_by);

-- API Usage Logs Indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_key ON open_data_api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user ON open_data_api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_timestamp ON open_data_api_usage_logs(request_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_dataset ON open_data_api_usage_logs(dataset_id);

-- Dataset Citations Indexes
CREATE INDEX IF NOT EXISTS idx_dataset_citations_dataset ON dataset_citations(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_citations_year ON dataset_citations(publication_year DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE open_data_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_data_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_data_api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_citations ENABLE ROW LEVEL SECURITY;

-- Open Data Metrics Policies
DROP POLICY IF EXISTS "Public metrics are viewable by all users" ON open_data_metrics;
CREATE POLICY "Public metrics are viewable by all users"
  ON open_data_metrics FOR SELECT
  USING (is_public = true);

-- Research Datasets Policies
DROP POLICY IF EXISTS "Published datasets are viewable by all users" ON research_datasets;
CREATE POLICY "Published datasets are viewable by all users"
  ON research_datasets FOR SELECT
  USING (is_published = true);

-- Open Data API Keys Policies
DROP POLICY IF EXISTS "Users can view their own API keys" ON open_data_api_keys;
CREATE POLICY "Users can view their own API keys"
  ON open_data_api_keys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own API keys" ON open_data_api_keys;
CREATE POLICY "Users can create their own API keys"
  ON open_data_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own API keys" ON open_data_api_keys;
CREATE POLICY "Users can update their own API keys"
  ON open_data_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own API keys" ON open_data_api_keys;
CREATE POLICY "Users can delete their own API keys"
  ON open_data_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Dataset Access Requests Policies
DROP POLICY IF EXISTS "Users can view their own access requests" ON dataset_access_requests;
CREATE POLICY "Users can view their own access requests"
  ON dataset_access_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create access requests" ON dataset_access_requests;
CREATE POLICY "Users can create access requests"
  ON dataset_access_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own access requests" ON dataset_access_requests;
CREATE POLICY "Users can update their own access requests"
  ON dataset_access_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- API Usage Logs Policies
DROP POLICY IF EXISTS "Users can view their own API usage logs" ON open_data_api_usage_logs;
CREATE POLICY "Users can view their own API usage logs"
  ON open_data_api_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Dataset Citations Policies
DROP POLICY IF EXISTS "Published dataset citations are viewable by all" ON dataset_citations;
CREATE POLICY "Published dataset citations are viewable by all"
  ON dataset_citations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM research_datasets
      WHERE id = dataset_citations.dataset_id
      AND is_published = true
    )
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp (reuse if already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_open_data_metrics_updated_at ON open_data_metrics;
CREATE TRIGGER update_open_data_metrics_updated_at
  BEFORE UPDATE ON open_data_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_datasets_updated_at ON research_datasets;
CREATE TRIGGER update_research_datasets_updated_at
  BEFORE UPDATE ON research_datasets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_open_data_api_keys_updated_at ON open_data_api_keys;
CREATE TRIGGER update_open_data_api_keys_updated_at
  BEFORE UPDATE ON open_data_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dataset_access_requests_updated_at ON dataset_access_requests;
CREATE TRIGGER update_dataset_access_requests_updated_at
  BEFORE UPDATE ON dataset_access_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dataset_citations_updated_at ON dataset_citations;
CREATE TRIGGER update_dataset_citations_updated_at
  BEFORE UPDATE ON dataset_citations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS FOR AUTO-INCREMENTING COUNTERS
-- ============================================

-- Update dataset download count
CREATE OR REPLACE FUNCTION increment_dataset_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dataset_id IS NOT NULL THEN
    UPDATE research_datasets
    SET download_count = download_count + 1,
        last_updated_at = NOW()
    WHERE id = NEW.dataset_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_download_count_trigger ON open_data_api_usage_logs;
CREATE TRIGGER increment_download_count_trigger
  AFTER INSERT ON open_data_api_usage_logs
  FOR EACH ROW
  WHEN (NEW.endpoint LIKE '%download%' AND NEW.response_status_code = 200)
  EXECUTE FUNCTION increment_dataset_download_count();

-- Update API key usage count
CREATE OR REPLACE FUNCTION increment_api_key_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key_id IS NOT NULL THEN
    UPDATE open_data_api_keys
    SET usage_count = usage_count + 1,
        last_used_at = NEW.request_timestamp
    WHERE id = NEW.api_key_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_api_usage_trigger ON open_data_api_usage_logs;
CREATE TRIGGER increment_api_usage_trigger
  AFTER INSERT ON open_data_api_usage_logs
  FOR EACH ROW EXECUTE FUNCTION increment_api_key_usage();

-- Update dataset citations count
CREATE OR REPLACE FUNCTION update_dataset_citations_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE research_datasets
    SET citations_count = citations_count + 1
    WHERE id = NEW.dataset_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE research_datasets
    SET citations_count = GREATEST(0, citations_count - 1)
    WHERE id = OLD.dataset_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_citations_count_trigger ON dataset_citations;
CREATE TRIGGER update_citations_count_trigger
  AFTER INSERT OR DELETE ON dataset_citations
  FOR EACH ROW EXECUTE FUNCTION update_dataset_citations_count();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TABLE(key_value TEXT, key_hash TEXT, key_prefix TEXT) AS $$
DECLARE
  random_key TEXT;
  key_hash_value TEXT;
  key_prefix_value TEXT;
BEGIN
  -- Generate random key: sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  random_key := 'sk_live_' || ENCODE(GEN_RANDOM_BYTES(24), 'hex');

  -- Create SHA-256 hash of the key
  key_hash_value := ENCODE(DIGEST(random_key, 'sha256'), 'hex');

  -- Store only first 8 characters as prefix for identification
  key_prefix_value := SUBSTRING(random_key, 1, 15);

  RETURN QUERY SELECT random_key, key_hash_value, key_prefix_value;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for API key usage statistics
CREATE OR REPLACE VIEW api_key_usage_stats AS
SELECT
  k.id AS api_key_id,
  k.user_id,
  k.key_name,
  k.access_tier,
  k.usage_count AS total_usage,
  k.last_used_at,
  COUNT(l.id) AS requests_last_24h,
  SUM(CASE WHEN l.response_status_code >= 200 AND l.response_status_code < 300 THEN 1 ELSE 0 END) AS successful_requests_24h,
  AVG(l.response_time_ms) AS avg_response_time_24h
FROM open_data_api_keys k
LEFT JOIN open_data_api_usage_logs l ON k.id = l.api_key_id
  AND l.request_timestamp > NOW() - INTERVAL '24 hours'
GROUP BY k.id, k.user_id, k.key_name, k.access_tier, k.usage_count, k.last_used_at;

-- Grant access to views
GRANT SELECT ON api_key_usage_stats TO authenticated;
