-- COMPLETE RLS REBUILD FROM SCRATCH - NO PATCHING
-- MSC & Co Platform - Drop All Policies and Rebuild Clean
-- Run this in Supabase SQL Editor

-- ================================
-- STEP 1: DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- ================================

-- Drop all policies on user_profiles
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all" ON user_profiles;

-- Drop all policies on releases
DROP POLICY IF EXISTS "Service role releases access" ON releases;
DROP POLICY IF EXISTS "Artists can manage own releases" ON releases;
DROP POLICY IF EXISTS "Admins can view all releases" ON releases;
DROP POLICY IF EXISTS "Label admins can view their artists releases" ON releases;

-- Drop all policies on subscriptions
DROP POLICY IF EXISTS "Service role subscriptions access" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

-- Drop all policies on artist_requests
DROP POLICY IF EXISTS "Service role artist_requests access" ON artist_requests;
DROP POLICY IF EXISTS "Label admins can create requests" ON artist_requests;
DROP POLICY IF EXISTS "Label admins can view their requests" ON artist_requests;
DROP POLICY IF EXISTS "Artists can view requests to them" ON artist_requests;
DROP POLICY IF EXISTS "Artists can respond to requests" ON artist_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON artist_requests;

-- Drop all policies on revenue_reports
DROP POLICY IF EXISTS "Service role revenue_reports access" ON revenue_reports;

-- Drop all policies on wallet_transactions
DROP POLICY IF EXISTS "Service role wallet_transactions access" ON wallet_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;

-- Drop all policies on permission_definitions
DROP POLICY IF EXISTS "Service role permission_definitions access" ON permission_definitions;
DROP POLICY IF EXISTS "Everyone can view permission definitions" ON permission_definitions;

-- Drop all policies on user_permissions
DROP POLICY IF EXISTS "Service role user_permissions access" ON user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Super admins can manage permissions" ON user_permissions;

-- ================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- ================================

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE releases DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE artist_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE permission_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;

-- ================================
-- STEP 3: RE-ENABLE RLS ON ALL TABLES
-- ================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- ================================
-- STEP 4: CREATE FRESH SERVICE ROLE POLICIES
-- ================================

CREATE POLICY "service_role_user_profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_releases" ON releases
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_artist_requests" ON artist_requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_revenue_reports" ON revenue_reports
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_wallet_transactions" ON wallet_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_permission_definitions" ON permission_definitions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_user_permissions" ON user_permissions
  FOR ALL USING (auth.role() = 'service_role');

-- ================================
-- STEP 5: CREATE FRESH USER POLICIES
-- ================================

CREATE POLICY "users_own_profile_select" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_own_profile_update" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "artists_own_releases" ON releases
  FOR ALL USING (auth.uid() = artist_id);

CREATE POLICY "users_own_subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_own_transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ================================
-- STEP 6: CREATE FRESH ADMIN POLICIES
-- ================================

CREATE POLICY "admins_all_profiles" ON user_profiles
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE role IN ('company_admin', 'super_admin')
    )
  );

CREATE POLICY "admins_all_releases" ON releases
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE role IN ('company_admin', 'super_admin', 'distribution_partner')
    )
  );

-- ================================
-- STEP 7: CREATE FRESH ARTIST REQUEST POLICIES
-- ================================

CREATE POLICY "label_admin_create_requests" ON artist_requests
  FOR INSERT WITH CHECK (auth.uid() = from_label_id);

CREATE POLICY "label_admin_view_requests" ON artist_requests
  FOR SELECT USING (auth.uid() = from_label_id);

CREATE POLICY "artist_view_requests" ON artist_requests
  FOR SELECT USING (auth.uid() = to_artist_id);

CREATE POLICY "artist_respond_requests" ON artist_requests
  FOR UPDATE USING (auth.uid() = to_artist_id);

CREATE POLICY "admins_all_requests" ON artist_requests
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE role IN ('company_admin', 'super_admin')
    )
  );

-- ================================
-- STEP 8: CREATE FRESH PERMISSION POLICIES
-- ================================

CREATE POLICY "public_permission_definitions" ON permission_definitions
  FOR SELECT USING (true);

CREATE POLICY "users_own_permissions" ON user_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "super_admin_manage_permissions" ON user_permissions
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE role = 'super_admin'
    )
  );
