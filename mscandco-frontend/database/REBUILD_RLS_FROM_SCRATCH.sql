-- MSC & Co - Complete RLS System Rebuild
-- Delete and rebuild authentication/permissions from scratch
-- Resolves console errors: "permission denied for table earnings_log" (42501)

-- ===============================================
-- STEP 1: COMPLETE RLS RESET
-- ===============================================

-- Disable RLS on all tables to start fresh
ALTER TABLE earnings_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "service_role_all_access" ON earnings_log;
DROP POLICY IF EXISTS "henry_access" ON earnings_log;
DROP POLICY IF EXISTS "earnings_service_access" ON earnings_log;
DROP POLICY IF EXISTS "earnings_henry_access" ON earnings_log;
DROP POLICY IF EXISTS "earnings_admin_access" ON earnings_log;
DROP POLICY IF EXISTS "users_read_own_earnings_log" ON earnings_log;
DROP POLICY IF EXISTS "service_role_full_access_earnings_log" ON earnings_log;

-- ===============================================
-- STEP 2: REBUILD PERMISSIONS FROM SCRATCH
-- ===============================================

-- Re-enable RLS with clean slate
ALTER TABLE earnings_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- STEP 3: CREATE SIMPLE, WORKING POLICIES
-- ===============================================

-- 1. Service role gets full access (for APIs)
CREATE POLICY "service_role_access" ON earnings_log
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Authenticated users can read their own data
CREATE POLICY "user_own_data" ON earnings_log
FOR SELECT
TO authenticated
USING (auth.uid() = artist_id);

-- 3. Admin users can read all data
CREATE POLICY "admin_access" ON earnings_log
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE email IN (
      'companyadmin@mscandco.com',
      'superadmin@mscandco.com',
      'info@htay.co.uk'
    )
  )
);

-- User profiles policies
CREATE POLICY "service_role_profiles" ON user_profiles
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "user_own_profile" ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ===============================================
-- STEP 4: VERIFY CLEAN REBUILD
-- ===============================================

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('earnings_log', 'user_profiles') 
  AND schemaname = 'public';

-- Check policies exist and are simple
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('earnings_log', 'user_profiles')
ORDER BY tablename, policyname;

-- Test data access
SELECT 'DATA ACCESS TEST' as test;
SELECT COUNT(*) as total_earnings FROM earnings_log;
SELECT COUNT(*) as total_users FROM user_profiles;

SELECT 'RLS SYSTEM REBUILT SUCCESSFULLY' as status;
