-- Re-enable RLS now that table permissions are fixed
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Verify policies still exist
SELECT 
  policyname, 
  cmd as operation,
  roles::text
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

