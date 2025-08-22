-- Fix the enum and create missing users

-- 1. Add missing distribution_partner to enum
ALTER TYPE user_role_enum ADD VALUE 'distribution_partner';

-- 2. Create distribution partner user if not exists
DO $$
DECLARE
    distribution_partner_user_id UUID;
    company_admin_user_id UUID;
    super_admin_user_id UUID;
BEGIN
    -- Create distribution partner user
    SELECT id INTO distribution_partner_user_id FROM auth.users WHERE email = 'codegroup@mscandco.com';
    IF distribution_partner_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
            'authenticated', 'authenticated', 'codegroup@mscandco.com',
            crypt('C0d3gr0up', gen_salt('bf')),
            NOW(), NOW(), NOW(), '', '', '', ''
        ) RETURNING id INTO distribution_partner_user_id;
        
        RAISE NOTICE 'Created distribution partner user: %', distribution_partner_user_id;
    END IF;
    
    -- Create profile for distribution partner
    INSERT INTO public.user_profiles (
        id, email, first_name, last_name, artist_name, country,
        created_at, updated_at, registration_date
    ) VALUES (
        distribution_partner_user_id, 'codegroup@mscandco.com', 'Code', 'Group', 'CodeGroup Distribution', 'United Kingdom',
        NOW(), NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        first_name = 'Code',
        last_name = 'Group',
        artist_name = 'CodeGroup Distribution',
        updated_at = NOW();
    
    -- Assign distribution partner role
    INSERT INTO public.user_role_assignments (user_id, role_name, assigned_at, assigned_by)
    VALUES (distribution_partner_user_id, 'distribution_partner', NOW(), distribution_partner_user_id)
    ON CONFLICT (user_id, role_name) DO NOTHING;

    -- Fix company admin role
    SELECT id INTO company_admin_user_id FROM auth.users WHERE email = 'companyadmin@mscandco.com';
    IF company_admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_role_assignments (user_id, role_name, assigned_at, assigned_by)
        VALUES (company_admin_user_id, 'company_admin', NOW(), company_admin_user_id)
        ON CONFLICT (user_id, role_name) DO NOTHING;
        
        RAISE NOTICE 'Assigned company_admin role to: companyadmin@mscandco.com';
    END IF;

    -- Fix super admin role  
    SELECT id INTO super_admin_user_id FROM auth.users WHERE email = 'superadmin@mscandco.com';
    IF super_admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_role_assignments (user_id, role_name, assigned_at, assigned_by)
        VALUES (super_admin_user_id, 'super_admin', NOW(), super_admin_user_id)
        ON CONFLICT (user_id, role_name) DO NOTHING;
        
        RAISE NOTICE 'Assigned super_admin role to: superadmin@mscandco.com';
    END IF;

END $$;

-- 3. Verify all users now have roles
SELECT 'All users with roles:' as status;
SELECT 
    au.email,
    ura.role_name,
    up.first_name,
    up.last_name,
    up.artist_name
FROM auth.users au
LEFT JOIN public.user_role_assignments ura ON au.id = ura.user_id
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email IN (
    'info@htay.co.uk',
    'labeladmin@mscandco.com', 
    'codegroup@mscandco.com',
    'companyadmin@mscandco.com',
    'superadmin@mscandco.com'
)
ORDER BY au.email;
