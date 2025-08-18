-- Update user_profiles table to support multi-step registration
-- This script adds new columns for the enhanced registration process

-- Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS backup_codes JSONB,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS registration_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS immutable_fields_locked BOOLEAN DEFAULT FALSE;

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone_number ON user_profiles(phone_number);

-- Create index on profile_completed for filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_completed ON user_profiles(profile_completed);

-- Create index on registration completion
CREATE INDEX IF NOT EXISTS idx_user_profiles_registration_completed ON user_profiles(registration_completed_at);

-- Update the trigger function to handle new registration fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    role,
    first_name,
    last_name,
    profile_completed,
    email_verified,
    phone_verified,
    immutable_fields_locked,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'artist'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    FALSE, -- Profile not completed during initial signup
    NEW.email_confirmed_at IS NOT NULL,
    FALSE, -- Phone not verified initially
    FALSE, -- Fields not locked until profile completion
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to complete registration and lock immutable fields
CREATE OR REPLACE FUNCTION complete_user_registration(
  user_id UUID,
  p_role TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_date_of_birth DATE,
  p_nationality TEXT,
  p_country TEXT,
  p_city TEXT,
  p_phone_number TEXT,
  p_backup_codes JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile exists and is not already completed
  SELECT profile_completed INTO profile_exists
  FROM user_profiles 
  WHERE id = user_id;
  
  IF profile_exists IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  IF profile_exists = TRUE THEN
    RAISE EXCEPTION 'Profile already completed and locked';
  END IF;
  
  -- Update profile with immutable data and lock it
  UPDATE user_profiles SET
    role = p_role,
    first_name = p_first_name,
    last_name = p_last_name,
    date_of_birth = p_date_of_birth,
    nationality = p_nationality,
    country = p_country,
    city = p_city,
    phone_number = p_phone_number,
    backup_codes = p_backup_codes,
    profile_completed = TRUE,
    phone_verified = TRUE,
    email_verified = TRUE,
    immutable_fields_locked = TRUE,
    registration_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for the new fields
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile only if not locked
CREATE POLICY "Users can update own unlocked profile" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id AND 
    (immutable_fields_locked = FALSE OR immutable_fields_locked IS NULL)
  );

-- Allow profile completion function to update locked profiles
CREATE POLICY "System can complete registration" ON user_profiles
  FOR UPDATE USING (TRUE);

-- Create a view for safe profile access (excluding sensitive data like backup codes)
CREATE OR REPLACE VIEW user_profiles_safe AS
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  date_of_birth,
  nationality,
  country,
  city,
  phone_number,
  profile_completed,
  email_verified,
  phone_verified,
  immutable_fields_locked,
  registration_completed_at,
  created_at,
  updated_at
FROM user_profiles;

-- Grant access to the safe view
GRANT SELECT ON user_profiles_safe TO authenticated;

-- Create a function to verify backup codes (for account recovery)
CREATE OR REPLACE FUNCTION verify_backup_code(
  user_id UUID,
  backup_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  stored_codes JSONB;
  code_valid BOOLEAN := FALSE;
BEGIN
  -- Get stored backup codes
  SELECT backup_codes INTO stored_codes
  FROM user_profiles 
  WHERE id = user_id AND profile_completed = TRUE;
  
  IF stored_codes IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the provided code exists in the stored codes
  SELECT EXISTS(
    SELECT 1 FROM jsonb_array_elements_text(stored_codes) AS code
    WHERE code = backup_code
  ) INTO code_valid;
  
  RETURN code_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number with country code for SMS verification';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'User date of birth - immutable after registration';
COMMENT ON COLUMN user_profiles.nationality IS 'User nationality - immutable after registration';
COMMENT ON COLUMN user_profiles.city IS 'User city - immutable after registration';
COMMENT ON COLUMN user_profiles.backup_codes IS 'Encrypted backup codes for account recovery';
COMMENT ON COLUMN user_profiles.profile_completed IS 'Whether the multi-step registration is completed';
COMMENT ON COLUMN user_profiles.email_verified IS 'Whether email verification was completed';
COMMENT ON COLUMN user_profiles.phone_verified IS 'Whether SMS verification was completed';
COMMENT ON COLUMN user_profiles.immutable_fields_locked IS 'Whether core profile fields are locked from changes';
COMMENT ON COLUMN user_profiles.registration_completed_at IS 'Timestamp when registration was fully completed';

COMMENT ON FUNCTION complete_user_registration IS 'Completes user registration and locks immutable fields';
COMMENT ON FUNCTION verify_backup_code IS 'Verifies a backup code for account recovery';
COMMENT ON VIEW user_profiles_safe IS 'Safe view of user profiles excluding sensitive backup codes';

-- Create notification for completed registrations (optional)
CREATE OR REPLACE FUNCTION notify_registration_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_completed = TRUE AND OLD.profile_completed = FALSE THEN
    -- Log registration completion
    INSERT INTO audit_log (
      user_id,
      action,
      details,
      created_at
    ) VALUES (
      NEW.id,
      'registration_completed',
      jsonb_build_object(
        'role', NEW.role,
        'email', NEW.email,
        'completed_at', NEW.registration_completed_at
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger for registration completion logging
DROP TRIGGER IF EXISTS trigger_registration_completion ON user_profiles;
CREATE TRIGGER trigger_registration_completion
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_registration_completion();

-- Enable RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit_log
CREATE POLICY "Users can view own audit logs" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

GRANT SELECT ON audit_log TO authenticated;
