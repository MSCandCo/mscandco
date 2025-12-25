-- RESTORE RLS POLICIES PROPERLY - NO PATCHING
-- MSC & Co Platform - Proper Security Implementation
-- Run this in Supabase SQL Editor

-- ================================
-- STEP 1: RE-ENABLE RLS ON ALL TABLES
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
-- STEP 2: CREATE SERVICE ROLE POLICIES (FOR API ACCESS)
-- ================================

-- Service role gets full access to all tables
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role releases access" ON releases
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role subscriptions access" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role artist_requests access" ON artist_requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role revenue_reports access" ON revenue_reports
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role wallet_transactions access" ON wallet_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role permission_definitions access" ON permission_definitions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role user_permissions access" ON user_permissions
  FOR ALL USING (auth.role() = 'service_role');

-- ================================
-- STEP 3: CREATE USER POLICIES
-- ================================

-- Users can view and update their own profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Artists can manage their own releases
CREATE POLICY "Artists can manage own releases" ON releases
  FOR ALL USING (auth.uid() = artist_id);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ================================
-- STEP 4: CREATE ADMIN POLICIES
-- ================================

-- Company Admins and Super Admins can view all user profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE role IN ('company_admin', 'super_admin')
    )
  );

-- Admins can view all releases
CREATE POLICY "Admins can view all releases" ON releases
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE role IN ('company_admin', 'super_admin', 'distribution_partner')
    )
  );

-- Label admins can view releases of their artists
CREATE POLICY "Label admins can view their artists releases" ON releases
  FOR SELECT USING (auth.uid() = label_admin_id);

-- ================================
-- STEP 5: CREATE ARTIST REQUEST POLICIES
-- ================================

-- Label admins can create and view their requests
CREATE POLICY "Label admins can create requests" ON artist_requests
  FOR INSERT WITH CHECK (
    auth.uid() = from_label_id AND 
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'label_admin')
  );

CREATE POLICY "Label admins can view their requests" ON artist_requests
  FOR SELECT USING (auth.uid() = from_label_id);

-- Artists can view and respond to requests sent to them
CREATE POLICY "Artists can view requests to them" ON artist_requests
  FOR SELECT USING (auth.uid() = to_artist_id);

CREATE POLICY "Artists can respond to requests" ON artist_requests
  FOR UPDATE USING (auth.uid() = to_artist_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" ON artist_requests
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE role IN ('company_admin', 'super_admin')
    )
  );

-- ================================
-- STEP 6: CREATE PERMISSION POLICIES
-- ================================

-- Everyone can view permission definitions
CREATE POLICY "Everyone can view permission definitions" ON permission_definitions
  FOR SELECT USING (true);

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions" ON user_permissions
  FOR SELECT USING (auth.uid() = user_id);

-- Super admins can manage all permissions
CREATE POLICY "Super admins can manage permissions" ON user_permissions
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles
      WHERE role = 'super_admin'
    )
  );
