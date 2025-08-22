-- Fix CodeGroup to only have distribution_partner role

-- Remove the incorrect artist role from CodeGroup
DELETE FROM public.user_role_assignments 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'codegroup@mscandco.com')
AND role_name = 'artist';

-- Verify CodeGroup now only has distribution_partner role
SELECT 'CodeGroup roles after fix:' as status;
SELECT 
    au.email,
    ura.role_name,
    up.first_name,
    up.last_name,
    up.artist_name
FROM auth.users au
JOIN public.user_role_assignments ura ON au.id = ura.user_id
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'codegroup@mscandco.com'
ORDER BY ura.role_name;
