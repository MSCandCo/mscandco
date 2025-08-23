-- 🛡️ IDEMPOTENT ENTERPRISE-GRADE SUPABASE SCHEMA
-- Safe to run multiple times - handles existing tables, types, and constraints
-- Professional, bulletproof, zero-compromise approach

-- Step 1: Create custom types safely (only if they don't exist)
DO $$ 
BEGIN
    -- Create user_role_enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM (
            'artist', 
            'label_admin', 
            'distribution_partner', 
            'company_admin', 
            'super_admin'
        );
    END IF;

    -- Create subscription_tier_enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier_enum') THEN
        CREATE TYPE subscription_tier_enum AS ENUM (
            'starter', 
            'pro'
        );
    END IF;
END $$;

-- Step 2: Create user_profiles table safely
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'artist',
    subscription_tier subscription_tier_enum,
    subscription_interval TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    company_name TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add constraints safely (only if they don't exist)
DO $$ 
BEGIN
    -- Add unique constraint on email if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_email_key' 
        AND contype = 'u'
    ) THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
    END IF;

    -- Add unique constraint on stripe_customer_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_stripe_customer_id_key' 
        AND contype = 'u'
    ) THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_stripe_customer_id_key UNIQUE (stripe_customer_id);
    END IF;

    -- Add unique constraint on stripe_subscription_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_stripe_subscription_id_key' 
        AND contype = 'u'
    ) THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
    END IF;

    -- Add check constraint for subscription_interval if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_subscription_interval_check'
    ) THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_interval_check 
        CHECK (subscription_interval IN ('monthly', 'yearly') OR subscription_interval IS NULL);
    END IF;
END $$;

-- Step 4: Create indexes safely (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);

-- Step 5: Create or replace functions (safe to run multiple times)
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'artist')
    ON CONFLICT (id) DO NOTHING;  -- Safe if user already exists
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create triggers safely (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Enable RLS safely (only if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'user_profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 8: Create RLS policies safely (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all" ON user_profiles;
CREATE POLICY "Super admins can view all" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Company admins can view company users" ON user_profiles;
CREATE POLICY "Company admins can view company users" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'company_admin'
            AND company_name IS NOT NULL
            AND company_name = user_profiles.company_name
        )
    );

DROP POLICY IF EXISTS "Service role can manage all" ON user_profiles;
CREATE POLICY "Service role can manage all" ON user_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 9: Migrate existing data safely (if upgrading from old schema)
DO $$ 
BEGIN
    -- If there are users in auth.users but not in user_profiles, add them
    INSERT INTO user_profiles (id, email, role)
    SELECT 
        au.id,
        au.email,
        'artist'::user_role_enum
    FROM auth.users au
    WHERE NOT EXISTS (
        SELECT 1 FROM user_profiles up WHERE up.id = au.id
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Step 10: Verification and status report
DO $$ 
DECLARE
    table_exists BOOLEAN;
    total_columns INTEGER;
    total_users INTEGER;
    total_policies INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_profiles'
    ) INTO table_exists;

    -- Count columns
    SELECT COUNT(*) INTO total_columns
    FROM information_schema.columns 
    WHERE table_name = 'user_profiles';

    -- Count users
    SELECT COUNT(*) INTO total_users
    FROM user_profiles;

    -- Count policies
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies 
    WHERE tablename = 'user_profiles';

    -- Report status
    RAISE NOTICE '🚀 ENTERPRISE SCHEMA DEPLOYMENT COMPLETE!';
    RAISE NOTICE '✅ Table exists: %', table_exists;
    RAISE NOTICE '✅ Total columns: %', total_columns;
    RAISE NOTICE '✅ Total users: %', total_users;
    RAISE NOTICE '✅ RLS policies: %', total_policies;
    RAISE NOTICE '🎯 Schema is ready for production!';
END $$;

-- Step 11: Display final table structure for verification
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name = 'id' THEN '🔑 Primary Key (UUID from auth.users)'
        WHEN column_name = 'role' THEN '👤 User Role (5-tier system)'
        WHEN column_name = 'subscription_tier' THEN '💎 Subscription Level'
        WHEN column_name = 'stripe_customer_id' THEN '💳 Stripe Customer ID'
        WHEN column_name = 'stripe_subscription_id' THEN '🔄 Stripe Subscription ID'
        WHEN column_name = 'subscription_status' THEN '📊 Subscription Status'
        WHEN column_name = 'subscription_interval' THEN '📅 Billing Interval'
        ELSE '📝 ' || column_name
    END as description
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
