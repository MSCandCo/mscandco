-- Add RLS Policies for Service Role Access
-- Run this in Supabase SQL Editor

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can access all" ON user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role (for API access)
CREATE POLICY "Service role can access all" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Allow admins to view all
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role IN ('company_admin', 'super_admin')
    )
  );

-- Add policies for other tables
CREATE POLICY "Service role releases access" ON releases
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role subscriptions access" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role artist_requests access" ON artist_requests
  FOR ALL USING (auth.role() = 'service_role');
