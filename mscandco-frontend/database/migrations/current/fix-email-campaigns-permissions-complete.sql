-- ===========================================
-- Complete Fix for Email Campaigns Permissions
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Ensure service role and authenticated admins can manage campaigns
-- ===========================================

-- First, ensure proper GRANTs at the database level
-- Service role should already have these, but let's be explicit
GRANT ALL ON email_campaigns TO service_role;
GRANT ALL ON email_campaign_recipients TO service_role;
GRANT ALL ON marketing_email_templates TO service_role;

GRANT ALL ON email_campaigns TO authenticated;
GRANT ALL ON email_campaign_recipients TO authenticated;
GRANT ALL ON marketing_email_templates TO authenticated;

-- Also grant on sequences if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Service role can manage campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Admin users can manage campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Service role can manage recipients" ON email_campaign_recipients;
DROP POLICY IF EXISTS "Admin users can manage recipients" ON email_campaign_recipients;
DROP POLICY IF EXISTS "Service role can manage templates" ON marketing_email_templates;
DROP POLICY IF EXISTS "Admin users can manage templates" ON marketing_email_templates;

-- Recreate policies with proper structure
-- Service role policies - should allow everything (bypass RLS)
CREATE POLICY "Service role can manage campaigns"
  ON email_campaigns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage recipients"
  ON email_campaign_recipients
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage templates"
  ON marketing_email_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin user policies - for authenticated admins
CREATE POLICY "Admin users can manage campaigns"
  ON email_campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  );

CREATE POLICY "Admin users can manage recipients"
  ON email_campaign_recipients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  );

CREATE POLICY "Admin users can manage templates"
  ON marketing_email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  );

-- Verify RLS is enabled
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_email_templates ENABLE ROW LEVEL SECURITY;

