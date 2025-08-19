-- CLEAN REBUILD OF AUTHENTICATION AND ROLE SYSTEM
-- This replaces all the patched solutions with a proper implementation

-- Step 1: Clean up existing problematic policies and functions
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Label admins can manage all profiles" ON public.user_profiles;
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- Step 2: Create proper get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(input_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role_name INTO user_role
    FROM public.user_role_assignments
    WHERE user_id = input_user_id
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'user');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'user';
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO service_role;

-- Step 3: Create proper RLS policies for user_profiles
CREATE POLICY "Enable read access for users on own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Enable update for users on own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Enable insert for users on own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable all access for label admins"
ON public.user_profiles FOR ALL
USING (public.get_user_role(auth.uid()) = 'label_admin');

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create/update the label admin user properly
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'labeladmin@mscandco.com';
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;
    
    -- If user doesn't exist, create them
    IF admin_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt('labeladmin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
    END IF;
    
    -- Create/update profile
    INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        artist_name,
        country,
        created_at,
        updated_at,
        registration_date
    ) VALUES (
        admin_user_id,
        admin_email,
        'Label',
        'Admin',
        'MSC & Co',
        'United Kingdom',
        NOW(),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        artist_name = EXCLUDED.artist_name,
        country = EXCLUDED.country,
        updated_at = NOW();
    
    -- Assign role
    INSERT INTO public.user_role_assignments (user_id, role_name, assigned_at, assigned_by)
    VALUES (admin_user_id, 'label_admin', NOW(), admin_user_id)
    ON CONFLICT (user_id, role_name) DO NOTHING;
    
    RAISE NOTICE 'Label admin user created/updated successfully with ID: %', admin_user_id;
END $$;

-- Step 6: Verify the setup
SELECT 'Verification Results:' as status;

SELECT 'Auth user:' as check_type, id, email 
FROM auth.users 
WHERE email = 'labeladmin@mscandco.com';

SELECT 'Profile:' as check_type, id, email, first_name, last_name, artist_name
FROM public.user_profiles 
WHERE email = 'labeladmin@mscandco.com';

SELECT 'Role assignment:' as check_type, user_id, role_name
FROM public.user_role_assignments ura
JOIN auth.users au ON ura.user_id = au.id
WHERE au.email = 'labeladmin@mscandco.com';

SELECT 'Function test:' as check_type, 
       public.get_user_role((SELECT id FROM auth.users WHERE email = 'labeladmin@mscandco.com')) as role_result;
