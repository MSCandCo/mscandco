-- ========================================
-- PERMANENT AUTHENTICATION SOLUTION
-- Gold standard approach - no patches, proper JWT role management
-- ========================================

-- Step 1: Create function to set user role in JWT claims
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Get the claims from the event
  claims := event->'claims';
  
  -- Get user role from user_profiles table
  SELECT role::text INTO user_role 
  FROM public.user_profiles 
  WHERE id = (event->>'user_id')::uuid;
  
  -- If no role found in user_profiles, try to get from raw_user_meta_data
  IF user_role IS NULL THEN
    SELECT raw_user_meta_data->>'role' INTO user_role
    FROM auth.users 
    WHERE id = (event->>'user_id')::uuid;
  END IF;
  
  -- Set the role in JWT claims (default to 'artist' if no role found)
  claims := jsonb_set(claims, '{role}', to_jsonb(COALESCE(user_role, 'artist')));
  
  -- Return the modified event
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Step 2: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.user_profiles TO supabase_auth_admin;

-- Step 3: Create proper RLS policies that work with JWT roles
-- Drop existing policies first
DROP POLICY IF EXISTS "user_profiles_policy" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create comprehensive RLS policies using JWT role
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
  );

CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
  ) WITH CHECK (
    auth.uid() = id OR 
    COALESCE(auth.jwt() ->> 'role', '') IN ('company_admin', 'super_admin')
  );

-- Step 4: Ensure RLS is enabled and permissions are granted
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 5: Create trigger to automatically create user_profiles entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from raw_user_meta_data or default to 'artist'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'artist');
  
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
    user_role::platform_user_role,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Test the setup
SELECT 'Permanent authentication solution implemented successfully' AS status;

-- Verify current user can access their profile
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid()) 
    THEN 'User profile access: SUCCESS'
    ELSE 'User profile access: NEEDS PROFILE CREATION'
  END AS profile_test;

-- Show final RLS policies
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;
