-- ========================================
-- SIMPLE PERMANENT SOLUTION
-- Works with standard Supabase plans - no custom hooks needed
-- ========================================

-- Step 1: Drop all existing problematic policies
DROP POLICY IF EXISTS "user_profiles_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Step 2: Create simple, working RLS policies
-- Users can view their own profile
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Step 3: Ensure proper permissions
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 4: Create function to handle new users (simplified)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into user_profiles with basic info
  INSERT INTO public.user_profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::platform_user_role, 'artist'),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$;

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Ensure existing users have profiles
INSERT INTO user_profiles (id, email, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE((raw_user_meta_data->>'role')::platform_user_role, 'artist'),
  created_at,
  updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Step 7: Verify the setup
SELECT 'Simple permanent solution implemented' AS status;

-- Show current policies
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Test current user access
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid()) 
    THEN 'SUCCESS: User can access their profile'
    ELSE 'INFO: No current user session'
  END AS access_test;
