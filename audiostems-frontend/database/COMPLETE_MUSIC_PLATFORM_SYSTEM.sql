-- COMPLETE MSC & CO MUSIC PLATFORM SYSTEM
-- Clean implementation for all 5 user roles with proper permissions and RLS

-- =====================================================
-- 1. CLEAN UP AND RESET
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for users on own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users on own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for users on own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable all access for label admins" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow service role all operations" ON public.user_profiles;
DROP POLICY IF EXISTS "service_role_bypass" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profile_select" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profile_update" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profile_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "label_admin_all_access" ON public.user_profiles;
DROP POLICY IF EXISTS "distribution_partner_all_access" ON public.user_profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS update_label_admin_profile;
DROP FUNCTION IF EXISTS update_user_profile;

-- =====================================================
-- 2. CREATE PROPER USER ROLE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_role(input_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Handle null input
    IF input_user_id IS NULL THEN
        RETURN 'anonymous';
    END IF;
    
    -- Get the user's role from user_role_assignments
    SELECT role_name INTO user_role
    FROM public.user_role_assignments
    WHERE user_id = input_user_id
    LIMIT 1;
    
    -- Return role or default to 'artist'
    RETURN COALESCE(user_role, 'artist');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'artist';
END;
$$;

-- =====================================================
-- 3. CREATE UNIVERSAL PROFILE UPDATE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id TEXT,
  p_profile_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_uuid UUID;
  clean_uuid_text TEXT;
BEGIN
  -- Clean and convert UUID
  clean_uuid_text := TRIM(REPLACE(REPLACE(REPLACE(p_user_id, E'\n', ''), E'\r', ''), E'\t', ''));
  
  BEGIN
    user_uuid := clean_uuid_text::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: try to find user by email if UUID conversion fails
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = COALESCE(p_profile_data->>'email', 'unknown@example.com');
    
    IF user_uuid IS NULL THEN
      RAISE EXCEPTION 'Invalid UUID format and no fallback user found: %', p_user_id;
    END IF;
  END;
  
  -- Update profile using UPSERT with comprehensive field mapping
  INSERT INTO public.user_profiles (
    id, 
    email,
    first_name, 
    last_name, 
    artist_name,
    date_of_birth,
    nationality,
    country,
    city,
    artist_type,
    phone, 
    country_code,
    primary_genre,
    secondary_genre,
    years_active,
    record_label,
    publisher,
    bio, 
    short_bio,
    website,
    instagram, 
    facebook, 
    twitter, 
    youtube, 
    tiktok,
    is_basic_info_set,
    profile_completed,
    updated_at
  ) VALUES (
    user_uuid,
    COALESCE((SELECT email FROM auth.users WHERE id = user_uuid), p_profile_data->>'email'),
    p_profile_data->>'firstName',
    p_profile_data->>'lastName',
    COALESCE(p_profile_data->>'artistName', p_profile_data->>'labelName', p_profile_data->>'companyName'),
    (p_profile_data->>'dateOfBirth')::DATE,
    p_profile_data->>'nationality',
    p_profile_data->>'country',
    p_profile_data->>'city',
    p_profile_data->>'artistType',
    p_profile_data->>'phone',
    p_profile_data->>'countryCode',
    p_profile_data->>'primaryGenre',
    p_profile_data->>'secondaryGenre',
    p_profile_data->>'yearsActive',
    p_profile_data->>'recordLabel',
    p_profile_data->>'publisher',
    p_profile_data->>'bio',
    p_profile_data->>'shortBio',
    p_profile_data->>'website',
    p_profile_data->>'instagram',
    p_profile_data->>'facebook',
    p_profile_data->>'twitter',
    p_profile_data->>'youtube',
    p_profile_data->>'tiktok',
    COALESCE((p_profile_data->>'isBasicInfoSet')::BOOLEAN, false),
    COALESCE((p_profile_data->>'profileCompleted')::BOOLEAN, false),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
    artist_name = COALESCE(EXCLUDED.artist_name, user_profiles.artist_name),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, user_profiles.date_of_birth),
    nationality = COALESCE(EXCLUDED.nationality, user_profiles.nationality),
    country = COALESCE(EXCLUDED.country, user_profiles.country),
    city = COALESCE(EXCLUDED.city, user_profiles.city),
    artist_type = COALESCE(EXCLUDED.artist_type, user_profiles.artist_type),
    phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
    country_code = COALESCE(EXCLUDED.country_code, user_profiles.country_code),
    primary_genre = COALESCE(EXCLUDED.primary_genre, user_profiles.primary_genre),
    secondary_genre = COALESCE(EXCLUDED.secondary_genre, user_profiles.secondary_genre),
    years_active = COALESCE(EXCLUDED.years_active, user_profiles.years_active),
    record_label = COALESCE(EXCLUDED.record_label, user_profiles.record_label),
    publisher = COALESCE(EXCLUDED.publisher, user_profiles.publisher),
    bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
    short_bio = COALESCE(EXCLUDED.short_bio, user_profiles.short_bio),
    website = COALESCE(EXCLUDED.website, user_profiles.website),
    instagram = COALESCE(EXCLUDED.instagram, user_profiles.instagram),
    facebook = COALESCE(EXCLUDED.facebook, user_profiles.facebook),
    twitter = COALESCE(EXCLUDED.twitter, user_profiles.twitter),
    youtube = COALESCE(EXCLUDED.youtube, user_profiles.youtube),
    tiktok = COALESCE(EXCLUDED.tiktok, user_profiles.tiktok),
    is_basic_info_set = COALESCE(EXCLUDED.is_basic_info_set, user_profiles.is_basic_info_set),
    profile_completed = COALESCE(EXCLUDED.profile_completed, user_profiles.profile_completed),
    updated_at = NOW();

  -- Return success with updated profile data
  SELECT jsonb_build_object(
    'success', true,
    'message', 'Profile updated successfully',
    'profile', jsonb_build_object(
      'id', id,
      'email', email,
      'firstName', first_name,
      'lastName', last_name,
      'artistName', artist_name,
      'labelName', artist_name,
      'companyName', artist_name,
      'dateOfBirth', date_of_birth,
      'nationality', nationality,
      'country', country,
      'city', city,
      'artistType', artist_type,
      'phone', phone,
      'countryCode', country_code,
      'primaryGenre', primary_genre,
      'secondaryGenre', secondary_genre,
      'yearsActive', years_active,
      'recordLabel', record_label,
      'publisher', publisher,
      'bio', bio,
      'shortBio', short_bio,
      'website', website,
      'instagram', instagram,
      'facebook', facebook,
      'twitter', twitter,
      'youtube', youtube,
      'tiktok', tiktok,
      'isBasicInfoSet', is_basic_info_set,
      'profileCompleted', profile_completed,
      'updatedAt', updated_at
    )
  ) INTO result
  FROM public.user_profiles
  WHERE id = user_uuid;

  RETURN result;
END;
$$;

-- =====================================================
-- 4. SET PROPER TABLE PERMISSIONS
-- =====================================================

-- Grant all necessary permissions to all roles
GRANT ALL PRIVILEGES ON public.user_profiles TO postgres;
GRANT ALL PRIVILEGES ON public.user_profiles TO service_role;
GRANT ALL PRIVILEGES ON public.user_profiles TO authenticated;
GRANT ALL PRIVILEGES ON public.user_profiles TO anon;

GRANT ALL PRIVILEGES ON public.user_role_assignments TO postgres;
GRANT ALL PRIVILEGES ON public.user_role_assignments TO service_role;
GRANT ALL PRIVILEGES ON public.user_role_assignments TO authenticated;
GRANT ALL PRIVILEGES ON public.user_role_assignments TO anon;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO service_role;

-- =====================================================
-- 5. CREATE COMPREHENSIVE RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile
CREATE POLICY "users_own_profile_select" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "users_own_profile_update" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile
CREATE POLICY "users_own_profile_insert" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 4: Label admins can access all profiles (manage multiple artists)
CREATE POLICY "label_admin_all_access" ON public.user_profiles
FOR ALL USING (public.get_user_role(auth.uid()) = 'label_admin');

-- Policy 5: Distribution partners can access all profiles (handle all releases)
CREATE POLICY "distribution_partner_all_access" ON public.user_profiles
FOR ALL USING (public.get_user_role(auth.uid()) = 'distribution_partner');

-- Policy 6: Company admins can access all profiles (manage platform)
CREATE POLICY "company_admin_all_access" ON public.user_profiles
FOR ALL USING (public.get_user_role(auth.uid()) = 'company_admin');

-- Policy 7: Super admins can access everything (ghost login capabilities)
CREATE POLICY "super_admin_all_access" ON public.user_profiles
FOR ALL USING (public.get_user_role(auth.uid()) = 'super_admin');

-- Policy 8: Service role bypasses all restrictions (API operations)
CREATE POLICY "service_role_bypass" ON public.user_profiles
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- 6. ENSURE ALL SYSTEM USERS EXIST WITH CORRECT ROLES
-- =====================================================

DO $$
DECLARE
    artist_user_id UUID;
    label_admin_user_id UUID;
    distribution_partner_user_id UUID;
    company_admin_user_id UUID;
    super_admin_user_id UUID;
BEGIN
    -- 1. ARTIST (existing user: info@htay.co.uk)
    SELECT id INTO artist_user_id FROM auth.users WHERE email = 'info@htay.co.uk';
    IF artist_user_id IS NOT NULL THEN
        INSERT INTO public.user_role_assignments (user_id, role_name, assigned_at, assigned_by)
        VALUES (artist_user_id, 'artist', NOW(), artist_user_id)
        ON CONFLICT (user_id, role_name) DO NOTHING;
        
        RAISE NOTICE 'Artist user role assigned: info@htay.co.uk';
    END IF;

    -- 2. LABEL ADMIN (labeladmin@mscandco.com)
    SELECT id INTO label_admin_user_id FROM auth.users WHERE email = 'labeladmin@mscandco.com';
    IF label_admin_user_id IS NOT NULL THEN
        -- Update profile
        INSERT INTO public.user_profiles (
            id, email, first_name, last_name, artist_name, country,
            created_at, updated_at, registration_date
        ) VALUES (
            label_admin_user_id, 'labeladmin@mscandco.com', 'Label', 'Admin', 'MSC & Co', 'United Kingdom',
            NOW(), NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            first_name = 'Label',
            last_name = 'Admin',
            artist_name = 'MSC & Co',
            updated_at = NOW();
        
        -- Assign role
        INSERT INTO public.user_role_assignments (user_id, role_name, assigned_at, assigned_by)
        VALUES (label_admin_user_id, 'label_admin', NOW(), label_admin_user_id)
        ON CONFLICT (user_id, role_name) DO NOTHING;
        
        RAISE NOTICE 'Label admin user setup complete: labeladmin@mscandco.com';
    END IF;

    -- 3. DISTRIBUTION PARTNER (codegroup@mscandco.com)
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
    END IF;
    
    -- Update distribution partner profile
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
    
    RAISE NOTICE 'Distribution partner user setup complete: codegroup@mscandco.com';

    -- 4. COMPANY ADMIN (companyadmin@mscandco.com)
    SELECT id INTO company_admin_user_id FROM auth.users WHERE email = 'companyadmin@mscandco.com';
    IF company_admin_user_id IS NOT NULL THEN
        -- Update profile
        INSERT INTO public.user_profiles (
            id, email, first_name, last_name, artist_name, country,
            created_at, updated_at, registration_date
        ) VALUES (
            company_admin_user_id, 'companyadmin@mscandco.com', 'Company', 'Admin', 'MSC & Co', 'United Kingdom',
            NOW(), NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            first_name = 'Company',
            last_name = 'Admin',
            artist_name = 'MSC & Co',
            updated_at = NOW();
        
        -- Assign role
        INSERT INTO public.user_role_assignments (user_id, role_name, assigned_at, assigned_by)
        VALUES (company_admin_user_id, 'company_admin', NOW(), company_admin_user_id)
        ON CONFLICT (user_id, role_name) DO NOTHING;
        
        RAISE NOTICE 'Company admin user setup complete: companyadmin@mscandco.com';
    END IF;

    -- 5. SUPER ADMIN (superadmin@mscandco.com)
    SELECT id INTO super_admin_user_id FROM auth.users WHERE email = 'superadmin@mscandco.com';
    IF super_admin_user_id IS NOT NULL THEN
        -- Update profile
        INSERT INTO public.user_profiles (
            id, email, first_name, last_name, artist_name, country,
            created_at, updated_at, registration_date
        ) VALUES (
            super_admin_user_id, 'superadmin@mscandco.com', 'Super', 'Admin', 'MSC & Co Platform', 'United Kingdom',
            NOW(), NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            first_name = 'Super',
            last_name = 'Admin',
            artist_name = 'MSC & Co Platform',
            updated_at = NOW();
        
        -- Assign role
        INSERT INTO public.user_role_assignments (user_id, role_name, assigned_at, assigned_by)
        VALUES (super_admin_user_id, 'super_admin', NOW(), super_admin_user_id)
        ON CONFLICT (user_id, role_name) DO NOTHING;
        
        RAISE NOTICE 'Super admin user setup complete: superadmin@mscandco.com';
    END IF;

END $$;

-- =====================================================
-- 7. COMPREHENSIVE SYSTEM VERIFICATION
-- =====================================================

SELECT 'MSC & Co Platform System Verification:' as status;

-- Check RLS is enabled
SELECT 'RLS Status:' as check, tablename, rowsecurity 
FROM pg_tables WHERE tablename = 'user_profiles';

-- Check policies exist
SELECT 'Policies:' as check, COUNT(*) as policy_count
FROM pg_policies WHERE tablename = 'user_profiles';

-- Check functions exist
SELECT 'Functions:' as check, routine_name
FROM information_schema.routines 
WHERE routine_name IN ('get_user_role', 'update_user_profile')
AND routine_schema = 'public';

-- Check all users and their roles
SELECT 'All Users & Roles:' as check;
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

SELECT 'MSC & Co Platform Setup Complete! 🎉' as final_status;
