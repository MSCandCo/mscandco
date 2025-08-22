-- CORRECTED: Check and fix distribution_partner role setup

-- 1. Check available roles in enum
SELECT unnest(enum_range(NULL::user_role_enum)) as available_roles;

-- 2. Check user_role_assignments table structure first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_role_assignments' 
AND table_schema = 'public';

-- 3. Check CodeGroup's role assignment (using correct column name)
SELECT 
    ura.user_id,
    ura.role_name,  -- Using role_name instead of role
    au.email,
    ura.created_at
FROM user_role_assignments ura
JOIN auth.users au ON ura.user_id = au.id
WHERE au.email = 'codegroup@mscandco.com';

-- 4. If distribution_partner is missing from enum, add it
DO $$
BEGIN
    -- Check if distribution_partner exists in enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'distribution_partner' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        -- Add distribution_partner to enum
        ALTER TYPE user_role_enum ADD VALUE 'distribution_partner';
        RAISE NOTICE 'Added distribution_partner to user_role_enum';
    ELSE
        RAISE NOTICE 'distribution_partner already exists in enum';
    END IF;
END $$;

-- 5. Ensure CodeGroup user exists and has distribution_partner role
DO $$
DECLARE
    codegroup_user_id UUID;
BEGIN
    -- Get CodeGroup user ID
    SELECT id INTO codegroup_user_id 
    FROM auth.users 
    WHERE email = 'codegroup@mscandco.com';
    
    IF codegroup_user_id IS NULL THEN
        RAISE NOTICE 'CodeGroup user does not exist - needs to be created';
    ELSE
        -- Remove any existing role assignments for CodeGroup
        DELETE FROM user_role_assignments 
        WHERE user_id = codegroup_user_id;
        
        -- Assign distribution_partner role
        INSERT INTO user_role_assignments (user_id, role_name, created_at)
        VALUES (codegroup_user_id, 'distribution_partner', NOW());
        
        RAISE NOTICE 'Assigned distribution_partner role to CodeGroup user: %', codegroup_user_id;
    END IF;
END $$;

-- 6. Verify the assignment worked
SELECT 
    ura.user_id,
    ura.role_name,
    au.email,
    ura.created_at
FROM user_role_assignments ura
JOIN auth.users au ON ura.user_id = au.id
WHERE au.email = 'codegroup@mscandco.com';
