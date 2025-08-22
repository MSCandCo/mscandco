-- Check if the update_user_profile function exists

SELECT 'Function check:' as info;
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name = 'update_user_profile'
AND routine_schema = 'public';

-- Check function parameters
SELECT 'Function parameters:' as info;
SELECT 
    parameter_name,
    data_type,
    parameter_mode
FROM information_schema.parameters 
WHERE specific_name IN (
    SELECT specific_name 
    FROM information_schema.routines 
    WHERE routine_name = 'update_user_profile'
    AND routine_schema = 'public'
)
ORDER BY ordinal_position;
