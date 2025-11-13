-- Fix RLS policies for releases table
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on releases table (if not already enabled)
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Artists can view their own releases" ON releases;
DROP POLICY IF EXISTS "Artists can create their own releases" ON releases;
DROP POLICY IF EXISTS "Artists can update their own releases" ON releases;
DROP POLICY IF EXISTS "Artists can delete their own draft releases" ON releases;
DROP POLICY IF EXISTS "Admins can view all releases" ON releases;
DROP POLICY IF EXISTS "Distribution partners can view all releases" ON releases;

-- 3. Create policy for artists to view their own releases
CREATE POLICY "Artists can view their own releases"
ON releases
FOR SELECT
TO authenticated
USING (
  artist_id = auth.uid()
  OR
  -- Allow admins and distribution partners to view all
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'company_admin', 'distribution_partner', 'labeladmin')
  )
);

-- 4. Create policy for artists to create their own releases
CREATE POLICY "Artists can create their own releases"
ON releases
FOR INSERT
TO authenticated
WITH CHECK (
  artist_id = auth.uid()
);

-- 5. Create policy for artists to update their own releases
CREATE POLICY "Artists can update their own releases"
ON releases
FOR UPDATE
TO authenticated
USING (
  artist_id = auth.uid()
  OR
  -- Allow admins and distribution partners to update all
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

-- 6. Create policy for artists to delete their own draft releases
CREATE POLICY "Artists can delete their own draft releases"
ON releases
FOR DELETE
TO authenticated
USING (
  artist_id = auth.uid()
  AND status = 'draft'
  OR
  -- Allow admins to delete any release
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'company_admin')
  )
);

-- 7. Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'releases'
ORDER BY policyname;

-- 8. Check if artist user has the correct artist_id
SELECT 
  id,
  email,
  role
FROM user_profiles
WHERE email = 'info@htay.co.uk';

-- 9. Check if there are any releases for this artist
SELECT 
  id,
  title,
  artist_id,
  status,
  created_at
FROM releases
WHERE artist_id = (
  SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk'
)
ORDER BY created_at DESC;

