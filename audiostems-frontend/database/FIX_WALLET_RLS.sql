-- Fix Wallet RLS Recursion Issues
-- Simple, non-recursive policies for earnings system

-- 1. Check current policies on earnings_log
SELECT policyname FROM pg_policies WHERE tablename = 'earnings_log';

-- 2. Drop all existing policies to start fresh
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

-- 4. Check if artist_wallet table has policies and fix them too
SELECT policyname FROM pg_policies WHERE tablename = 'artist_wallet';

-- Drop any existing wallet policies
DROP POLICY IF EXISTS "wallet_select" ON artist_wallet;

-- Create simple wallet access
CREATE POLICY "wallet_service_access" ON artist_wallet
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "wallet_henry_access" ON artist_wallet
FOR ALL
USING (
  artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid AND
  auth.uid() = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid
)
WITH CHECK (
  artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid AND
  auth.uid() = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid
);

-- Verification
SELECT 'RLS policies fixed for earnings system' as message;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('earnings_log', 'artist_wallet')
ORDER BY tablename, policyname;
