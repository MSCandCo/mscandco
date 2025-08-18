-- =====================================================
-- DISABLE THE HANDLE_NEW_USER FUNCTION
-- This is likely causing the Auth failure
-- =====================================================

-- First, let's see what this function does
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'handle_new_user';

-- Drop the function temporarily to test
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Also check for any triggers on auth.users that might be calling this
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth'
AND c.relname = 'users'
AND NOT t.tgisinternal;

-- Drop any triggers on auth.users that might be calling handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;

SELECT 'handle_new_user function and related triggers disabled!' as status;
