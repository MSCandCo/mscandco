-- Add preferred_currency column to user_profiles table
-- This stores the user's preferred display currency across the platform

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'GBP';

-- Add a check constraint to ensure only valid currency codes
ALTER TABLE user_profiles 
ADD CONSTRAINT preferred_currency_check 
CHECK (preferred_currency IN ('USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW'));

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_currency 
ON user_profiles(preferred_currency);

-- Update existing users to have GBP as default if NULL
UPDATE user_profiles 
SET preferred_currency = 'GBP' 
WHERE preferred_currency IS NULL;

COMMENT ON COLUMN user_profiles.preferred_currency IS 'User preferred display currency for earnings and wallet balance';

