-- Check the actual columns in user_profiles table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN (
    'theme_preference',
    'language_preference', 
    'default_currency',
    'preferred_currency',
    'timezone',
    'date_format',
    'theme',
    'language'
  )
ORDER BY column_name;

-- Also check ALL columns to see what we have
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

