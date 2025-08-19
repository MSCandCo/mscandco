-- Check what user types and roles exist in the system

SELECT 'All user roles:' as info;
SELECT DISTINCT role_name, COUNT(*) as count
FROM public.user_role_assignments
GROUP BY role_name
ORDER BY role_name;

SELECT 'All users with their roles:' as info;
SELECT au.email, ura.role_name, up.first_name, up.last_name, up.artist_name
FROM auth.users au
LEFT JOIN public.user_role_assignments ura ON au.id = ura.user_id
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.email;
