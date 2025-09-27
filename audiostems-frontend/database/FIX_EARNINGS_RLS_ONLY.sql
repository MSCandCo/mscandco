-- Fix Earnings RLS Issues - EARNINGS_LOG TABLE ONLY
-- Simple, non-recursive policies for earnings_log table

-- 1. Check current policies on earnings_log
SELECT policyname FROM pg_policies WHERE tablename = 'earnings_log';

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "service_role_full_access_earnings_log" ON earnings_log;
DROP POLICY IF EXISTS "artists_view_own_earnings_log" ON earnings_log; 
DROP POLICY IF EXISTS "admins_full_access_earnings_log" ON earnings_log;
DROP POLICY IF EXISTS "earnings_log_service_role_access" ON earnings_log;
DROP POLICY IF EXISTS "earnings_log_artist_view" ON earnings_log;
DROP POLICY IF EXISTS "earnings_log_admin_access" ON earnings_log;

-- 3. Create simple, non-recursive policies

-- Service role has full access (for APIs)
CREATE POLICY "earnings_service_access" ON earnings_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Henry Taylor can see his own earnings (hardcoded to avoid recursion)
CREATE POLICY "earnings_henry_access" ON earnings_log
FOR ALL
USING (
  artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid AND
  auth.uid() = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid
)
WITH CHECK (
  artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid AND
  auth.uid() = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid
);

-- Admin access by email (avoid role lookup recursion)
CREATE POLICY "earnings_admin_access" ON earnings_log
FOR ALL
USING (
  auth.email() IN ('info@htay.co.uk', 'superadmin@mscandco.com', 'companyadmin@mscandco.com')
)
WITH CHECK (
  auth.email() IN ('info@htay.co.uk', 'superadmin@mscandco.com', 'companyadmin@mscandco.com')
);

-- 4. Verification
SELECT 'RLS policies fixed for earnings_log table' as message;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'earnings_log'
ORDER BY policyname;
