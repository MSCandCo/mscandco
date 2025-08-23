-- PROPER RLS SETUP FOR FRONTEND PROFILE CREATION
-- This enables RLS but allows authenticated users to manage their own data

-- Enable RLS on both tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "artists_select_own" ON public.artists;
DROP POLICY IF EXISTS "artists_insert_own" ON public.artists;
DROP POLICY IF EXISTS "artists_update_own" ON public.artists;

-- USER_PROFILES policies - allow users to manage their own profiles
CREATE POLICY "user_profiles_select_own" 
ON public.user_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own" 
ON public.user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" 
ON public.user_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- ARTISTS policies - allow users to manage their own artist profiles
CREATE POLICY "artists_select_own" 
ON public.artists FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "artists_insert_own" 
ON public.artists FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "artists_update_own" 
ON public.artists FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'artists');

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'artists');
