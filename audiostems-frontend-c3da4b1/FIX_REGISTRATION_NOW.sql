-- 🚨 CRITICAL: Run this SQL in Supabase to fix registration
-- Copy and paste this entire script into your Supabase SQL Editor and click "Run"

-- Add the missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Add helpful comments
COMMENT ON COLUMN public.user_profiles.country IS 'User country of residence';
COMMENT ON COLUMN public.user_profiles.country_code IS 'International phone country code (e.g., +44, +1)';
COMMENT ON COLUMN public.user_profiles.phone_number IS 'User phone number without country code';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('country', 'country_code', 'phone_number', 'postal_code')
ORDER BY column_name;

