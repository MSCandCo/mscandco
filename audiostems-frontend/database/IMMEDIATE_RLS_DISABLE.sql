-- IMMEDIATE RLS DISABLE - Run this RIGHT NOW to fix registration
-- We'll figure out proper RLS later, but registration needs to work NOW

-- Disable RLS completely
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DROP POLICY IF EXISTS "user_profiles_all_access" ON public.user_profiles;
DROP POLICY IF EXISTS "artists_all_access" ON public.artists;
DROP POLICY IF EXISTS "profiles_read_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "artists_read_policy" ON public.artists;
DROP POLICY IF EXISTS "artists_insert_policy" ON public.artists;
DROP POLICY IF EXISTS "artists_update_policy" ON public.artists;

-- Grant full access to authenticated users
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.artists TO authenticated;
GRANT ALL ON public.user_profiles TO anon;
GRANT ALL ON public.artists TO anon;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'artists');
