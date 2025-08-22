-- Drop and recreate the update_user_profile function with correct signature

DROP FUNCTION IF EXISTS public.update_user_profile;

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
  
  -- Update profile using UPSERT
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, JSONB) TO service_role;

-- Test the function
SELECT 'Function recreated successfully!' as status;
