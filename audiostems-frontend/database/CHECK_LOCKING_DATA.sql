-- Check what locking data exists in the database
SELECT 
    email,
    locked_fields,
    profile_lock_status,
    is_basic_info_set
FROM public.user_profiles 
WHERE email = 'info@htay.co.uk';

-- Also check if the columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('locked_fields', 'profile_lock_status');
