-- Check if the profile data was actually saved

SELECT 'Profile data in database:' as info;
SELECT first_name, last_name, artist_name, updated_at
FROM public.user_profiles 
WHERE email = 'labeladmin@mscandco.com';
