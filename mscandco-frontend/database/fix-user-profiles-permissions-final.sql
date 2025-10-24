-- Comprehensive fix for user_profiles permissions
-- This grants table-level permissions AND sets up RLS policies

-- Step 1: Grant table-level permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 2: Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_authenticated_read" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_can_view_profiles" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON user_profiles;
DROP POLICY IF EXISTS "service_role_all_access" ON user_profiles;

-- Step 3: Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new, comprehensive policies
CREATE POLICY "Enable read access for authenticated users to own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable insert access for authenticated users to own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for authenticated users to own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete access for authenticated users to own profile"
ON user_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Step 5: Also allow service_role full access (for admin operations)
CREATE POLICY "Service role has full access"
ON user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify the setup
SELECT 'Table-level permissions:' as info;
SELECT 
  grantee, 
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'user_profiles' 
  AND grantee IN ('authenticated', 'service_role', 'anon')
ORDER BY grantee, privilege_type;

SELECT '' as spacer;
SELECT 'RLS Status:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

SELECT '' as spacer;
SELECT 'RLS Policies:' as info;
SELECT 
  policyname, 
  cmd as operation,
  roles,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

