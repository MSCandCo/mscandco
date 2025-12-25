-- Grant table-level permissions to authenticated role
-- This MUST be done before RLS policies will work

-- First, ensure the authenticated role can use the public schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant ALL permissions on user_profiles to authenticated users
GRANT ALL ON user_profiles TO authenticated;

-- Also grant to anon (for public access if needed)
GRANT SELECT ON user_profiles TO anon;

-- Verify the grants were applied
SELECT 
  'Grants after applying' as status,
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'user_profiles'
ORDER BY grantee, privilege_type;

