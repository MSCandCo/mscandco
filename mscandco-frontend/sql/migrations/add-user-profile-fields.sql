-- Add missing user profile fields for enhanced user management

-- Short bio field
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS short_bio TEXT;

-- Wallet enabled flag
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS wallet_enabled BOOLEAN DEFAULT true;

-- Wallet credit limit
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS wallet_credit_limit DECIMAL(10, 2) DEFAULT 0.00;

-- Profile completion status
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Locked fields (JSONB array of field names that are locked)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS locked_fields JSONB DEFAULT '[]'::jsonb;

-- Approval required fields (JSONB array of field names requiring approval)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS approval_required_fields JSONB DEFAULT '[]'::jsonb;

-- Profile lock status (unlocked, partially_locked, fully_locked)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_lock_status TEXT DEFAULT 'unlocked' 
CHECK (profile_lock_status IN ('unlocked', 'partially_locked', 'fully_locked'));

-- Add helpful comments
COMMENT ON COLUMN user_profiles.short_bio IS 'Brief user/artist description (max 100 chars)';
COMMENT ON COLUMN user_profiles.wallet_enabled IS 'Whether the wallet system is enabled for this user';
COMMENT ON COLUMN user_profiles.wallet_credit_limit IS 'Maximum credit limit allowed for the user wallet';
COMMENT ON COLUMN user_profiles.profile_completed IS 'Whether the user has completed their profile setup';
COMMENT ON COLUMN user_profiles.locked_fields IS 'Array of field names that are locked from user editing';
COMMENT ON COLUMN user_profiles.approval_required_fields IS 'Array of field names that require admin approval to change';
COMMENT ON COLUMN user_profiles.profile_lock_status IS 'Overall profile lock status: unlocked, partially_locked, or fully_locked';
