-- Fix Registration Policies
-- Allow users to insert their own profiles during registration

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create policies for user_profiles table
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Drop existing policies for artists table if they exist
DROP POLICY IF EXISTS "Users can insert their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Users can read their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Users can update their own artist profile" ON public.artists;

-- Create policies for artists table
CREATE POLICY "Users can insert their own artist profile" ON public.artists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own artist profile" ON public.artists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist profile" ON public.artists
  FOR UPDATE USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

SELECT 'Registration policies created successfully!' as status;
