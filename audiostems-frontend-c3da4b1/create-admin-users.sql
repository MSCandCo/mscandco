-- Create admin user profiles if they don't exist
-- First, let's check if the auth users exist

SELECT id, email FROM auth.users 
WHERE id IN ('3e7a1dab-56ea-44be-88a5-d03e99c33641', 'fa0086b1-dbfb-4bf0-9ef8-8cc19905275f');

-- Insert admin profiles if they don't exist
INSERT INTO user_profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  role,
  subscription_status,
  created_at, 
  updated_at
) 
VALUES 
(
  '3e7a1dab-56ea-44be-88a5-d03e99c33641',
  'superadmin@mscandco.com',
  'Super',
  'Admin',
  'super_admin',
  'active',
  NOW(),
  NOW()
),
(
  'fa0086b1-dbfb-4bf0-9ef8-8cc19905275f',
  'companyadmin@mscandco.com',
  'Company',
  'Admin',
  'company_admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  subscription_status = EXCLUDED.subscription_status,
  updated_at = NOW();

-- Verify the admin users were created
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  subscription_status,
  created_at
FROM user_profiles 
WHERE role IN ('super_admin', 'company_admin')
ORDER BY role;
