-- Add accessibility features preference column to user_profiles
-- This allows artists and label admins to toggle the Community dropdown in the header

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS show_accessibility_features BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN user_profiles.show_accessibility_features IS 
'When enabled, artists and label admins can see the Community dropdown in the header with accessibility, copyright, sustainability, skills, and open data features';

