-- ===========================================
-- Fix RLS Policies for Email Campaigns
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Allow admin users to create campaigns via service role
-- ===========================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Service role can manage campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Service role can manage recipients" ON email_campaigns_recipients;
DROP POLICY IF EXISTS "Service role can manage templates" ON marketing_email_templates;

-- Recreate policies: Service role has full access (bypasses RLS)
CREATE POLICY "Service role can manage campaigns"
  ON email_campaigns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also allow authenticated admin users to manage campaigns
-- This is a fallback in case service role isn't working as expected
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

-- Same for recipients
CREATE POLICY "Service role can manage recipients"
  ON email_campaign_recipients
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- Same for templates
CREATE POLICY "Service role can manage templates"
  ON marketing_email_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

