-- Sample Scan Tracking for Cleared Integration
-- Tracks usage for billing and provides audit trail

-- Table: sample_scan_usage
CREATE TABLE IF NOT EXISTS sample_scan_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,

  -- Cleared API Response Data
  scan_id TEXT, -- Cleared's scan ID for reference
  samples_detected INTEGER DEFAULT 0,
  royalty_free_detected INTEGER DEFAULT 0,
  content_id_conflicts INTEGER DEFAULT 0,
  risk_level TEXT CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),

  -- Billing & Cost Tracking
  cost_usd DECIMAL(10,4) DEFAULT 0.07, -- $0.07 per scan after free tier
  was_free BOOLEAN DEFAULT false, -- Track if this was part of free tier

  -- Metadata
  scan_duration_ms INTEGER, -- How long the scan took
  api_response JSONB, -- Store full Cleared API response for audit

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sample_scan_user ON sample_scan_usage(user_id);
CREATE INDEX idx_sample_scan_release ON sample_scan_usage(release_id);
CREATE INDEX idx_sample_scan_risk ON sample_scan_usage(risk_level);
CREATE INDEX idx_sample_scan_created ON sample_scan_usage(created_at DESC);

-- Table: sample_detection_results
-- Stores detailed detection results for artist review
CREATE TABLE IF NOT EXISTS sample_detection_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_usage_id UUID NOT NULL REFERENCES sample_scan_usage(id) ON DELETE CASCADE,

  -- Sample Details
  source_title TEXT,
  source_artist TEXT,
  rights_holder TEXT, -- Label or publisher
  timestamp_in_track TEXT, -- Where in the track the sample appears
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),

  -- Action Taken
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'removed', 'replaced', 'disputed', 'ignored')),
  action_notes TEXT,
  action_taken_at TIMESTAMPTZ,
  action_taken_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sample_detection_scan ON sample_detection_results(scan_usage_id);
CREATE INDEX idx_sample_detection_status ON sample_detection_results(status);

-- Row Level Security Policies
ALTER TABLE sample_scan_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_detection_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own scan history
CREATE POLICY "Users can view own sample scans"
  ON sample_scan_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all scans
CREATE POLICY "Admins can view all sample scans"
  ON sample_scan_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- Users can view their own detection results
CREATE POLICY "Users can view own detection results"
  ON sample_detection_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sample_scan_usage
      WHERE sample_scan_usage.id = sample_detection_results.scan_usage_id
      AND sample_scan_usage.user_id = auth.uid()
    )
  );

-- Users can update their own detection results (mark status)
CREATE POLICY "Users can update own detection results"
  ON sample_detection_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sample_scan_usage
      WHERE sample_scan_usage.id = sample_detection_results.scan_usage_id
      AND sample_scan_usage.user_id = auth.uid()
    )
  );

-- Admins can view all detection results
CREATE POLICY "Admins can view all detection results"
  ON sample_detection_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- Function: Get user's monthly sample scan count
CREATE OR REPLACE FUNCTION get_user_monthly_scan_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM sample_scan_usage
  WHERE user_id = p_user_id
  AND created_at >= date_trunc('month', NOW())
$$ LANGUAGE SQL STABLE;

-- Function: Get user's total free scans used
CREATE OR REPLACE FUNCTION get_user_free_scans_used(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM sample_scan_usage
  WHERE user_id = p_user_id
  AND was_free = true
$$ LANGUAGE SQL STABLE;

-- Function: Check if user has sample scanning access
CREATE OR REPLACE FUNCTION user_has_sample_scan_access(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM user_profiles
  WHERE id = p_user_id;

  -- MPP Partner and above get unlimited access
  RETURN v_tier IN ('mpp_partner', 'msc_business', 'msc_enterprise');
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sample_scan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sample_scan_usage_updated_at
  BEFORE UPDATE ON sample_scan_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_sample_scan_updated_at();

CREATE TRIGGER sample_detection_results_updated_at
  BEFORE UPDATE ON sample_detection_results
  FOR EACH ROW
  EXECUTE FUNCTION update_sample_scan_updated_at();

-- Comments
COMMENT ON TABLE sample_scan_usage IS 'Tracks Cleared API usage for billing and audit trail';
COMMENT ON TABLE sample_detection_results IS 'Detailed sample detection results for artist review';
COMMENT ON FUNCTION get_user_monthly_scan_count IS 'Returns number of scans user has performed this month';
COMMENT ON FUNCTION get_user_free_scans_used IS 'Returns number of free tier scans user has used';
COMMENT ON FUNCTION user_has_sample_scan_access IS 'Checks if user subscription tier includes sample scanning';
