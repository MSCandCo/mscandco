-- Check what's actually in the database for your profile
SELECT 
    first_name,
    last_name, 
    artist_name,
    short_bio,
    bio,
    updated_at
FROM public.user_profiles 
WHERE email = 'info@htay.co.uk';
