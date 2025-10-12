-- Fix infinite recursion in user_profiles RLS policies
-- This issue occurs when RLS policies reference the same table they're protecting

-- First, drop all existing policies to clear any recursive ones
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON user_profiles;

-- Temporarily disable RLS to clear any issues
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Users can view and edit their own profile based on auth.uid()
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view and edit all profiles (service role)
CREATE POLICY "Service role full access"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Company admins, super admins can view all profiles
CREATE POLICY "Admin users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' IN ('company_admin', 'super_admin', 'distribution_partner')
        OR auth.users.raw_app_meta_data->>'role' IN ('company_admin', 'super_admin', 'distribution_partner')
      )
    )
  );

-- Company admins, super admins can update all profiles
CREATE POLICY "Admin users can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' IN ('company_admin', 'super_admin', 'distribution_partner')
        OR auth.users.raw_app_meta_data->>'role' IN ('company_admin', 'super_admin', 'distribution_partner')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.raw_user_meta_data->>'role' IN ('company_admin', 'super_admin', 'distribution_partner')
        OR auth.users.raw_app_meta_data->>'role' IN ('company_admin', 'super_admin', 'distribution_partner')
      )
    )
  );

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
