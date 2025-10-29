-- Fix RLS policies for user registration
-- Run this in Supabase SQL Editor

-- The trigger needs permission to INSERT into user_profiles
-- This is likely being blocked by RLS

-- 1. Check current RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';

-- 2. Temporarily disable RLS to test (ONLY FOR DEBUGGING)
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Better solution: Add a policy that allows the trigger to insert
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow registration to create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON user_profiles;

-- 4. Create a policy that allows INSERT during registration
-- This policy allows INSERT when the auth.uid() matches the id being inserted
CREATE POLICY "Allow user profile creation during registration" ON user_profiles
FOR INSERT WITH CHECK (
  -- Allow if the user is inserting their own profile
  auth.uid() = id
  OR
  -- Allow if called by service role (trigger uses SECURITY DEFINER)
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  OR
  -- Allow if no user is authenticated yet (during registration trigger)
  auth.uid() IS NULL
);

-- 5. Ensure SELECT policy exists for users to read their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
FOR SELECT USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'company_admin')
  )
);

-- 6. Ensure UPDATE policy exists
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 7. Verify RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Grant necessary permissions to service role
GRANT ALL ON public.user_profiles TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 9. Update the trigger function to use service role explicitly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- This makes the function run with the privileges of the creator (postgres)
SET search_path = public
AS $$
BEGIN
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'artist'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the registration
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 11. Verify the trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

COMMENT ON POLICY "Allow user profile creation during registration" ON user_profiles IS 'Allows profile creation during signup via trigger';
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user_profiles entry automatically when new user signs up - runs with elevated privileges';

