-- PROPER RLS SETUP - This time it will work with the fixed API
-- Re-enable RLS with working policies

-- Clean slate
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_read_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "artists_read_policy" ON public.artists;
DROP POLICY IF EXISTS "artists_insert_policy" ON public.artists;
DROP POLICY IF EXISTS "artists_update_policy" ON public.artists;

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES policies (now will work with proper client)
CREATE POLICY "user_profiles_all_access" ON public.user_profiles
FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ARTISTS policies (now will work with proper client)
CREATE POLICY "artists_all_access" ON public.artists
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.artists TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

SELECT 'RLS properly configured with fixed API client' AS status;
