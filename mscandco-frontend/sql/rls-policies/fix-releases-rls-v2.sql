-- Fix RLS policies for releases table (Version 2)
-- This version ensures the policies work correctly with authenticated users

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Artists can view their own releases" ON releases;
DROP POLICY IF EXISTS "Artists can create their own releases" ON releases;
DROP POLICY IF EXISTS "Artists can update their own releases" ON releases;
DROP POLICY IF EXISTS "Artists can delete their own draft releases" ON releases;
DROP POLICY IF EXISTS "Admins can view all releases" ON releases;
DROP POLICY IF EXISTS "Service role can do anything" ON releases;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON releases;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON releases;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON releases;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON releases;

-- 2. Make sure RLS is enabled
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- 3. Create comprehensive policies

-- SELECT: Artists can view their own releases, admins can view all
CREATE POLICY "Enable read access for authenticated users"
ON releases
FOR SELECT
TO authenticated
USING (
  -- User's own releases
  artist_id = auth.uid()
  OR
  -- OR user is an admin/distribution partner
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'company_admin', 'distribution_partner', 'labeladmin', 'analytics_admin', 'requests_admin')
  )
);

-- INSERT: Artists can create releases for themselves
CREATE POLICY "Enable insert for authenticated users"
ON releases
FOR INSERT
TO authenticated
WITH CHECK (
  -- Can only create releases where artist_id matches their own ID
  artist_id = auth.uid()
  OR
  -- OR user is an admin
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'company_admin', 'distribution_partner')
  )
);

-- UPDATE: Artists can update their own releases, admins can update all
CREATE POLICY "Enable update for authenticated users"
ON releases
FOR UPDATE
TO authenticated
USING (
  artist_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'company_admin', 'distribution_partner', 'labeladmin')
  )
)
WITH CHECK (
  artist_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'company_admin', 'distribution_partner', 'labeladmin')
  )
);

-- DELETE: Artists can delete their own draft releases, admins can delete any
CREATE POLICY "Enable delete for authenticated users"
ON releases
FOR DELETE
TO authenticated
USING (
  (artist_id = auth.uid() AND status = 'draft')
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'company_admin')
  )
);

-- 4. Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'releases'
ORDER BY cmd, policyname;

-- 5. Test query (this should work for the artist)
-- Note: This will only work if you run it as the authenticated user
-- SELECT * FROM releases WHERE artist_id = auth.uid();

