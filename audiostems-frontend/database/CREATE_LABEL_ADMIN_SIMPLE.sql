-- Create label admin user: labeladmin@mscandco.com with password la@2025msC
-- Simple approach without ON CONFLICT

-- Check if user already exists
DO $$
DECLARE
    user_exists boolean;
    user_id_var uuid := 'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a'::uuid;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'labeladmin@mscandco.com') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Create the auth user
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            user_id_var,
            '00000000-0000-0000-0000-000000000000'::uuid,
            'labeladmin@mscandco.com',
            crypt('la@2025msC', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"role": "label_admin"}'::jsonb,
            'authenticated',
            'authenticated'
        );
        
        -- Create the user profile
        INSERT INTO public.user_profiles (
            id,
            email,
            first_name,
            last_name,
            artist_name,
            artist_type,
            is_basic_info_set,
            profile_completed,
            profile_lock_status,
            created_at,
            updated_at,
            registration_date
        ) VALUES (
            user_id_var,
            'labeladmin@mscandco.com',
            'Label',
            'Admin',
            'MSC & Co',
            'Solo Artist',
            true,
            true,
            'unlocked',
            NOW(),
            NOW(),
            NOW()
        );
        
        -- Assign label_admin role
        INSERT INTO public.user_role_assignments (user_id, role_name)
        VALUES (user_id_var, 'label_admin'::user_role_enum);
        
        RAISE NOTICE 'Label admin user created successfully!';
    ELSE
        RAISE NOTICE 'Label admin user already exists!';
    END IF;
END $$;

-- Verify the creation
SELECT 
    au.email,
    up.first_name,
    up.last_name,
    up.artist_name,
    ura.role_name,
    au.email_confirmed_at IS NOT NULL as email_verified
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
JOIN public.user_role_assignments ura ON au.id = ura.user_id
WHERE au.email = 'labeladmin@mscandco.com';
