-- FINAL EARNINGS RLS FIX
-- Grant service role direct access to bypass RLS entirely

-- Method 1: Check if service role has table permissions
-- First, let's ensure the service role has the necessary grants
GRANT ALL ON earnings_log TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Method 2: Temporarily disable RLS for testing
ALTER TABLE earnings_log DISABLE ROW LEVEL SECURITY;

-- Method 3: If we need RLS, let's create a bulletproof service role policy
-- Re-enable RLS
ALTER TABLE earnings_log ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies and create only what we need
DROP POLICY IF EXISTS "earnings_service_access" ON earnings_log;
DROP POLICY IF EXISTS "earnings_henry_access" ON earnings_log;  
DROP POLICY IF EXISTS "earnings_admin_access" ON earnings_log;

-- Simple service role policy that always returns true
CREATE POLICY "service_role_all_access" ON earnings_log
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Simple policy for Henry Taylor (authenticated user)
CREATE POLICY "henry_access" ON earnings_log  
FOR SELECT
USING (
  artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid
);

-- Test the setup
SELECT 'Fixed earnings_log access for service role' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'earnings_log';
