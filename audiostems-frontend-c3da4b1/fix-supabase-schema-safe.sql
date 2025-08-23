-- SAFE FIX: Handle existing database schema conflicts
-- This version handles existing types, constraints, and columns

-- Step 1: Add missing columns (safe with IF NOT EXISTS)
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

-- Step 2: Add indexes safely (ignore if they exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);

-- Step 3: Update subscription_status column type (handle existing constraints)
DO $$ 
BEGIN
    -- Drop existing check constraints that might conflict
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS check_subscription_type;
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS check_billing_interval;
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS check_role;
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_subscription_type_check;
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_billing_interval_check;
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
EXCEPTION
    WHEN others THEN
        -- Ignore errors if constraints don't exist
        NULL;
END $$;

-- Step 4: Update column type safely
ALTER TABLE user_profiles 
ALTER COLUMN subscription_status TYPE TEXT;

-- Step 5: Add new check constraints with unique names
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_subscription_type_new 
CHECK (subscription_type IN ('artist_starter', 'artist_pro', 'label_admin_starter', 'label_admin_pro') OR subscription_type IS NULL);

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_billing_interval_new
CHECK (billing_interval IN ('monthly', 'yearly') OR billing_interval IS NULL);

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_new
CHECK (role IN ('artist', 'label_admin', 'distribution_partner', 'company_admin', 'super_admin'));

-- Step 6: Create test user safely
INSERT INTO user_profiles (user_id, email, role, subscription_type, billing_interval, subscription_status)
VALUES ('test-user-123', 'info@htay.co.uk', 'artist', 'artist_pro', 'monthly', 'active')
ON CONFLICT (id) DO NOTHING;

-- Step 7: Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
