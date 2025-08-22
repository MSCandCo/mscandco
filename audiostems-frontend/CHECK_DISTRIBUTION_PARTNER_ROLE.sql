-- Check if distribution_partner role exists and if CodeGroup has it assigned

-- 1. Check if distribution_partner exists in user_role_enum
SELECT unnest(enum_range(NULL::user_role_enum)) as available_roles;

-- 2. Check user_role_assignments for CodeGroup
SELECT 
    ura.user_id,
    ura.role,
    au.email,
    ura.created_at
FROM user_role_assignments ura
JOIN auth.users au ON ura.user_id = au.id
WHERE au.email = 'codegroup@mscandco.com';

-- 3. Check if CodeGroup user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'codegroup@mscandco.com';

-- 4. Check user_profiles for CodeGroup
SELECT 
    id,
    email,
    first_name,
    last_name,
    company_name,
    created_at
FROM user_profiles
WHERE email = 'codegroup@mscandco.com';
