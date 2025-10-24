-- Check what permissions the 'authenticated' role actually has
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'user_profiles'
ORDER BY grantee, privilege_type;

-- Also check if 'authenticated' role exists and what it inherits
SELECT 
  rolname,
  rolsuper,
  rolinherit,
  rolcreaterole,
  rolcreatedb,
  rolcanlogin
FROM pg_roles
WHERE rolname IN ('authenticated', 'anon', 'service_role', 'postgres');

