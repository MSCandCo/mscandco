-- WORKING RLS POLICIES - These will actually work with frontend registration
-- This allows authenticated users to manage their own data

-- Clean slate first
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "user_profiles_all_access" ON public.user_profiles;
DROP POLICY IF EXISTS "artists_all_access" ON public.artists;
DROP POLICY IF EXISTS "profiles_read_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "artists_read_policy" ON public.artists;
DROP POLICY IF EXISTS "artists_insert_policy" ON public.artists;
DROP POLICY IF EXISTS "artists_update_policy" ON public.artists;

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES: Allow authenticated users to manage their own profile
CREATE POLICY "authenticated_users_own_profile"
ON public.user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ARTISTS: Allow authenticated users to manage their own artist profile
CREATE POLICY "authenticated_users_own_artist"
ON public.artists
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.artists TO authenticated;
GRANT USAGE ON SEQUENCE artists_id_seq TO authenticated;

-- Verify the policies are working
SELECT schemaname, tablename, rowsecurity, policies
FROM (
  SELECT schemaname, tablename, rowsecurity, 
         ARRAY_AGG(policyname) as policies
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename 
  WHERE t.tablename IN ('user_profiles', 'artists')
  GROUP BY schemaname, t.tablename, rowsecurity
) sub;
