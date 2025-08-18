-- 🚨 CORRECTED REGISTRATION FIX
-- Fixed to use the correct column names (id instead of user_id)

-- STEP 1: Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- STEP 2: Fix RLS policies using the correct column name (id, not user_id)

-- First, disable RLS temporarily to clean up
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE artists DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON user_profiles;

-- Artists table policies
DROP POLICY IF EXISTS "Users can insert own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can view own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can update own artist profile" ON artists;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON artists;
DROP POLICY IF EXISTS "Enable read access for own artist profile" ON artists;
DROP POLICY IF EXISTS "Enable update for own artist profile" ON artists;

-- Create simple, permissive policies for authenticated users
CREATE POLICY "Allow authenticated users full access" ON user_profiles
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access" ON artists  
FOR ALL USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Grant all necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON artists TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ✅ This should fix the registration issue by allowing authenticated users full access
