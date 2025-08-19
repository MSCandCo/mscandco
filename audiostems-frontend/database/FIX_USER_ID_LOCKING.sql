-- Fix the locking data for the correct user ID format

-- First, let's see what user IDs actually exist
SELECT id, email FROM auth.users WHERE email = 'info@htay.co.uk';

-- Update the locking for your actual user ID (using email to find the right UUID)
UPDATE public.user_profiles 
SET 
    locked_fields = '{"firstName": true, "lastName": true, "dateOfBirth": true, "nationality": true, "country": true, "city": true}',
    profile_lock_status = 'locked',
    is_basic_info_set = true
WHERE email = 'info@htay.co.uk';

-- Also update if the ID is the string format
UPDATE public.user_profiles 
SET 
    locked_fields = '{"firstName": true, "lastName": true, "dateOfBirth": true, "nationality": true, "country": true, "city": true}',
    profile_lock_status = 'locked',
    is_basic_info_set = true
WHERE id::text = 'info_at_htay_dot_co.uk';

-- Verify the update worked
SELECT 
    id,
    email,
    locked_fields,
    profile_lock_status,
    is_basic_info_set
FROM public.user_profiles 
WHERE email = 'info@htay.co.uk';
