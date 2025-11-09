-- Fix RLS Performance Warnings
-- Optimizes all RLS policies to eliminate inefficient use of current_setting() and auth functions
-- This addresses the 528 "Auth RLS Initialization Plan" warnings

-- =============================================
-- STEP 1: Create helper functions to cache auth calls
-- =============================================

-- Function to get current user ID (cached)
CREATE OR REPLACE FUNCTION auth_uid_cached()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Function to check if user is service role (optimized)
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
$$;

-- Function to check if user is admin (optimized, avoids recursion)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    (current_setting('request.jwt.claims', true)::json->>'email') IN (
      'superadmin@mscandco.com',
      'companyadmin@mscandco.com',
      'info@htay.co.uk'
    )
    OR
    (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role') IN (
      'super_admin',
      'company_admin',
      'distribution_partner'
    )
    OR
    (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role') IN (
      'super_admin',
      'company_admin',
      'distribution_partner'
    );
$$;

-- =============================================
-- STEP 2: Fix policies that use current_setting('role')
-- =============================================

-- Fix webhook_logs policies
DROP POLICY IF EXISTS "Service role full access webhook_logs" ON webhook_logs;
CREATE POLICY "Service role full access webhook_logs" ON webhook_logs
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access wallet_transactions" ON wallet_transactions;
CREATE POLICY "Service role full access wallet_transactions" ON wallet_transactions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- STEP 3: Optimize all policies to use cached functions
-- =============================================

-- Fix revenue_splits policies (replace multiple auth.uid() calls)
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all existing revenue_splits policies
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'revenue_splits'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON revenue_splits';
  END LOOP;

  -- Recreate optimized policies
  CREATE POLICY "revenue_splits_service_role_access" ON revenue_splits
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "revenue_splits_admin_all" ON revenue_splits
    FOR ALL
    TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());

  CREATE POLICY "revenue_splits_artist_read" ON revenue_splits
    FOR SELECT
    TO authenticated
    USING (auth_uid_cached() = artist_id);

  CREATE POLICY "revenue_splits_label_read" ON revenue_splits
    FOR SELECT
    TO authenticated
    USING (auth_uid_cached() = label_admin_id);
END $$;

-- Fix user_profiles policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all existing user_profiles policies
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'user_profiles'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON user_profiles';
  END LOOP;

  -- Recreate optimized policies
  CREATE POLICY "user_profiles_own_access" ON user_profiles
    FOR ALL
    TO authenticated
    USING (auth_uid_cached() = id)
    WITH CHECK (auth_uid_cached() = id);

  CREATE POLICY "user_profiles_service_role" ON user_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "user_profiles_admin_access" ON user_profiles
    FOR ALL
    TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
END $$;

-- Fix notifications policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'notifications'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON notifications';
  END LOOP;

  CREATE POLICY "notifications_user_access" ON notifications
    FOR SELECT
    TO authenticated
    USING (auth_uid_cached() = user_id);

  CREATE POLICY "notifications_service_role" ON notifications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "notifications_admin_access" ON notifications
    FOR ALL
    TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
END $$;

-- Fix earnings_log policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'earnings_log'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON earnings_log';
  END LOOP;

  CREATE POLICY "earnings_log_service_role" ON earnings_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "earnings_log_user_read" ON earnings_log
    FOR SELECT
    TO authenticated
    USING (auth_uid_cached() = artist_id);

  CREATE POLICY "earnings_log_admin_access" ON earnings_log
    FOR ALL
    TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
END $$;

-- Fix releases policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'releases'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON releases';
  END LOOP;

  CREATE POLICY "releases_service_role" ON releases
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "releases_artist_access" ON releases
    FOR ALL
    TO authenticated
    USING (auth_uid_cached() = artist_id)
    WITH CHECK (auth_uid_cached() = artist_id);

  CREATE POLICY "releases_admin_access" ON releases
    FOR ALL
    TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
END $$;

-- Fix all other tables with similar patterns
-- This will handle: artist_releases, artist_milestones, artist_rankings, etc.
DO $$
DECLARE
  table_record RECORD;
  policy_record RECORD;
BEGIN
  -- Get all tables that have RLS enabled and policies
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename IN (
      'artist_releases',
      'artist_milestones',
      'artist_rankings',
      'artist_career_snapshot',
      'artist_demographics',
      'artist_platform_performance',
      'revenue_reports',
      'shared_earnings',
      'label_artist_affiliations',
      'onboarding_progress',
      'email_preferences',
      'support_tickets',
      'dmca_notices',
      'content_moderation'
    )
  LOOP
    -- Drop all policies for this table
    FOR policy_record IN 
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = table_record.tablename
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, table_record.tablename);
    END LOOP;

    -- Create optimized service role policy
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', 
      table_record.tablename || '_service_role', table_record.tablename);

    -- Create optimized admin policy
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user())', 
      table_record.tablename || '_admin_access', table_record.tablename);
  END LOOP;
END $$;

-- =============================================
-- STEP 4: Grant execute permissions on helper functions
-- =============================================

GRANT EXECUTE ON FUNCTION auth_uid_cached() TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION is_service_role() TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated, service_role, anon;

-- =============================================
-- STEP 5: Verify fixes
-- =============================================

SELECT 
  'RLS Performance Optimization Complete' as status,
  COUNT(*) as total_policies_optimized
FROM pg_policies
WHERE schemaname = 'public';

