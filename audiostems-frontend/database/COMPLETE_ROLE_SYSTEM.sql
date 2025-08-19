-- COMPLETE ROLE-BASED AUTHENTICATION SYSTEM
-- This is the gold standard, enterprise-grade solution
-- Run this AFTER the PERMANENT_AUTH_SOLUTION.sql

-- ========================================
-- 1. CREATE ROLE TABLES
-- ========================================

-- Create user_roles table (defines available roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_role_assignments table (assigns roles to users)
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL REFERENCES public.user_roles(role_name) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, role_name)
);

-- ========================================
-- 2. INSERT DEFAULT ROLES
-- ========================================

INSERT INTO public.user_roles (role_name, description) VALUES 
('artist', 'Individual artist or performer'),
('label_admin', 'Label administrator managing artists'),
('company_admin', 'Company administrator with broader access'),
('super_admin', 'System administrator with full access')
ON CONFLICT (role_name) DO NOTHING;

-- ========================================
-- 3. ASSIGN YOUR USER THE ARTIST ROLE
-- ========================================

-- Assign artist role to your user
INSERT INTO public.user_role_assignments (user_id, role_name) 
SELECT 
    id as user_id,
    'artist' as role_name
FROM auth.users 
WHERE email = 'info@htay.co.uk'
ON CONFLICT (user_id, role_name) DO NOTHING;

-- ========================================
-- 4. CREATE RLS POLICIES FOR ROLE TABLES
-- ========================================

-- Enable RLS on role tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read available roles
CREATE POLICY "Anyone can read user roles" ON public.user_roles
    FOR SELECT USING (true);

-- Policy: Users can read their own role assignments
CREATE POLICY "Users can read own role assignments" ON public.user_role_assignments
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_role_assignments ura
            WHERE ura.user_id = auth.uid() 
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- Policy: Only admins can manage role assignments
CREATE POLICY "Admins can manage role assignments" ON public.user_role_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_role_assignments ura
            WHERE ura.user_id = auth.uid() 
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- ========================================
-- 5. UPDATE THE CUSTOM ACCESS TOKEN HOOK
-- ========================================

-- Drop the old function and recreate with proper role lookup
DROP FUNCTION IF EXISTS public.custom_access_token_hook(event jsonb);

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    claims jsonb;
    user_role text;
BEGIN
    -- Get the user's primary role
    SELECT ura.role_name INTO user_role
    FROM public.user_role_assignments ura
    WHERE ura.user_id = (event->>'user_id')::uuid
    ORDER BY 
        CASE ura.role_name
            WHEN 'super_admin' THEN 1
            WHEN 'company_admin' THEN 2
            WHEN 'label_admin' THEN 3
            WHEN 'artist' THEN 4
            ELSE 5
        END
    LIMIT 1;

    -- Set default role if none found
    IF user_role IS NULL THEN
        user_role := 'artist';
    END IF;

    -- Build claims
    claims := jsonb_build_object(
        'role', user_role,
        'user_id', event->>'user_id'
    );

    -- Return the modified event
    RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- ========================================
-- 6. CREATE AUTOMATIC PROFILE CREATION TRIGGER
-- ========================================

-- Function to create user profile and assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (
        id,
        email,
        created_at,
        updated_at,
        registration_stage,
        is_basic_info_set,
        profile_completed
    ) VALUES (
        NEW.id,
        NEW.email,
        now(),
        now(),
        1,
        false,
        false
    );

    -- Assign default artist role
    INSERT INTO public.user_role_assignments (user_id, role_name)
    VALUES (NEW.id, 'artist')
    ON CONFLICT (user_id, role_name) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 7. VERIFICATION QUERIES
-- ========================================

-- Verify everything is set up correctly
SELECT 'Roles created:' as status;
SELECT role_name, description FROM public.user_roles ORDER BY role_name;

SELECT 'User role assignments:' as status;
SELECT 
    u.email,
    ura.role_name,
    ura.assigned_at
FROM auth.users u
JOIN public.user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email, ura.role_name;

SELECT 'Setup complete - Enterprise-grade role system ready!' as final_status;
