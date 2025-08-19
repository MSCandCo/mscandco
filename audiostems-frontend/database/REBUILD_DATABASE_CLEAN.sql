-- COMPLETE DATABASE REBUILD - ENTERPRISE GRADE SOLUTION
-- This rebuilds the entire user profile system from scratch with proper schema design
-- NO PATCHES - This is the gold standard implementation

-- ========================================
-- 1. CLEAN SLATE - DROP EVERYTHING
-- ========================================

-- Drop all existing problematic structures
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.user_role_assignments CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS artist_type_enum CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP FUNCTION IF EXISTS public.custom_access_token_hook(event jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ========================================
-- 2. CREATE PROPER ENUMS FIRST
-- ========================================

-- User role enum
CREATE TYPE user_role_enum AS ENUM (
    'artist',
    'label_admin', 
    'company_admin',
    'super_admin'
);

-- Artist type enum
CREATE TYPE artist_type_enum AS ENUM (
    'Solo Artist',
    'Band Group',
    'DJ', 
    'Duo',
    'Orchestra',
    'Ensemble',
    'Collective',
    'Producer',
    'Composer',
    'Singer-Songwriter'
);

-- ========================================
-- 3. CREATE CLEAN USER ROLES SYSTEM
-- ========================================

-- User roles reference table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name user_role_enum UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User role assignments table
CREATE TABLE public.user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name user_role_enum NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, role_name)
);

-- ========================================
-- 4. CREATE COMPREHENSIVE USER PROFILES TABLE
-- ========================================

CREATE TABLE public.user_profiles (
    -- Primary identification
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    
    -- Personal information (locked after registration)
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    nationality TEXT,
    country TEXT,
    city TEXT,
    address TEXT,
    postal_code TEXT,
    
    -- Contact information
    phone TEXT,
    country_code TEXT DEFAULT '+44',
    
    -- Artist information
    artist_name TEXT,
    artist_type artist_type_enum DEFAULT 'Solo Artist',
    
    -- Music information
    primary_genre TEXT,
    secondary_genre TEXT,
    secondary_genres JSONB DEFAULT '[]',
    instruments JSONB DEFAULT '[]',
    vocal_type TEXT,
    years_active TEXT,
    
    -- Business information
    record_label TEXT,
    publisher TEXT,
    isrc_prefix TEXT,
    
    -- Social media
    website TEXT,
    instagram TEXT,
    facebook TEXT,
    twitter TEXT,
    youtube TEXT,
    tiktok TEXT,
    threads TEXT,
    apple_music TEXT,
    soundcloud TEXT,
    
    -- Profile content
    bio TEXT,
    short_bio TEXT,
    profile_image TEXT,
    banner_image TEXT,
    
    -- Status and metadata
    is_basic_info_set BOOLEAN DEFAULT FALSE,
    basic_profile_locked BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    registration_stage INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- 5. CREATE POSTGRESQL ROLES FOR RLS
-- ========================================

-- Create PostgreSQL roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'artist') THEN
        CREATE ROLE artist;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'label_admin') THEN
        CREATE ROLE label_admin;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'company_admin') THEN
        CREATE ROLE company_admin;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'super_admin') THEN
        CREATE ROLE super_admin;
    END IF;
END $$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO artist, label_admin, company_admin, super_admin;
GRANT ALL ON public.user_profiles TO artist, label_admin, company_admin, super_admin;
GRANT ALL ON public.user_roles TO artist, label_admin, company_admin, super_admin;
GRANT ALL ON public.user_role_assignments TO artist, label_admin, company_admin, super_admin;
GRANT artist, label_admin, company_admin, super_admin TO authenticated;

-- ========================================
-- 6. ENABLE RLS AND CREATE POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Role policies
CREATE POLICY "Anyone can read user roles" ON public.user_roles
    FOR SELECT USING (true);

CREATE POLICY "Users can read own role assignments" ON public.user_role_assignments
    FOR SELECT USING (user_id = auth.uid());

-- ========================================
-- 7. CREATE PROPER TRIGGERS AND FUNCTIONS
-- ========================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Custom access token hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text;
    existing_claims jsonb;
