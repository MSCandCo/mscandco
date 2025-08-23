-- Fix user_profiles table by adding missing columns for billing

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS subscription_type TEXT,
ADD COLUMN IF NOT EXISTS billing_interval TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'artist',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);

-- Update subscription_status to allow common values
ALTER TABLE user_profiles 
ALTER COLUMN subscription_status TYPE TEXT;

-- Add check constraint for subscription_type
ALTER TABLE user_profiles 
ADD CONSTRAINT check_subscription_type 
CHECK (subscription_type IN ('artist_starter', 'artist_pro', 'label_admin_starter', 'label_admin_pro') OR subscription_type IS NULL);

-- Add check constraint for billing_interval  
ALTER TABLE user_profiles
ADD CONSTRAINT check_billing_interval
CHECK (billing_interval IN ('monthly', 'yearly') OR billing_interval IS NULL);

-- Add check constraint for role
ALTER TABLE user_profiles
ADD CONSTRAINT check_role
CHECK (role IN ('artist', 'label_admin', 'distribution_partner', 'company_admin', 'super_admin'));

-- Create a sample user for testing (you can modify this)
INSERT INTO user_profiles (user_id, email, role, subscription_type, billing_interval, subscription_status)
VALUES ('test-user-123', 'info@htay.co.uk', 'artist', 'artist_pro', 'monthly', 'active')
ON CONFLICT (id) DO NOTHING;

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
