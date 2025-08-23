-- Precise admin setup based on your current schema
-- Your table has 'role' column, not 'user_role'

-- Add missing columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Update Super Admin (using 'role' column, not 'user_role')
UPDATE user_profiles 
SET 
  role = 'super_admin',
  first_name = 'Super',
  last_name = 'Admin',
  updated_at = NOW()
WHERE id = '3e7a1dab-56ea-44be-88a5-d03e99c33641';

-- Update Company Admin
UPDATE user_profiles 
SET 
  role = 'company_admin',
  first_name = 'Company',
  last_name = 'Admin',
  updated_at = NOW()
WHERE id = 'fa0086b1-dbfb-4bf0-9ef8-8cc19905275f';

-- Verify the setup
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  subscription_status,
  created_at,
  updated_at
FROM user_profiles 
WHERE role IN ('super_admin', 'company_admin')
ORDER BY role;
