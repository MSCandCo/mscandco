-- 🚀 ENTERPRISE-GRADE SUPABASE SCHEMA
-- Professional, scalable, zero-compromise approach
-- Proper UUID references, custom ENUMs, RLS, and real-time triggers

-- Step 1: Drop existing user_profiles if it exists (clean slate)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 2: Create custom types for your 5-tier system
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS subscription_tier_enum CASCADE;

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

-- Step 3: Proper User Architecture - Link directly to Supabase auth system
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role user_role_enum NOT NULL DEFAULT 'artist',
  subscription_tier subscription_tier_enum,
  subscription_interval TEXT CHECK (subscription_interval IN ('monthly', 'yearly')),
  subscription_status TEXT DEFAULT 'inactive',
  company_name TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Performance indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Step 5: Real-Time Triggers
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Step 6: Auto-populate user_profiles when new users sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'artist');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Row Level Security (RLS) - Secure multi-tenant access
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data (except role changes)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

-- Super admins can see everything
CREATE POLICY "Super admins can view all" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Company admins can see users in their company (if company_name matches)
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

-- Service role (for webhooks) can manage all profiles
CREATE POLICY "Service role can manage all" ON user_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 8: Create sample data structure verification
SELECT 
  'Schema created successfully!' as status,
  count(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Step 9: Show final table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  CASE 
    WHEN column_name = 'id' THEN '🔑 Primary Key (UUID from auth.users)'
    WHEN column_name = 'role' THEN '👤 User Role (5-tier system)'
    WHEN column_name = 'subscription_tier' THEN '💎 Subscription Level'
    WHEN column_name = 'stripe_customer_id' THEN '💳 Stripe Integration'
    ELSE ''
  END as description
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
