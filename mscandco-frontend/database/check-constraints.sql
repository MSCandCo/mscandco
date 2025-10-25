-- CHECK WHAT CONSTRAINTS EXIST ON affiliation_requests

SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'affiliation_requests'::regclass
ORDER BY conname;

