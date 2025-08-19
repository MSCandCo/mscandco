-- Check exactly what's in your profile row
SELECT 
    email,
    first_name,
    locked_fields,
    profile_lock_status,
    is_basic_info_set
FROM public.user_profiles 
WHERE email = 'info@htay.co.uk'
OR id = 'info_at_htay_dot_co.uk';
