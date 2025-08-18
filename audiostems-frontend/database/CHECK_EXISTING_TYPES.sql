-- Check what types already exist in the database
SELECT typname, typnamespace::regnamespace as schema_name 
FROM pg_type 
WHERE typname LIKE '%role%' OR typname LIKE '%user%'
ORDER BY schema_name, typname;

-- Check all custom types
SELECT typname, typnamespace::regnamespace as schema_name 
FROM pg_type 
WHERE typnamespace::regnamespace::text = 'public'
ORDER BY typname;
