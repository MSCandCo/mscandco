-- 🚨 COMPLETE REGISTRATION FIX
-- This script fixes BOTH the missing columns AND RLS policy issues

-- STEP 1: Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- Add street_address if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS street_address TEXT;

-- STEP 2: Fix RLS policies for user registration

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

-- Fix artists table policies
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

-- STEP 3: Ensure RLS is enabled and grant permissions
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON artists TO authenticated;
GRANT USAGE ON SEQUENCE user_profiles_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE artists_id_seq TO authenticated;

-- Add comments for clarity
COMMENT ON COLUMN public.user_profiles.country_code IS 'International phone country code (e.g., +44, +1)';
COMMENT ON COLUMN public.user_profiles.phone_number IS 'User phone number without country code';
COMMENT ON COLUMN public.user_profiles.postal_code IS 'Postal code, zip code, or postcode depending on country';
COMMENT ON COLUMN public.user_profiles.country IS 'User country of residence';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- ✅ REGISTRATION SHOULD NOW WORK!
