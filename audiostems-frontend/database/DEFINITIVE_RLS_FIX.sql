-- DEFINITIVE RLS FIX - Run this to fix registration forever
-- This addresses the core issue: RLS policies need to allow new user creation

-- First, ensure we can work with the tables
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Allow authenticated users to read their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Allow authenticated users to update their own artist profile" ON public.artists;

-- Enable RLS on both tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES POLICIES - Fixed to work with registration
-- Policy for reading own profile
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Policy for inserting own profile (CRITICAL for registration)
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy for updating own profile
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ARTISTS POLICIES - Fixed to work with registration
-- Policy for reading own artist profile
CREATE POLICY "artists_select_own" ON public.artists
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy for inserting own artist profile (CRITICAL for registration)
CREATE POLICY "artists_insert_own" ON public.artists
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for updating own artist profile
CREATE POLICY "artists_update_own" ON public.artists
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.artists TO authenticated;

-- Ensure sequences work
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the setup
SELECT 'RLS policies successfully configured for user_profiles and artists' AS status;
