-- ===========================================
-- Advanced Marketing Features
-- ===========================================
-- Date: 2025-01-26
-- Purpose: Add A/B testing, saved segments, automation, and advanced analytics
-- ===========================================

-- ===========================================
-- 1. ADD A/B TESTING COLUMNS TO CAMPAIGNS
-- ===========================================

ALTER TABLE email_campaigns
ADD COLUMN IF NOT EXISTS is_ab_test BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ab_test_type VARCHAR(50), -- 'subject' or 'content'
ADD COLUMN IF NOT EXISTS ab_test_split INTEGER DEFAULT 50, -- Percentage for variant A (50 = 50/50 split)
ADD COLUMN IF NOT EXISTS ab_test_duration_hours INTEGER DEFAULT 24, -- Hours before declaring winner
ADD COLUMN IF NOT EXISTS ab_test_winner_variant VARCHAR(10), -- 'A' or 'B'
ADD COLUMN IF NOT EXISTS ab_test_variant_a_id UUID REFERENCES email_campaigns(id),
ADD COLUMN IF NOT EXISTS ab_test_variant_b_id UUID REFERENCES email_campaigns(id);

-- Index for A/B test queries
CREATE INDEX IF NOT EXISTS idx_campaigns_ab_test ON email_campaigns(is_ab_test) WHERE is_ab_test = true;

-- ===========================================
-- 2. CREATE SAVED AUDIENCE SEGMENTS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS audience_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Segment stats (cached)
  estimated_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_audience_segments_created_by ON audience_segments(created_by);
CREATE INDEX IF NOT EXISTS idx_audience_segments_is_active ON audience_segments(is_active);

-- ===========================================
-- 3. CREATE CAMPAIGN AUTOMATION WORKFLOWS
-- ===========================================

CREATE TABLE IF NOT EXISTS campaign_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Trigger configuration
  trigger_type VARCHAR(100) NOT NULL, -- 'event', 'schedule', 'condition'
  trigger_config JSONB DEFAULT '{}'::jsonb,
  
  -- Workflow steps (JSON array of steps)
  steps JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, archived
  is_active BOOLEAN DEFAULT false,
  
  -- Execution tracking
  last_triggered_at TIMESTAMPTZ,
  total_triggered INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_automations_status ON campaign_automations(status);
CREATE INDEX IF NOT EXISTS idx_campaign_automations_is_active ON campaign_automations(is_active);

-- ===========================================
-- 4. CREATE EMAIL CLIENT PREVIEW TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS email_client_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  client_name VARCHAR(100) NOT NULL, -- 'gmail', 'outlook', 'apple_mail', etc.
  preview_html TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, client_name)
);

CREATE INDEX IF NOT EXISTS idx_email_previews_campaign_id ON email_client_previews(campaign_id);

-- ===========================================
-- 5. ADD ADVANCED TRACKING TO RECIPIENTS
-- ===========================================

