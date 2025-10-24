-- Check what settings are actually stored for your user
SELECT 
  id,
  email,
  theme_preference,
  language_preference,
  default_currency,
  preferred_currency,
  timezone,
  date_format,
  notification_settings
FROM user_profiles
WHERE email = 'info@htay.co.uk';

