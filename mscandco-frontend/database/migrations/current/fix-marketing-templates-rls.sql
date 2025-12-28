-- ===========================================
-- Fix RLS Policies for marketing_email_templates
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Fix permission denied error by adding proper RLS policies
-- ===========================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Service role can manage templates" ON marketing_email_templates;
DROP POLICY IF EXISTS "Admins can read templates" ON marketing_email_templates;
DROP POLICY IF EXISTS "Admins can insert templates" ON marketing_email_templates;
DROP POLICY IF EXISTS "Admins can update templates" ON marketing_email_templates;
DROP POLICY IF EXISTS "Admins can delete templates" ON marketing_email_templates;

-- Enable RLS (idempotent)
ALTER TABLE marketing_email_templates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role can do everything (bypasses RLS anyway, but explicit)
CREATE POLICY "Service role can manage templates"
  ON marketing_email_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated admin users can read templates
CREATE POLICY "Admins can read templates"
  ON marketing_email_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  );

-- Policy 3: Authenticated admin users can insert templates
CREATE POLICY "Admins can insert templates"
  ON marketing_email_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  );

-- Policy 4: Authenticated admin users can update templates
CREATE POLICY "Admins can update templates"
  ON marketing_email_templates
  FOR UPDATE
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

-- Policy 5: Authenticated admin users can delete templates
CREATE POLICY "Admins can delete templates"
  ON marketing_email_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin', 'marketing_admin')
    )
  );

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- This migration fixes RLS policies to allow:
-- ✅ Service role full access (bypasses RLS)
-- ✅ Authenticated admin users (super_admin, company_admin, marketing_admin) can read templates
-- ✅ Authenticated admin users can create, update, and delete templates

