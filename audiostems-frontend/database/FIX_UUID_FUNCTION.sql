-- Fix the UUID function to handle the conversion better

DROP FUNCTION IF EXISTS update_label_admin_profile;

CREATE OR REPLACE FUNCTION update_label_admin_profile(
  p_user_id TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_artist_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_instagram TEXT DEFAULT NULL,
  p_facebook TEXT DEFAULT NULL,
  p_twitter TEXT DEFAULT NULL,
  p_youtube TEXT DEFAULT NULL,
  p_tiktok TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_short_bio TEXT DEFAULT NULL,
  p_is_basic_info_set BOOLEAN DEFAULT NULL,
  p_profile_completed BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  user_uuid UUID;
  clean_uuid_text TEXT;
BEGIN
  -- Clean the UUID text and try different approaches
  clean_uuid_text := TRIM(p_user_id);
  clean_uuid_text := REPLACE(clean_uuid_text, E'\n', '');
  clean_uuid_text := REPLACE(clean_uuid_text, E'\r', '');
  clean_uuid_text := REPLACE(clean_uuid_text, E'\t', '');
  
  -- Try to convert to UUID
  BEGIN
    user_uuid := clean_uuid_text::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- If conversion fails, try to find the user by email instead
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'labeladmin@mscandco.com';
    
    IF user_uuid IS NULL THEN
      RAISE EXCEPTION 'Could not find or convert user UUID: %', p_user_id;
    END IF;
  END;
  
  -- Update or insert profile
  INSERT INTO public.user_profiles (
    id, email, first_name, last_name, artist_name, phone, country_code, country,
    website, instagram, facebook, twitter, youtube, tiktok, bio, short_bio,
    is_basic_info_set, profile_completed, updated_at
  ) VALUES (
    user_uuid,
    (SELECT email FROM auth.users WHERE id = user_uuid),
    p_first_name,
    p_last_name,
    p_artist_name,
    p_phone,
    p_country_code,
    p_country,
    p_website,
    p_instagram,
    p_facebook,
    p_twitter,
    p_youtube,
    p_tiktok,
    p_bio,
    p_short_bio,
    p_is_basic_info_set,
    p_profile_completed,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(p_first_name, user_profiles.first_name),
    last_name = COALESCE(p_last_name, user_profiles.last_name),
    artist_name = COALESCE(p_artist_name, user_profiles.artist_name),
    phone = COALESCE(p_phone, user_profiles.phone),
    country_code = COALESCE(p_country_code, user_profiles.country_code),
    country = COALESCE(p_country, user_profiles.country),
    website = COALESCE(p_website, user_profiles.website),
    instagram = COALESCE(p_instagram, user_profiles.instagram),
    facebook = COALESCE(p_facebook, user_profiles.facebook),
    twitter = COALESCE(p_twitter, user_profiles.twitter),
    youtube = COALESCE(p_youtube, user_profiles.youtube),
    tiktok = COALESCE(p_tiktok, user_profiles.tiktok),
    bio = COALESCE(p_bio, user_profiles.bio),
    short_bio = COALESCE(p_short_bio, user_profiles.short_bio),
    is_basic_info_set = COALESCE(p_is_basic_info_set, user_profiles.is_basic_info_set),
    profile_completed = COALESCE(p_profile_completed, user_profiles.profile_completed),
    updated_at = NOW();

  -- Return success message
  RETURN json_build_object('success', true, 'message', 'Profile updated successfully');
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_label_admin_profile TO authenticated;
GRANT EXECUTE ON FUNCTION update_label_admin_profile TO anon;
GRANT EXECUTE ON FUNCTION update_label_admin_profile TO service_role;
