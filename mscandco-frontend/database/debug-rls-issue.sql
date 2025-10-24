-- Debug RLS issue - Check current permissions and auth context

-- 1. Check table permissions
SELECT 
  'Table Permissions' as check_type,
  grantee, 
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'user_profiles' 
  AND grantee IN ('authenticated', 'service_role', 'anon', 'postgres')
ORDER BY grantee, privilege_type;

-- 2. Check RLS status
SELECT 
  'RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 3. Check current policies
SELECT 
  'Current Policies' as check_type,
  policyname, 
  cmd,
  roles::text,
  permissive
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 4. TEMPORARY: Disable RLS to test if the API works without it
-- This will help us isolate whether the issue is RLS or something else
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is now disabled
SELECT 
  'RLS Status After Disable' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- NOTE: After testing, we'll re-enable RLS and fix the auth context issue

