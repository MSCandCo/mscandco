-- COMPLETE RLS REBUILD - Permanent Solution
-- This script completely rebuilds the user_profiles RLS policies from scratch
-- No patching - clean permanent solution

-- STEP 1: Disable RLS temporarily to clear everything
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies completely
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies for user_profiles table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON user_profiles';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- STEP 3: Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create clean, simple, permanent policies
-- These policies are designed to never cause recursion

-- Policy 1: Users can view and update their own profile
CREATE POLICY "user_profiles_own_access" ON user_profiles 
FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Policy 2: Service role can do everything (for admin APIs)
CREATE POLICY "user_profiles_service_role_access" ON user_profiles 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Policy 3: Specific admin users can access everything (no subquery to avoid recursion)
CREATE POLICY "user_profiles_admin_access" ON user_profiles 
FOR ALL 
USING (
    auth.uid() = id OR 
    auth.uid() = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid OR  -- Henry Taylor
    auth.email() = 'info@htay.co.uk' OR
    auth.email() = 'superadmin@mscandco.com' OR
    auth.email() = 'companyadmin@mscandco.com'
) 
WITH CHECK (
    auth.uid() = id OR 
    auth.uid() = '0a060de5-1c94-4060-a1c2-860224fc348d'::uuid OR  -- Henry Taylor
    auth.email() = 'info@htay.co.uk' OR
    auth.email() = 'superadmin@mscandco.com' OR
    auth.email() = 'companyadmin@mscandco.com'
);

-- STEP 5: Verify the rebuild
SELECT 'RLS policies rebuilt successfully' as status;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;