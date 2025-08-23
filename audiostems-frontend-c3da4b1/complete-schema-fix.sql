-- Complete schema fix for user_profiles table
-- Run this step by step in Supabase SQL Editor

-- STEP 1: Check what columns currently exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 2: Add all missing columns (run each line separately if needed)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'artist';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50) DEFAULT 'starter';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS brand_id VARCHAR(50) DEFAULT 'msc_co';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_role ON user_profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- STEP 4: Update admin users (only the existing columns first)
UPDATE user_profiles 
SET 
  user_role = 'super_admin',
  subscription_type = 'enterprise',
  subscription_status = 'active',
  brand_id = 'msc_co',
  updated_at = NOW()
WHERE id = '3e7a1dab-56ea-44be-88a5-d03e99c33641';

UPDATE user_profiles 
SET 
  user_role = 'company_admin',
  subscription_type = 'enterprise',
  subscription_status = 'active',
  brand_id = 'msc_co',
  updated_at = NOW()
WHERE id = 'fa0086b1-dbfb-4bf0-9ef8-8cc19905275f';

-- STEP 5: Update names if the profiles exist
UPDATE user_profiles 
SET 
  first_name = 'Super',
  last_name = 'Admin'
WHERE id = '3e7a1dab-56ea-44be-88a5-d03e99c33641';

UPDATE user_profiles 
SET 
  first_name = 'Company',
  last_name = 'Admin'
WHERE id = 'fa0086b1-dbfb-4bf0-9ef8-8cc19905275f';

-- STEP 6: Verify the results
SELECT 
  id,
  email,
  first_name,
  last_name,
  user_role,
  subscription_type,
  subscription_status,
  brand_id
FROM user_profiles 
WHERE user_role IN ('super_admin', 'company_admin')
ORDER BY user_role;
