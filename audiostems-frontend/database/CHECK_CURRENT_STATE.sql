-- Check current state after running scripts

SELECT 'All users in auth.users:' as info;
SELECT id, email FROM auth.users ORDER BY email;

SELECT 'All profiles:' as info;
SELECT id, email, first_name, last_name, artist_name FROM public.user_profiles ORDER BY email;

SELECT 'All role assignments:' as info;
SELECT 
    au.email,
    ura.role_name
FROM auth.users au
LEFT JOIN public.user_role_assignments ura ON au.id = ura.user_id
ORDER BY au.email;
