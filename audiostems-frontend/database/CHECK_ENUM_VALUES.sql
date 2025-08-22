-- Check what enum values exist for user roles

SELECT 'Current enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'user_role_enum'
)
ORDER BY enumlabel;
