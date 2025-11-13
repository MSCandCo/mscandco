-- Check if there are validation constraints on analytics_data column
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'user_profiles' 
    AND n.nspname = 'public'
    AND contype = 'c';
