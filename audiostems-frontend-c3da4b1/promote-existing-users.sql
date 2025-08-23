-- Promote existing users to admin roles
-- First, see all existing users:

SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  up.first_name,
  up.last_name,
  up.user_role,
  up.subscription_type
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at;

-- Promote a specific user to Super Admin (replace email)
UPDATE user_profiles 
SET 
  user_role = 'super_admin',
  subscription_type = 'enterprise',
  subscription_status = 'active',
  brand_id = 'msc_co',
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL@example.com';

-- Promote a specific user to Company Admin (replace email)  
UPDATE user_profiles
SET 
  user_role = 'company_admin',
  subscription_type = 'enterprise',
  subscription_status = 'active', 
  brand_id = 'msc_co',
  updated_at = NOW()
WHERE email = 'ANOTHER_EMAIL@example.com';

-- Verify the changes
SELECT 
  email,
  first_name,
  last_name,
  user_role,
  subscription_type,
  brand_id
FROM user_profiles 
WHERE user_role IN ('super_admin', 'company_admin');
