-- 🔍 DIAGNOSTIC AND STEP-BY-STEP FIX
-- Let's see what exists and fix it properly

-- Step 1: Check what tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%';

-- Step 2: If user_profiles exists, show its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 3: Check what types exist
SELECT typname, typtype 
FROM pg_type 
WHERE typname LIKE '%user%' OR typname LIKE '%subscription%';

-- Step 4: Start fresh - drop everything related to user_profiles
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS subscription_tier_enum CASCADE;

-- Step 5: Create types first
CREATE TYPE user_role_enum AS ENUM (
    'artist', 
    'label_admin', 
    'distribution_partner', 
    'company_admin', 
    'super_admin'
);

CREATE TYPE subscription_tier_enum AS ENUM (
    'starter', 
    'pro'
);

-- Step 6: Create table with ALL columns at once (no ALTER TABLE needed)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'artist',
    subscription_tier subscription_tier_enum,
    subscription_interval TEXT CHECK (subscription_interval IN ('monthly', 'yearly') OR subscription_interval IS NULL),
    subscription_status TEXT DEFAULT 'inactive',
    company_name TEXT,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Add indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Step 8: Verify the table was created correctly
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Step 9: Show count of columns to confirm
SELECT COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
