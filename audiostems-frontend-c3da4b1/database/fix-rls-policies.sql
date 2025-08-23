-- Fix RLS policies for user registration
-- This allows users to create and manage their own profiles

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- Create comprehensive RLS policies for user_profiles
CREATE POLICY "Enable insert for authenticated users only" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Also fix artists table policies
DROP POLICY IF EXISTS "Users can insert own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can view own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can update own artist profile" ON artists;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON artists;
DROP POLICY IF EXISTS "Enable read access for own artist profile" ON artists;
DROP POLICY IF EXISTS "Enable update for own artist profile" ON artists;

CREATE POLICY "Enable insert for authenticated users only" ON artists
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own artist profile" ON artists
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own artist profile" ON artists
FOR UPDATE USING (auth.uid() = user_id);

-- Ensure RLS is enabled on both tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON artists TO authenticated;
GRANT USAGE ON SEQUENCE user_profiles_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE artists_id_seq TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
