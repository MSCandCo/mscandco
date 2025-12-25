-- Fix RLS policies for user_profiles table - Version 2
-- This ensures users can update their own profiles

-- First, let's check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_authenticated_read" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_can_view_profiles" ON user_profiles;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for authenticated users
-- Policy 1: Allow users to SELECT their own profile
CREATE POLICY "user_profiles_select_own"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Allow users to UPDATE their own profile
CREATE POLICY "user_profiles_update_own"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to INSERT their own profile
CREATE POLICY "user_profiles_insert_own"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow users to DELETE their own profile (optional, but good to have)
CREATE POLICY "user_profiles_delete_own"
ON user_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Verify the policies were created
SELECT 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd as operation,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Test: Check if the current user can see their profile
-- (Run this after the policies are created)
-- SELECT * FROM user_profiles WHERE id = auth.uid();

