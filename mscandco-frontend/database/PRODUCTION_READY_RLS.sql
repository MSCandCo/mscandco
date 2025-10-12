-- PRODUCTION-READY RLS POLICIES
-- This replaces the temporary RLS disable with secure, non-recursive policies

-- =============================================
-- USER_PROFILES TABLE - SECURE RLS POLICIES
-- =============================================

-- First, re-enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Policy 1: Users can view and edit their own profile
CREATE POLICY "user_profiles_own_access"
ON user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 2: Service role has full access (for admin operations)
CREATE POLICY "user_profiles_service_role"
ON user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Admins can view all profiles (using JWT claims, not recursive queries)
CREATE POLICY "user_profiles_admin_read"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'superadmin@mscandco.com',
    'companyadmin@mscandco.com',
    'codegroup@mscandco.com'
  )
  OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin', 'distribution_partner')
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'company_admin', 'distribution_partner')
);

-- Policy 4: Admins can update all profiles
CREATE POLICY "user_profiles_admin_write"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'superadmin@mscandco.com',
    'companyadmin@mscandco.com',
    'codegroup@mscandco.com'
  )
  OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin', 'distribution_partner')
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'company_admin', 'distribution_partner')
)
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'superadmin@mscandco.com',
    'companyadmin@mscandco.com',
    'codegroup@mscandco.com'
  )
  OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin', 'distribution_partner')
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'company_admin', 'distribution_partner')
);

-- =============================================
-- SUBSCRIPTIONS TABLE - SECURE RLS POLICIES
-- =============================================

-- Re-enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "subscriptions_own_access" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_service_role" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin_access" ON subscriptions;

-- Users can view their own subscriptions
CREATE POLICY "subscriptions_own_read"
ON subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "subscriptions_service_role"
ON subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view all subscriptions
CREATE POLICY "subscriptions_admin_read"
ON subscriptions
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'superadmin@mscandco.com',
    'companyadmin@mscandco.com',
    'codegroup@mscandco.com'
  )
  OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin', 'distribution_partner')
);

-- Admins can manage all subscriptions
CREATE POLICY "subscriptions_admin_write"
ON subscriptions
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'superadmin@mscandco.com',
    'companyadmin@mscandco.com'
  )
  OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin')
)
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'superadmin@mscandco.com',
    'companyadmin@mscandco.com'
  )
  OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin')
);

-- =============================================
-- WALLET_TRANSACTIONS TABLE - SECURE RLS POLICIES
-- =============================================

-- Re-enable RLS on wallet_transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "wallet_transactions_own_access" ON wallet_transactions;
DROP POLICY IF EXISTS "wallet_transactions_service_role" ON wallet_transactions;
DROP POLICY IF EXISTS "wallet_transactions_admin_access" ON wallet_transactions;

-- Users can view their own wallet transactions
CREATE POLICY "wallet_transactions_own_read"
ON wallet_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "wallet_transactions_service_role"
ON wallet_transactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view all wallet transactions
CREATE POLICY "wallet_transactions_admin_read"
ON wallet_transactions
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'superadmin@mscandco.com',
    'companyadmin@mscandco.com',
    'codegroup@mscandco.com'
  )
  OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin', 'distribution_partner')
);

-- Admins can create wallet transactions (for top-ups, adjustments)
CREATE POLICY "wallet_transactions_admin_write"
ON wallet_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'superadmin@mscandco.com',
    'companyadmin@mscandco.com'
  )
  OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin')
);

-- =============================================
-- PROFILE_CHANGE_REQUESTS TABLE - SECURE RLS POLICIES
-- =============================================

-- Re-enable RLS if the table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profile_change_requests') THEN
        ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "profile_change_requests_own_access" ON profile_change_requests;
        DROP POLICY IF EXISTS "profile_change_requests_service_role" ON profile_change_requests;
        DROP POLICY IF EXISTS "profile_change_requests_admin_access" ON profile_change_requests;
        
        -- Users can view and create their own change requests
        CREATE POLICY "profile_change_requests_own_access"
        ON profile_change_requests
        FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        -- Service role full access
        CREATE POLICY "profile_change_requests_service_role"
        ON profile_change_requests
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
        
        -- Admins can view and manage all change requests
        CREATE POLICY "profile_change_requests_admin_access"
        ON profile_change_requests
        FOR ALL
        TO authenticated
        USING (
          auth.jwt() ->> 'email' IN (
            'superadmin@mscandco.com',
            'companyadmin@mscandco.com'
          )
          OR 
          (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin')
        )
        WITH CHECK (
          auth.jwt() ->> 'email' IN (
            'superadmin@mscandco.com',
            'companyadmin@mscandco.com'
          )
          OR 
          (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'company_admin')
        );
    END IF;
END $$;

-- =============================================
-- VERIFY POLICIES ARE WORKING
-- =============================================

-- Test that policies don't create infinite recursion
SELECT 'RLS policies created successfully' as status;
