-- View the user_role_enum type and its values

-- 1. Show all enum values in user_role_enum
SELECT unnest(enum_range(NULL::user_role_enum)) as enum_values;

-- 2. Show detailed information about the enum type
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'user_role_enum'
ORDER BY e.enumsortorder;

-- 3. Show which tables use this enum
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE udt_name = 'user_role_enum';