ALTER TABLE email_campaign_recipients
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS links_clicked JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
ADD COLUMN IF NOT EXISTS email_client VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS spam_reported_at TIMESTAMPTZ;

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_recipients_opened ON email_campaign_recipients(campaign_id, opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipients_clicked ON email_campaign_recipients(campaign_id, clicked_at) WHERE clicked_at IS NOT NULL;

-- ===========================================
-- 6. CREATE EMAIL LINKS TRACKING TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS email_campaign_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  tracked_url TEXT NOT NULL UNIQUE, -- Shortened/tracked URL
  link_text TEXT,
  click_count INTEGER DEFAULT 0,
  unique_click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_links_campaign_id ON email_campaign_links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_links_tracked_url ON email_campaign_links(tracked_url);

-- ===========================================
-- 7. CREATE LINK CLICKS TRACKING TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS email_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES email_campaign_links(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES email_campaign_recipients(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON email_link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_recipient_id ON email_link_clicks(recipient_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON email_link_clicks(clicked_at DESC);

-- ===========================================
-- 8. CREATE CAMPAIGN ANALYTICS SNAPSHOTS
-- ===========================================

CREATE TABLE IF NOT EXISTS campaign_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  snapshot_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metrics at this point in time
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_unsubscribed INTEGER DEFAULT 0,
  emails_spam_reported INTEGER DEFAULT 0,
  
  -- Rates (calculated)
  delivery_rate DECIMAL(5,2),
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),
  unsubscribe_rate DECIMAL(5,2),
  
  -- Engagement
  avg_time_to_open_minutes DECIMAL(10,2),
  avg_time_to_click_minutes DECIMAL(10,2),
  total_links_clicked INTEGER DEFAULT 0,
  
  UNIQUE(campaign_id, snapshot_time)
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_campaign_id ON campaign_analytics_snapshots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_time ON campaign_analytics_snapshots(snapshot_time DESC);

-- ===========================================
-- 9. CREATE CAMPAIGN TEMPLATE VARIABLES TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS campaign_template_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  variable_name VARCHAR(100) NOT NULL,
  variable_type VARCHAR(50) NOT NULL, -- 'merge_tag', 'conditional', 'dynamic'
  default_value TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, variable_name)
);

CREATE INDEX IF NOT EXISTS idx_template_variables_campaign_id ON campaign_template_variables(campaign_id);

-- ===========================================
-- 10. CREATE CAMPAIGN CLONE HISTORY
-- ===========================================

ALTER TABLE email_campaigns
ADD COLUMN IF NOT EXISTS cloned_from_id UUID REFERENCES email_campaigns(id),
ADD COLUMN IF NOT EXISTS clone_count INTEGER DEFAULT 0;

-- ===========================================
-- 11. CREATE FUNCTION TO UPDATE UPDATED_AT
-- ===========================================

CREATE OR REPLACE FUNCTION update_audience_segments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audience_segments_timestamp
  BEFORE UPDATE ON audience_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_audience_segments_updated_at();

CREATE TRIGGER update_campaign_automations_timestamp
  BEFORE UPDATE ON campaign_automations
  FOR EACH ROW
  EXECUTE FUNCTION update_audience_segments_updated_at();

-- ===========================================
-- 12. GRANT PERMISSIONS
-- ===========================================

GRANT ALL ON audience_segments TO service_role;
GRANT ALL ON campaign_automations TO service_role;
GRANT ALL ON email_client_previews TO service_role;
GRANT ALL ON email_campaign_links TO service_role;
GRANT ALL ON email_link_clicks TO service_role;
GRANT ALL ON campaign_analytics_snapshots TO service_role;
GRANT ALL ON campaign_template_variables TO service_role;

GRANT SELECT ON audience_segments TO authenticated;
GRANT SELECT ON campaign_automations TO authenticated;
GRANT SELECT ON email_client_previews TO authenticated;
GRANT SELECT ON email_campaign_links TO authenticated;
GRANT SELECT ON email_link_clicks TO authenticated;
GRANT SELECT ON campaign_analytics_snapshots TO authenticated;
GRANT SELECT ON campaign_template_variables TO authenticated;

-- ===========================================
-- 13. RLS POLICIES
-- ===========================================

ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage segments"
  ON audience_segments
  FOR ALL
  TO service_role
  USING (true);

ALTER TABLE campaign_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage automations"
  ON campaign_automations
  FOR ALL
  TO service_role
  USING (true);

ALTER TABLE email_client_previews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage previews"
  ON email_client_previews
  FOR ALL
  TO service_role
  USING (true);

ALTER TABLE email_campaign_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage links"
  ON email_campaign_links
  FOR ALL
  TO service_role
  USING (true);

ALTER TABLE email_link_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage link clicks"
  ON email_link_clicks
  FOR ALL
  TO service_role
  USING (true);

ALTER TABLE campaign_analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage analytics snapshots"
  ON campaign_analytics_snapshots
  FOR ALL
  TO service_role
  USING (true);

ALTER TABLE campaign_template_variables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage template variables"
  ON campaign_template_variables
  FOR ALL
  TO service_role
  USING (true);

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================

-- This migration adds:
-- ✅ A/B testing support with variant tracking
-- ✅ Saved audience segments for reusable filters
-- ✅ Campaign automation workflows
-- ✅ Email client preview tracking
-- ✅ Advanced link click tracking
-- ✅ Analytics snapshots for time-series data
-- ✅ Template variables for dynamic content
-- ✅ Campaign cloning support
-- ✅ Enhanced recipient tracking (devices, clients, engagement)