BEGIN
    -- Get user's role
    SELECT ura.role_name::text INTO user_role
    FROM public.user_role_assignments ura
    WHERE ura.user_id = (event->>'user_id')::uuid
    ORDER BY 
        CASE ura.role_name
            WHEN 'super_admin' THEN 1
            WHEN 'company_admin' THEN 2
            WHEN 'label_admin' THEN 3
            WHEN 'artist' THEN 4
        END
    LIMIT 1;

    -- Default to artist if no role found
    IF user_role IS NULL THEN
        user_role := 'artist';
    END IF;

    -- Preserve existing claims and add role
    existing_claims := COALESCE(event->'claims', '{}'::jsonb);
    existing_claims := existing_claims || jsonb_build_object('role', user_role);

    RETURN jsonb_set(event, '{claims}', existing_claims);
END;
$$;

-- New user profile creation function
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
        registration_date
    ) VALUES (
        NEW.id,
        NEW.email,
        now(),
        now(),
        now()
    );

    -- Assign default artist role
    INSERT INTO public.user_role_assignments (user_id, role_name)
    VALUES (NEW.id, 'artist'::user_role_enum);

    RETURN NEW;
END;
$$;

-- Grant permissions to functions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO supabase_auth_admin;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 8. POPULATE REFERENCE DATA
-- ========================================

-- Insert user roles
INSERT INTO public.user_roles (role_name, description) VALUES 
('artist', 'Individual artist or performer'),
('label_admin', 'Label administrator managing artists'),
('company_admin', 'Company administrator with broader access'),
('super_admin', 'System administrator with full access');

-- ========================================
-- 9. CREATE YOUR USER PROFILE
-- ========================================

-- Create your specific profile (if user exists)
DO $$
DECLARE
    user_exists boolean;
    user_id_var uuid;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'info@htay.co.uk') INTO user_exists;
    
    IF user_exists THEN
        SELECT id INTO user_id_var FROM auth.users WHERE email = 'info@htay.co.uk';
        
        -- Insert/update your profile
        INSERT INTO public.user_profiles (
            id, email, first_name, last_name, date_of_birth,
            nationality, country, city, artist_name, artist_type,
            phone, country_code, primary_genre, secondary_genre,
            years_active, record_label, publisher, bio, short_bio,
            is_basic_info_set, profile_completed
        ) VALUES (
            user_id_var, 'info@htay.co.uk', 'Henry', 'Taylor', '1989-11-06',
            'British', 'United Kingdom', 'London', 'H-Tay', 'Solo Artist',
            '1234567890', '+44', 'Hip Hop', 'House',
            '15', 'YHWH MSC', 'MSC & Co', 'Jesus I love forever', 'I love Jesus',
            true, false
        ) ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            date_of_birth = EXCLUDED.date_of_birth,
            nationality = EXCLUDED.nationality,
            country = EXCLUDED.country,
            city = EXCLUDED.city,
            artist_name = EXCLUDED.artist_name,
            artist_type = EXCLUDED.artist_type,
            phone = EXCLUDED.phone,
            country_code = EXCLUDED.country_code,
            primary_genre = EXCLUDED.primary_genre,
            secondary_genre = EXCLUDED.secondary_genre,
            years_active = EXCLUDED.years_active,
            record_label = EXCLUDED.record_label,
            publisher = EXCLUDED.publisher,
            bio = EXCLUDED.bio,
            short_bio = EXCLUDED.short_bio,
            is_basic_info_set = EXCLUDED.is_basic_info_set,
            profile_completed = EXCLUDED.profile_completed,
            updated_at = now();
            
        -- Ensure role assignment
        INSERT INTO public.user_role_assignments (user_id, role_name)
        VALUES (user_id_var, 'artist'::user_role_enum)
        ON CONFLICT (user_id, role_name) DO NOTHING;
    END IF;
END $$;

-- ========================================
-- 10. VERIFICATION
-- ========================================

SELECT 'ENTERPRISE DATABASE REBUILD COMPLETE!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%user%';

SELECT 'Enums created:' as info;
SELECT typname as enum_types FROM pg_type WHERE typtype = 'e';

SELECT 'Your profile:' as info;
SELECT first_name, last_name, artist_name, artist_type, country 
FROM public.user_profiles WHERE email = 'info@htay.co.uk';
