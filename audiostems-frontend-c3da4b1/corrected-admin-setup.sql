-- Corrected Admin Setup SQL - Copy and paste this into Supabase SQL Editor

-- Update Super Admin profile
UPDATE user_profiles 
SET 
  user_role = 'super_admin',
  subscription_type = 'enterprise',
  subscription_status = 'active',
  brand_id = 'msc_co',
  first_name = 'Super',
  last_name = 'Admin',
  updated_at = NOW()
WHERE id = '3e7a1dab-56ea-44be-88a5-d03e99c33641';

-- Update Company Admin profile
UPDATE user_profiles 
SET 
  user_role = 'company_admin',
  subscription_type = 'enterprise', 
  subscription_status = 'active',
  brand_id = 'msc_co',
  first_name = 'Company',
  last_name = 'Admin',
  updated_at = NOW()
WHERE id = 'fa0086b1-dbfb-4bf0-9ef8-8cc19905275f';

-- If profiles don't exist, create them (fallback)
INSERT INTO user_profiles (
  id, email, first_name, last_name, user_role, 
  subscription_type, subscription_status, brand_id, created_at, updated_at
) 
SELECT 
  au.id,
  au.email,
  'Super',
  'Admin', 
  'super_admin',
  'enterprise',
  'active',
  'msc_co',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.id = '3e7a1dab-56ea-44be-88a5-d03e99c33641'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = au.id);

INSERT INTO user_profiles (
  id, email, first_name, last_name, user_role,
  subscription_type, subscription_status, brand_id, created_at, updated_at
)
SELECT 
  au.id,
  au.email,
  'Company',
  'Admin',
  'company_admin', 
  'enterprise',
  'active',
  'msc_co',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.id = 'fa0086b1-dbfb-4bf0-9ef8-8cc19905275f'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = au.id);

-- Verify the setup
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
