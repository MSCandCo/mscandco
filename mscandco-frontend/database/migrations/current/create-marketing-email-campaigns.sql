-- ===========================================
-- Marketing Email Campaigns System
-- ===========================================
-- Date: 2025-01-26
-- Purpose: Enable marketing email campaigns with intelligent user filtering
-- ===========================================

-- ===========================================
-- 1. CREATE EMAIL CAMPAIGNS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  
  -- Filter criteria (stored as JSONB for flexibility)
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Campaign status
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Recipient info
  total_recipients INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Optional: Template reference
  template_id UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON email_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);

-- ===========================================
-- 2. CREATE EMAIL CAMPAIGN RECIPIENTS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  -- Delivery tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, failed
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_user_id ON email_campaign_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON email_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_email ON email_campaign_recipients(email);

-- ===========================================
-- 3. CREATE MARKETING EMAIL TEMPLATES TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS marketing_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  subject_template TEXT NOT NULL,
  body_html_template TEXT NOT NULL,
  body_text_template TEXT,
  
  -- Template variables (JSON array of variable names)
  variables JSONB DEFAULT '[]'::jsonb,
  
  -- Category
  category VARCHAR(100),
  
  -- Preview image URL (optional)
  preview_image_url TEXT,
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marketing_templates_category ON marketing_email_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketing_templates_is_active ON marketing_email_templates(is_active);

-- ===========================================
-- 4. CREATE FUNCTION TO UPDATE UPDATED_AT
-- ===========================================

CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_campaigns_timestamp
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

CREATE TRIGGER update_marketing_templates_timestamp
  BEFORE UPDATE ON marketing_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- ===========================================
-- 5. INSERT DEFAULT MARKETING TEMPLATES
-- ===========================================

INSERT INTO marketing_email_templates (name, description, subject_template, body_html_template, category, variables)
VALUES 
  (
    'Welcome New Users',
    'Welcome email for new platform users',
    'Welcome to {{platform_name}}!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Welcome to {{platform_name}}, {{user_name}}!</h1>
  <p>We''re excited to have you join our community.</p>
  <p><a href="{{dashboard_url}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
</body>
</html>',
    'onboarding',
    '["platform_name", "user_name", "dashboard_url"]'::jsonb
  ),
  (
    'Product Update',
    'Announce new features and updates',
    'New Features Available: {{feature_title}}',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>New Feature: {{feature_title}}</h1>
  <p>{{feature_description}}</p>
  <p><a href="{{learn_more_url}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Learn More</a></p>
</body>
</html>',
    'product',
    '["feature_title", "feature_description", "learn_more_url"]'::jsonb
  ),
  (
    'Re-engagement',
    'Re-engage inactive users',
    'We Miss You, {{user_name}}!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>We Miss You, {{user_name}}!</h1>
  <p>It''s been a while since you last logged in. Here''s what you''ve been missing:</p>
  <ul>
    <li>{{update_1}}</li>
    <li>{{update_2}}</li>
  </ul>
  <p><a href="{{login_url}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log In Now</a></p>
</body>
</html>',
    're-engagement',
    '["user_name", "update_1", "update_2", "login_url"]'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 6. GRANT PERMISSIONS
-- ===========================================

-- Service role has full access
GRANT ALL ON email_campaigns TO service_role;
GRANT ALL ON email_campaign_recipients TO service_role;
GRANT ALL ON marketing_email_templates TO service_role;

-- Authenticated users can read (for API access)
GRANT SELECT ON email_campaigns TO authenticated;
GRANT SELECT ON email_campaign_recipients TO authenticated;
GRANT SELECT ON marketing_email_templates TO authenticated;

-- ===========================================
-- 7. RLS POLICIES
-- ===========================================

-- Email campaigns: Only service role can manage
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage campaigns"
  ON email_campaigns
  FOR ALL
  TO service_role
  USING (true);

-- Campaign recipients: Only service role can manage
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage recipients"
  ON email_campaign_recipients
  FOR ALL
  TO service_role
  USING (true);

-- Marketing templates: Only service role can manage
ALTER TABLE marketing_email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage templates"
  ON marketing_email_templates
  FOR ALL
  TO service_role
  USING (true);

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================

-- This migration creates:
-- ✅ email_campaigns table for campaign management
-- ✅ email_campaign_recipients table for tracking deliveries
-- ✅ marketing_email_templates table for reusable templates
-- ✅ Default templates for common use cases
-- ✅ Proper indexes for performance
-- ✅ RLS policies for security
-- ✅ Timestamp triggers for updated_at

