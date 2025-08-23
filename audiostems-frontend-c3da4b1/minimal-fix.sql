-- Minimal fix - just add the essential columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'artist';

-- Update the admin users with basic info
UPDATE user_profiles 
SET 
  user_role = 'super_admin',
  first_name = 'Super',
  last_name = 'Admin'
WHERE id = '3e7a1dab-56ea-44be-88a5-d03e99c33641';

UPDATE user_profiles 
SET 
  user_role = 'company_admin',
  first_name = 'Company',
  last_name = 'Admin'
WHERE id = 'fa0086b1-dbfb-4bf0-9ef8-8cc19905275f';

-- Check results
SELECT id, email, first_name, last_name, user_role 
FROM user_profiles 
WHERE user_role IN ('super_admin', 'company_admin');
