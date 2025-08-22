-- Simple check to understand the actual table structure

-- 1. Check what columns exist in user_role_assignments table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_role_assignments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check what's actually in the table (first few rows)
SELECT * FROM user_role_assignments LIMIT 5;

-- 3. Check if CodeGroup user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'codegroup@mscandco.com';

-- 4. Check available enum values
SELECT unnest(enum_range(NULL::user_role_enum)) as available_roles;
