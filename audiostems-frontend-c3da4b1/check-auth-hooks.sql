-- =====================================================
-- CHECK FOR AUTH HOOKS AND EDGE FUNCTIONS
-- That might be interfering with user creation
-- =====================================================

-- Check for any auth hooks in the auth schema
SELECT 
    schemaname,
    tablename,
    triggername,
    tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth'
AND NOT tgisinternal;

-- Check for any functions in the auth schema
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth'
AND p.proname LIKE '%user%'
ORDER BY p.proname;

-- Check for any policies on auth.users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'auth' 
AND tablename = 'users';

SELECT 'Auth configuration check complete!' as status;
