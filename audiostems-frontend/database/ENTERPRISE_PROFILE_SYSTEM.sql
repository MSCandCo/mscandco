-- ENTERPRISE-GRADE PROFILE SYSTEM - BEST OF THE BEST
-- Complete solution that handles all constraints, enums, and locking

-- =====================================================
-- 1. COMPREHENSIVE TABLE STRUCTURE
-- =====================================================

-- Ensure all necessary columns exist with proper types
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS locked_fields JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_lock_status TEXT DEFAULT 'unlocked',
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS admin_level TEXT;

-- =====================================================
-- 2. ENTERPRISE-GRADE PROFILE UPDATE FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS public.update_user_profile(TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_email TEXT,
  p_profile_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_uuid UUID;
  user_role TEXT;
  current_profile RECORD;
  safe_artist_type artist_type_enum;
  safe_date_of_birth DATE;
BEGIN
  -- Get user UUID by email (more reliable than hardcoded UUIDs)
  SELECT id INTO user_uuid FROM auth.users WHERE email = p_email;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User not found for email: %', p_email;
  END IF;
  
  -- Get user role
  SELECT role_name INTO user_role
  FROM public.user_role_assignments
  WHERE user_id = user_uuid;
  
  -- Get current profile if exists
  SELECT * INTO current_profile
  FROM public.user_profiles
  WHERE id = user_uuid;
  
  -- Safely handle artist_type enum
  safe_artist_type := NULL;
  IF p_profile_data->>'artistType' IS NOT NULL THEN
    BEGIN
      safe_artist_type := (p_profile_data->>'artistType')::artist_type_enum;
    EXCEPTION WHEN OTHERS THEN
      -- Keep existing value if new value is invalid
      safe_artist_type := current_profile.artist_type;
    END;
  ELSE
    safe_artist_type := current_profile.artist_type;
  END IF;
  
  -- Safely handle date of birth
  safe_date_of_birth := NULL;
  IF p_profile_data->>'dateOfBirth' IS NOT NULL THEN
    BEGIN
      safe_date_of_birth := (p_profile_data->>'dateOfBirth')::DATE;
    EXCEPTION WHEN OTHERS THEN
      safe_date_of_birth := current_profile.date_of_birth;
    END;
  ELSE
    safe_date_of_birth := current_profile.date_of_birth;
  END IF;
  
  -- Check if profile exists, if not create it
  IF current_profile.id IS NULL THEN
    -- Insert new profile
    INSERT INTO public.user_profiles (
      id, email, first_name, last_name, artist_name, date_of_birth,
      nationality, country, city, artist_type, phone, country_code,
      primary_genre, secondary_genre, years_active, record_label, publisher,
      bio, short_bio, website, instagram, facebook, twitter, youtube, tiktok,
      is_basic_info_set, profile_completed, locked_fields, profile_lock_status,
      department, business_type, admin_level,
      created_at, updated_at, registration_date
    ) VALUES (
      user_uuid, p_email,
      p_profile_data->>'firstName',
      p_profile_data->>'lastName',
      COALESCE(p_profile_data->>'artistName', p_profile_data->>'labelName', p_profile_data->>'companyName'),
      safe_date_of_birth,
      p_profile_data->>'nationality',
      p_profile_data->>'country',
      p_profile_data->>'city',
      safe_artist_type,
      p_profile_data->>'phone',
      COALESCE(p_profile_data->>'countryCode', '+44'),
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
      COALESCE(p_profile_data->'lockedFields', '{}'),
      COALESCE(p_profile_data->>'profileLockStatus', 'unlocked'),
      p_profile_data->>'department',
      CASE WHEN user_role = 'distribution_partner' THEN 'distribution' ELSE NULL END,
      CASE WHEN user_role IN ('company_admin', 'super_admin') THEN user_role ELSE NULL END,
      NOW(), NOW(), NOW()
    );
  ELSE
    -- Update existing profile with locking logic
    UPDATE public.user_profiles SET
      first_name = CASE 
        WHEN COALESCE(locked_fields->>'firstName', 'false')::boolean = false 
        THEN COALESCE(p_profile_data->>'firstName', first_name)
        ELSE first_name 
      END,
      last_name = CASE 
        WHEN COALESCE(locked_fields->>'lastName', 'false')::boolean = false 
        THEN COALESCE(p_profile_data->>'lastName', last_name)
        ELSE last_name 
      END,
      artist_name = CASE 
        WHEN COALESCE(locked_fields->>'artistName', 'false')::boolean = false 
        AND COALESCE(locked_fields->>'labelName', 'false')::boolean = false 
        AND COALESCE(locked_fields->>'companyName', 'false')::boolean = false 
        THEN COALESCE(
          p_profile_data->>'artistName', 
          p_profile_data->>'labelName', 
          p_profile_data->>'companyName', 
          artist_name
        )
        ELSE artist_name 
      END,
      date_of_birth = CASE 
        WHEN COALESCE(locked_fields->>'dateOfBirth', 'false')::boolean = false 
        THEN COALESCE(safe_date_of_birth, date_of_birth)
        ELSE date_of_birth 
      END,
      nationality = CASE 
        WHEN COALESCE(locked_fields->>'nationality', 'false')::boolean = false 
        THEN COALESCE(p_profile_data->>'nationality', nationality)
        ELSE nationality 
      END,
      country = CASE 
        WHEN COALESCE(locked_fields->>'country', 'false')::boolean = false 
        THEN COALESCE(p_profile_data->>'country', country)
        ELSE country 
      END,
      city = CASE 
        WHEN COALESCE(locked_fields->>'city', 'false')::boolean = false 
        THEN COALESCE(p_profile_data->>'city', city)
        ELSE city 
      END,
      artist_type = CASE 
        WHEN COALESCE(locked_fields->>'artistType', 'false')::boolean = false 
        THEN COALESCE(safe_artist_type, artist_type)
        ELSE artist_type 
      END,
      phone = CASE 
        WHEN COALESCE(locked_fields->>'phone', 'false')::boolean = false 
        THEN COALESCE(p_profile_data->>'phone', phone)
        ELSE phone 
      END,
      country_code = COALESCE(p_profile_data->>'countryCode', country_code),
      primary_genre = COALESCE(p_profile_data->>'primaryGenre', primary_genre),
      secondary_genre = COALESCE(p_profile_data->>'secondaryGenre', secondary_genre),
      years_active = COALESCE(p_profile_data->>'yearsActive', years_active),
      record_label = COALESCE(p_profile_data->>'recordLabel', record_label),
      publisher = COALESCE(p_profile_data->>'publisher', publisher),
      bio = COALESCE(p_profile_data->>'bio', bio),
      short_bio = COALESCE(p_profile_data->>'shortBio', short_bio),
      website = COALESCE(p_profile_data->>'website', website),
      instagram = COALESCE(p_profile_data->>'instagram', instagram),
      facebook = COALESCE(p_profile_data->>'facebook', facebook),
      twitter = COALESCE(p_profile_data->>'twitter', twitter),
      youtube = COALESCE(p_profile_data->>'youtube', youtube),
      tiktok = COALESCE(p_profile_data->>'tiktok', tiktok),
      is_basic_info_set = COALESCE((p_profile_data->>'isBasicInfoSet')::BOOLEAN, is_basic_info_set),
      profile_completed = COALESCE((p_profile_data->>'profileCompleted')::BOOLEAN, profile_completed),
      locked_fields = COALESCE(p_profile_data->'lockedFields', locked_fields),
      profile_lock_status = COALESCE(p_profile_data->>'profileLockStatus', profile_lock_status),
      department = COALESCE(p_profile_data->>'department', department),
      business_type = CASE WHEN user_role = 'distribution_partner' THEN 'distribution' ELSE business_type END,
      admin_level = CASE WHEN user_role IN ('company_admin', 'super_admin') THEN user_role ELSE admin_level END,
      updated_at = NOW()
    WHERE id = user_uuid;
  END IF;

  -- Return comprehensive success response
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
      'lockedFields', locked_fields,
      'profileLockStatus', profile_lock_status,
      'department', department,
      'businessType', business_type,
      'adminLevel', admin_level,
      'userRole', user_role,
      'updatedAt', updated_at
    )
  ) INTO result
  FROM public.user_profiles
  WHERE id = user_uuid;

  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO service_role;

SELECT 'Enterprise-grade profile system complete!' as status;
