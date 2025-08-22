-- Check the actual table structure and CodeGroup assignment

-- 1. Check user_role_assignments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_role_assignments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show all data in user_role_assignments table
SELECT * FROM user_role_assignments;

-- 3. Check if CodeGroup user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'codegroup@mscandco.com';
