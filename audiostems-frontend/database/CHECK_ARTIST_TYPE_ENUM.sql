-- Check what values are allowed in artist_type_enum

SELECT 'Artist type enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'artist_type_enum'
)
ORDER BY enumlabel;
