-- ============================================================================
-- FIX: revenue_splits table RLS permissions
-- ============================================================================
-- This script fixes RLS policies to allow service role access
-- Run this if you're getting "permission denied for table revenue_splits"
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "revenue_splits_service_role_access" ON revenue_splits;
DROP POLICY IF EXISTS "revenue_splits_admin_read" ON revenue_splits;
DROP POLICY IF EXISTS "revenue_splits_admin_write" ON revenue_splits;
DROP POLICY IF EXISTS "revenue_splits_admin_insert" ON revenue_splits;
DROP POLICY IF EXISTS "revenue_splits_admin_update" ON revenue_splits;
DROP POLICY IF EXISTS "revenue_splits_admin_delete" ON revenue_splits;
DROP POLICY IF EXISTS "revenue_splits_artist_read" ON revenue_splits;
DROP POLICY IF EXISTS "revenue_splits_label_read" ON revenue_splits;
DROP POLICY IF EXISTS "revenue_splits_admin_all" ON revenue_splits;

-- Grant explicit permissions to service_role (bypasses RLS)
GRANT ALL ON revenue_splits TO service_role;
GRANT ALL ON revenue_splits TO authenticated;
GRANT ALL ON revenue_splits TO anon;

-- IMPORTANT: Service role bypasses RLS automatically, but we need policies for authenticated users
-- The API uses service role key (supabaseAdmin), so it should bypass RLS
-- However, if RLS is enabled, we need at least one policy for the table to work

-- Allow all operations for authenticated admins (super_admin, company_admin, label_admin)
CREATE POLICY "revenue_splits_admin_all" ON revenue_splits
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
);

-- Allow artists to read their own splits
CREATE POLICY "revenue_splits_artist_read" ON revenue_splits
FOR SELECT
TO authenticated
USING (
  auth.uid() = artist_id OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
);

-- Allow label admins to read their own splits
CREATE POLICY "revenue_splits_label_read" ON revenue_splits
FOR SELECT
TO authenticated
USING (
  auth.uid() = label_admin_id OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
  )
);

-- Note: Service role (used by API with SUPABASE_SERVICE_ROLE_KEY) automatically bypasses RLS
-- If you're still getting permission errors, check:
-- 1. The API is using supabaseAdmin (service role client), not regular supabase client
-- 2. SUPABASE_SERVICE_ROLE_KEY is set correctly in environment variables
-- 3. The service role key has not expired or been rotated

SELECT '✅ RLS policies updated and permissions granted for revenue_splits table' as status;

